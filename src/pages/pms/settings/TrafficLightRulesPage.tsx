import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { TrafficLightRuleDialog } from '@/components/pms/settings/TrafficLightRuleDialog'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { MOCK_ADMIN_USER_ID } from '@/lib/pms/constants'
import type { TrafficLightRule } from '@/models/pms/configuration'
import {
  deleteTrafficLightRule,
  fetchTrafficLightRules,
} from '@/services/pms/settings/traffic-light-service'

function formatBand(bands: TrafficLightRule['Bands'], color: 'green' | 'yellow' | 'red') {
  const band = bands.find((b) => b.Color === color)
  if (!band) return '—'
  return `${band.Min} – ${band.Max}`
}

function formatUpdatedBy(userId: string): string {
  return userId === MOCK_ADMIN_USER_ID ? 'System Administrator' : userId.slice(0, 8)
}

export default function TrafficLightRulesPage() {
  const { hasPermission } = usePmsAuth()
  const [rules, setRules] = useState<TrafficLightRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<TrafficLightRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TrafficLightRule | null>(null)

  const load = async () => {
    setError(null)
    try {
      const list = await fetchTrafficLightRules(
        category === 'all' ? undefined : (category as TrafficLightRule['Category']),
      )
      setRules(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [category])

  return (
    <PermissionGate
      allowed={hasPermission('settings.manage')}
      backHref="/pms/cockpit"
      backLabel="Back to cockpit"
    >
      <PageHeader
        title="Traffic Light Rules"
        description="Global color threshold standards for progress, delay, and performance indicators across dashboards and lists."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setEditorOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            Add rule
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="delay">Delay</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AsyncState loading={loading} error={error} onRetry={() => void load()}>
        {rules.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <p className="text-sm text-muted-foreground">No traffic light rules configured.</p>
            <Button className="mt-4" onClick={() => setEditorOpen(true)}>
              Add rule
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Green</TableHead>
                  <TableHead>Yellow</TableHead>
                  <TableHead>Red</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.Id}>
                    <TableCell>
                      <Badge variant="secondary">{rule.Category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rule.MetricScope.length === 0
                        ? 'Global'
                        : rule.MetricScope.join(', ')}
                    </TableCell>
                    <TableCell>{formatBand(rule.Bands, 'green')}</TableCell>
                    <TableCell>{formatBand(rule.Bands, 'yellow')}</TableCell>
                    <TableCell>{formatBand(rule.Bands, 'red')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(rule.UpdatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatUpdatedBy(rule.UpdatedBy)}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                          setEditing(rule)
                          setEditorOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive-solid"
                        size="sm"
                        onClick={() => setDeleteTarget(rule)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </AsyncState>

      <TrafficLightRuleDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={editing}
        onSaved={() => {
          setEditorOpen(false)
          void load()
          toast.success('Rules saved — dashboards will update on next load')
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete traffic light rule?</AlertDialogTitle>
            <AlertDialogDescription>
              Dashboards will revert to defaults for this category on next load.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive-solid"
              onClick={() => {
                if (!deleteTarget) return
                void deleteTrafficLightRule(deleteTarget.Id).then(() => {
                  toast.success('Rule deleted')
                  setDeleteTarget(null)
                  void load()
                })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
