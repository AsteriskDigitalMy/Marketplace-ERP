import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { JobStatusBadge } from '@/components/pms/kpi/calculation/JobStatusBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { KpiCalculationJob } from '@/models/pms/kpi'
import {
  fetchCalculationJobSummary,
  fetchCalculationJobs,
  formatJobDuration,
  pollAnomalyAlert,
  summarizeJobResults,
  type JobListSummary,
} from '@/services/pms/kpi/calculation-service'

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString()
}

export default function CalculationJobsPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [jobs, setJobs] = useState<KpiCalculationJob[]>([])
  const [summary, setSummary] = useState<JobListSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cycleFilter, setCycleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        fetchCalculationJobs({
          cycle: cycleFilter === 'all' ? undefined : cycleFilter,
          status:
            statusFilter === 'all'
              ? undefined
              : (statusFilter as KpiCalculationJob['Status']),
        }),
        fetchCalculationJobSummary(),
      ])
      setJobs(list)
      setSummary(sum)

      for (const job of list) {
        if (job.Status === 'partial') {
          const alert = await pollAnomalyAlert(job.Id)
          if (alert) {
            toast.warning(`Batch job completed with ${alert.count} anomalies.`, {
              action: {
                label: 'View job',
                onClick: () => navigate(`/pms/kpi/calculation/jobs/${alert.jobId}`),
              },
            })
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [cycleFilter, statusFilter])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  useEffect(() => {
    if (!autoRefresh) return
    const hasRunning = jobs.some((j) => j.Status === 'running')
    if (!hasRunning) return
    const timer = setInterval(() => void load(), 30000)
    return () => clearInterval(timer)
  }, [autoRefresh, jobs, load])

  return (
    <PermissionGate allowed={hasPermission('kpi.calculate')}>
      <PageHeader
        title="KPI Calculation Jobs"
        description={
          summary
            ? `Next scheduled run: ${formatTs(summary.nextScheduledRun)}`
            : 'Scheduled batch calculation monitor'
        }
        actions={
          <Button variant="light" size="sm" onClick={() => void load()}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        {(['total', 'success', 'partial', 'failed'] as const).map((key) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize">
                {key === 'total' ? 'Jobs (24h)' : key}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span
                className={
                  key === 'failed'
                    ? 'text-2xl font-semibold text-destructive'
                    : key === 'partial'
                      ? 'text-2xl font-semibold text-amber-600'
                      : 'text-2xl font-semibold'
                }
              >
                {summary?.[key] ?? '—'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Select value={cycleFilter} onValueChange={setCycleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cycles</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
            Auto-refresh (30s)
          </Label>
        </div>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={!loading && !error && jobs.length === 0}
        emptyTitle="No calculation jobs"
        emptyDescription="Configure system parameters to enable scheduled batch calculation."
        emptyAction={
          <Button asChild variant="light">
            <Link to="/pms/admin/parameters">System parameters</Link>
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Indicators</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const counts = summarizeJobResults(job)
              const duration = formatJobDuration(job)
              return (
                <TableRow key={job.Id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{job.Id.slice(0, 8)}…</TableCell>
                  <TableCell className="capitalize">{job.Cycle}</TableCell>
                  <TableCell>
                    <div>{formatTs(job.ScheduledAt)}</div>
                    {duration ? (
                      <div className="text-xs text-muted-foreground">Duration: {duration}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <JobStatusBadge status={job.Status} />
                  </TableCell>
                  <TableCell>
                    {counts.total} / {counts.success} ok
                    {counts.anomaly > 0 ? ` / ${counts.anomaly} anomaly` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="light" size="sm">
                      <Link to={`/pms/kpi/calculation/jobs/${job.Id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </AsyncState>
    </PermissionGate>
  )
}
