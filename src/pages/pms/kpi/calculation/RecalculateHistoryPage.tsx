import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { RecalculationRequest } from '@/models/pms/kpi'
import {
  fetchRecalculationHistory,
  getRecalculationScopeLabel,
} from '@/services/pms/kpi/calculation-service'

function statusBadge(status: RecalculationRequest['Status']) {
  const variant =
    status === 'completed'
      ? 'default'
      : status === 'failed'
        ? 'destructive'
        : status === 'running'
          ? 'secondary'
          : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}

function formatTs(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export default function RecalculateHistoryPage() {
  const { hasPermission } = usePmsAuth()
  const [history, setHistory] = useState<RecalculationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scopeFilter, setScopeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const list = await fetchRecalculationHistory({
        scope:
          scopeFilter === 'all'
            ? undefined
            : (scopeFilter as RecalculationRequest['Scope']),
        status:
          statusFilter === 'all'
            ? undefined
            : (statusFilter as RecalculationRequest['Status']),
      })
      setHistory(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [scopeFilter, statusFilter])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  return (
    <PermissionGate allowed={hasPermission('kpi.calculate')}>
      <PageHeader
        title="Re-calculation history"
        description="Audit trail of manual KPI re-calculation runs."
        actions={
          <Button asChild variant="light" size="sm">
            <Link to="/pms/kpi/calculation/recalculate">Back to panel</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-4">
        <Select value={scopeFilter} onValueChange={setScopeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scopes</SelectItem>
            <SelectItem value="indicator">Designated indicator</SelectItem>
            <SelectItem value="cycle">Designated cycle</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={!loading && !error && history.length === 0}
        emptyTitle="No re-calculation history"
        emptyDescription="Manual re-calculation runs will appear here."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run ID</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Overwritten</TableHead>
              <TableHead>History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((row) => (
              <Fragment key={row.Id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === row.Id ? null : row.Id)}
                >
                  <TableCell className="font-mono text-xs">{row.Id.slice(0, 8)}…</TableCell>
                  <TableCell>{getRecalculationScopeLabel(row)}</TableCell>
                  <TableCell>{formatTs(row.StartedAt)}</TableCell>
                  <TableCell>{formatTs(row.CompletedAt)}</TableCell>
                  <TableCell>{statusBadge(row.Status)}</TableCell>
                  <TableCell>{row.OverwrittenCount}</TableCell>
                  <TableCell>
                    {row.HistoryRetained ? (
                      <Archive className="size-4 text-muted-foreground" aria-label="History retained" />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
                {expandedId === row.Id ? (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/30 text-xs text-muted-foreground">
                      Mock log: scope={row.Scope}, progress={row.ProgressPct}%, operator=
                      {row.StartedBy.slice(0, 8)}…
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </AsyncState>
    </PermissionGate>
  )
}
