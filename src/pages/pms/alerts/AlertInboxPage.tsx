import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AlertDeadlineBadge } from '@/components/pms/alerts/AlertDeadlineBadge'
import { AlertLevelBadge } from '@/components/pms/alerts/AlertLevelBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { alertTypeLabel } from '@/lib/pms/alert-helpers'
import type { AlertLevel } from '@/models/common/enums'
import type { AlertRecord } from '@/models/pms/operations'
import {
  effectiveLevel,
  fetchAlertRecords,
  getAlertSummaryCounts,
} from '@/services/pms/alerts/alert-record-service'

const STATUS_LABELS: Record<AlertRecord['Status'], string> = {
  open: 'Open',
  investigating: 'Investigating',
  rectifying: 'Rectifying',
  pending_verification: 'Pending verification',
  closed: 'Closed',
}

export default function AlertInboxPage() {
  const { hasPermission } = usePmsAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [records, setRecords] = useState<AlertRecord[]>([])
  const [allRecords, setAllRecords] = useState<AlertRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const status = searchParams.get('status') ?? 'all'
  const level = searchParams.get('level') ?? 'all'
  const type = searchParams.get('type') ?? 'all'
  const overdueOnly = searchParams.get('overdue') === '1'
  const search = searchParams.get('q') ?? ''

  const load = async () => {
    setError(null)
    try {
      const [list, all] = await Promise.all([
        fetchAlertRecords({
          status: status as AlertRecord['Status'] | 'all',
          level: level as AlertLevel | 'all',
          type: type as AlertRecord['Type'] | 'all',
          overdueOnly,
          search,
        }),
        fetchAlertRecords(),
      ])
      setRecords(list)
      setAllRecords(all)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [status, level, type, overdueOnly, search])

  const counts = useMemo(() => getAlertSummaryCounts(allRecords), [allRecords])

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  return (
    <PermissionGate allowed={hasPermission('alerts.view')}>
      <PageHeader
        title="Alerts"
        description="Triage exception alerts and complete closed-loop disposal."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="outline">Open: {counts.open}</Badge>
        <Badge variant="secondary">Overdue: {counts.overdue}</Badge>
        <Badge variant="destructive">Urgent: {counts.urgent}</Badge>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={(v) => setFilter('status', v)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="rectifying">Rectifying</SelectItem>
            <SelectItem value="pending_verification">Pending verification</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={(v) => setFilter('level', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => setFilter('type', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="kpi">KPI</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="filing">Filing</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={overdueOnly}
            onCheckedChange={(c) => {
              const next = new URLSearchParams(searchParams)
              if (c) next.set('overdue', '1')
              else next.delete('overdue')
              setSearchParams(next)
            }}
          />
          Overdue only
        </label>
        <Input
          className="max-w-xs"
          placeholder="Search ID or object…"
          value={search}
          onChange={(e) => setFilter('q', e.target.value)}
        />
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={records.length === 0}
        emptyTitle="No alerts"
        emptyDescription="No alerts match your filters."
      >
        <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert ID</TableHead>
                <TableHead>Type / object</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow
                  key={record.Id}
                  className={record.IsOverdue && record.Status !== 'closed' ? 'bg-destructive/5' : undefined}
                >
                  <TableCell>
                    <Link
                      to={`/pms/alerts/${record.Id}/disposal`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {record.Id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{record.MonitoredObjectLabel}</div>
                    <div className="text-xs text-muted-foreground">{alertTypeLabel(record.Type)}</div>
                  </TableCell>
                  <TableCell>
                    <AlertLevelBadge level={effectiveLevel(record)} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(record.TriggeredAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <AlertDeadlineBadge
                      deadlineAt={record.DeadlineAt}
                      isClosed={record.Status === 'closed'}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{STATUS_LABELS[record.Status]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">Owner</TableCell>
                  <TableCell className="text-right">
                    <Button variant="light" size="sm" asChild>
                      <Link to={`/pms/alerts/${record.Id}/disposal`}>
                        {record.Status === 'closed' ? 'View' : 'Dispose'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
