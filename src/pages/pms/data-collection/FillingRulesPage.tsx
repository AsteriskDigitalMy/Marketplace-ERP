import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { FillingRuleDialog } from '@/components/pms/data-collection/FillingRuleDialog'
import {
  deleteFillingRule,
  fetchFillingRules,
  fetchFormTemplates,
  fetchManualFillIndicators,
  fetchPositionOptions,
  saveFillingRule,
  setFillingRuleActive,
} from '@/services/pms/data-collection/data-collection-service'
import type { FillingRule } from '@/services/pms/data-collection/data-collection-service'

export default function FillingRulesPage() {
  const { hasPermission } = usePmsAuth()
  const [rules, setRules] = useState<FillingRule[]>([])
  const [indicators, setIndicators] = useState<{ Id: string; Code: string; Name: string }[]>([])
  const [templates, setTemplates] = useState<{ Id: string; Name: string }[]>([])
  const [positions, setPositions] = useState<{ Id: string; Name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [cycleFilter, setCycleFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FillingRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FillingRule | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [r, ind, tpl, pos] = await Promise.all([
        fetchFillingRules(),
        fetchManualFillIndicators(),
        fetchFormTemplates(),
        fetchPositionOptions(),
      ])
      setRules(r)
      setIndicators(ind)
      setTemplates(tpl.map((t) => ({ Id: t.Id, Name: t.Name })))
      setPositions(pos)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = rules.filter((r) => {
    if (cycleFilter !== 'all' && r.Cycle !== cycleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.IndicatorName.toLowerCase().includes(q) ||
        r.TargetPositionNames.some((n) => n.toLowerCase().includes(q))
      )
    }
    return true
  })

  const handleSave = async (values: Parameters<typeof saveFillingRule>[0]) => {
    await saveFillingRule(values)
    toast.success('Filling rule saved')
    await load()
  }

  return (
    <PermissionGate allowed={hasPermission('data.manage')}>
      <PageHeader
        title="Filling rules"
        description="Configure periodic data-filling rules for manual and mixed KPI indicators."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
            disabled={indicators.length === 0}
          >
            <Plus className="mr-2 size-4" />
            Add rule
          </Button>
        }
      />

      {indicators.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No manual-fill indicators configured.{' '}
          <Link to="/pms/kpi/indicators/new" className="underline">
            Create a KPI indicator
          </Link>{' '}
          with manual or mixed data source first.
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search indicator or position…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={cycleFilter} onValueChange={setCycleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cycles</SelectItem>
            {(['daily', 'weekly', 'monthly', 'quarterly', 'annual'] as const).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && filtered.length === 0}
        emptyTitle="No filling rules"
        onRetry={load}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Indicator</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Positions</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Due offset</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rule) => (
              <TableRow key={rule.Id}>
                <TableCell>{rule.IndicatorName}</TableCell>
                <TableCell className="capitalize">{rule.Cycle}</TableCell>
                <TableCell className="max-w-[180px] truncate" title={rule.TargetPositionNames.join(', ')}>
                  {rule.TargetPositionNames.join(', ')}
                </TableCell>
                <TableCell>{rule.TemplateName}</TableCell>
                <TableCell>{rule.DueOffsetDays}d</TableCell>
                <TableCell>
                  <Switch
                    checked={rule.IsActive}
                    onCheckedChange={(v) => {
                      void setFillingRuleActive(rule.Id, v).then(() => {
                        toast.success(v ? 'Rule enabled' : 'Rule disabled')
                        void load()
                      })
                    }}
                  />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(rule)
                      setDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="light" size="sm" onClick={() => setDeleteTarget(rule)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AsyncState>

      <FillingRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        indicators={indicators}
        templates={templates}
        positions={positions}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete filling rule?</AlertDialogTitle>
            <AlertDialogDescription>
              Disabled rules stop generating new tasks. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return
                void deleteFillingRule(deleteTarget.Id).then(() => {
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
