import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { AlertChannelIcons } from '@/components/pms/alerts/AlertChannelIcons'
import { AlertLevelBadge } from '@/components/pms/alerts/AlertLevelBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { alertTypeLabel } from '@/lib/pms/alert-helpers'
import type { AlertLevel } from '@/models/common/enums'
import type { AlertRule } from '@/models/pms/operations'
import {
  bulkSetAlertRulesEnabled,
  deleteAlertRule,
  duplicateAlertRule,
  fetchAlertRules,
  toggleAlertRule,
} from '@/services/pms/alerts/alert-rule-service'

export default function AlertRulesPage() {
  const { hasPermission } = usePmsAuth()
  const navigate = useNavigate()
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string>('all')
  const [level, setLevel] = useState<string>('all')
  const [enabled, setEnabled] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<AlertRule | null>(null)
  const [bulkDisableOpen, setBulkDisableOpen] = useState(false)

  const load = async () => {
    setError(null)
    try {
      const list = await fetchAlertRules({
        type: type as AlertRule['Type'] | 'all',
        level: level as AlertLevel | 'all',
        enabled: enabled as 'all' | 'yes' | 'no',
        search,
      })
      setRules(list)
      setSelected(new Set())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [type, level, enabled, search])

  const allSelected = useMemo(
    () => rules.length > 0 && rules.every((r) => selected.has(r.Id)),
    [rules, selected],
  )

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(rules.map((r) => r.Id)))
  }

  const handleToggle = async (rule: AlertRule, next: boolean) => {
    try {
      await toggleAlertRule(rule.Id, next)
      toast.success(next ? 'Rule enabled' : 'Rule disabled')
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Toggle failed')
      void load()
    }
  }

  const runBulkEnable = async (value: boolean) => {
    const ids = [...selected]
    if (ids.length === 0) return
    try {
      await bulkSetAlertRulesEnabled(ids, value)
      toast.success(value ? 'Rules enabled' : 'Rules disabled')
      setBulkDisableOpen(false)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk update failed')
    }
  }

  return (
    <PermissionGate allowed={hasPermission('alerts.manage')}>
      <PageHeader
        title="Alert Rules"
        description="Configure exception alert trigger conditions for KPI, project, and filing monitors."
        actions={
          <Button asChild>
            <Link to="/pms/alerts/rules/new">
              <Plus className="mr-2 size-4" />
              Create rule
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="kpi">KPI</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="filing">Filing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={enabled} onValueChange={setEnabled}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Enabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Enabled</SelectItem>
            <SelectItem value="no">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="max-w-xs"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {selected.size > 0 ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2">
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          <Button size="sm" variant="light" onClick={() => void runBulkEnable(true)}>
            Enable
          </Button>
          <Button size="sm" variant="light" onClick={() => setBulkDisableOpen(true)}>
            Disable
          </Button>
        </div>
      ) : null}

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={rules.length === 0}>
        <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead>Rule name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Monitored object</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Last triggered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.Id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(rule.Id)}
                      onCheckedChange={(c) => {
                        setSelected((prev) => {
                          const next = new Set(prev)
                          if (c) next.add(rule.Id)
                          else next.delete(rule.Id)
                          return next
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{rule.Name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{alertTypeLabel(rule.Type)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.MonitoredObjectLabel}
                  </TableCell>
                  <TableCell>
                    <AlertLevelBadge level={rule.Level} />
                  </TableCell>
                  <TableCell>
                    <AlertChannelIcons channels={rule.Channels} />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.IsEnabled}
                      onCheckedChange={(v) => void handleToggle(rule, v)}
                      aria-label={`Toggle ${rule.Name}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.LastTriggeredAt
                      ? new Date(rule.LastTriggeredAt).toLocaleString()
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="light" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/pms/alerts/rules/${rule.Id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            void duplicateAlertRule(rule.Id).then(() => {
                              toast.success('Rule duplicated')
                              void load()
                            })
                          }
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(rule)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete alert rule?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing alerts triggered by this rule will be retained.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive-solid"
              onClick={() => {
                if (!deleteTarget) return
                void deleteAlertRule(deleteTarget.Id).then(() => {
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

      <AlertDialog open={bulkDisableOpen} onOpenChange={setBulkDisableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable selected rules?</AlertDialogTitle>
            <AlertDialogDescription>
              Monitoring will pause for selected rules until re-enabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void runBulkEnable(false)}>Disable</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
