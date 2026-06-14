import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { JobStatusBadge } from '@/components/pms/kpi/calculation/JobStatusBadge'
import {
  ResultStatusBadge,
  TrafficLightDot,
  resultRowClass,
} from '@/components/pms/kpi/calculation/ResultStatusBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { KpiCalculationJob } from '@/models/pms/kpi'
import { formatVariancePct } from '@/lib/pms/traffic-light'
import {
  fetchCalculationJob,
  fetchCalculationJobErrorLog,
  formatJobDuration,
  summarizeJobResults,
} from '@/services/pms/kpi/calculation-service'

type ResultFilter = 'all' | 'ok' | 'anomaly' | 'error'

function formatTs(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export default function CalculationJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { hasPermission } = usePmsAuth()
  const [job, setJob] = useState<KpiCalculationJob | null>(null)
  const [errorLog, setErrorLog] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [logLoading, setLogLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')

  const loadJob = useCallback(async () => {
    if (!jobId) return
    setError(null)
    try {
      const data = await fetchCalculationJob(jobId)
      setJob(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  const loadLog = useCallback(async () => {
    if (!jobId) return
    setLogLoading(true)
    try {
      const log = await fetchCalculationJobErrorLog(jobId)
      setErrorLog(log)
    } catch {
      setErrorLog(null)
    } finally {
      setLogLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    setLoading(true)
    void loadJob()
  }, [loadJob])

  useEffect(() => {
    if (!job || job.Status !== 'running') return
    const timer = setInterval(() => void loadJob(), 3000)
    return () => clearInterval(timer)
  }, [job, loadJob])

  useEffect(() => {
    if (job && job.Status !== 'running') {
      void loadLog()
    }
  }, [job, loadLog])

  const downloadLog = () => {
    if (!errorLog || !jobId) return
    const blob = new Blob([errorLog], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calc-job-${jobId.slice(0, 8)}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  const counts = job ? summarizeJobResults(job) : null
  const filteredResults =
    job?.Results.filter((r) => resultFilter === 'all' || r.Status === resultFilter) ?? []

  const hasErrors = counts ? counts.error > 0 || counts.anomaly > 0 : false

  return (
    <PermissionGate allowed={hasPermission('kpi.calculate')}>
      <PageHeader
        title="Job Detail"
        description="Per-indicator calculation outcomes for this batch run."
      />

      <AsyncState loading={loading} error={error} onRetry={() => void loadJob()} empty={!job && !loading}>
        {job ? (
          <div className="space-y-6">
            {job.Status === 'running' ? (
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Calculation in progress…</p>
                    <Progress value={undefined} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {job.Status === 'failed' ? (
              <Alert variant="destructive">
                <AlertTitle>All indicators failed</AlertTitle>
                <AlertDescription>
                  This batch job could not compute any indicator values. Review the error log.
                </AlertDescription>
              </Alert>
            ) : null}

            {counts && counts.anomaly > 0 && job.Status !== 'running' ? (
              <Alert className="border-amber-500/50 bg-amber-500/5">
                <AlertTitle>Anomalies detected</AlertTitle>
                <AlertDescription>
                  {counts.anomaly} indicator(s) reported values outside expected thresholds.
                </AlertDescription>
              </Alert>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-3 text-base">
                  <span className="capitalize">{job.Cycle} cycle</span>
                  <JobStatusBadge status={job.Status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Started: </span>
                  {formatTs(job.ScheduledAt)}
                </div>
                <div>
                  <span className="text-muted-foreground">Completed: </span>
                  {formatTs(job.CompletedAt)}
                </div>
                <div>
                  <span className="text-muted-foreground">Duration: </span>
                  {formatJobDuration(job) ?? 'In progress'}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="results">
              <TabsList>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="log" disabled={!hasErrors && job.Status !== 'failed'}>
                  Error log
                </TabsTrigger>
              </TabsList>
              <TabsContent value="results" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'ok', 'anomaly', 'error'] as const).map((f) => (
                    <Button
                      key={f}
                      type="button"
                      size="sm"
                      variant={resultFilter === f ? 'default' : 'light'}
                      onClick={() => setResultFilter(f)}
                    >
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicator</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((r) => (
                      <TableRow key={r.IndicatorId} className={resultRowClass(r.Status)}>
                        <TableCell>
                          <Link
                            to={`/pms/kpi/indicators/${r.IndicatorId}`}
                            className="inline-flex items-center gap-2 font-medium hover:underline"
                          >
                            <TrafficLightDot value={r.Value} target={r.TargetValue} />
                            {r.IndicatorName}
                          </Link>
                        </TableCell>
                        <TableCell>{r.Value ?? '—'}</TableCell>
                        <TableCell>{r.TargetValue}</TableCell>
                        <TableCell>{formatVariancePct(r.Value, r.TargetValue)}</TableCell>
                        <TableCell>
                          <ResultStatusBadge
                            status={r.Status}
                            value={r.Value}
                            target={r.TargetValue}
                          />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                          {r.ErrorMessage ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{r.ErrorMessage}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">{r.ErrorMessage}</TooltipContent>
                            </Tooltip>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="log">
                <AsyncState loading={logLoading} skeleton={<div className="h-48" />}>
                  <div className="space-y-3">
                    <Button variant="light" size="sm" onClick={downloadLog}>
                      <Download className="mr-2 size-4" />
                      Download log
                    </Button>
                    <ScrollArea className="h-64 rounded-md border bg-muted/30 p-4">
                      <pre className="font-mono text-xs whitespace-pre-wrap">{errorLog}</pre>
                    </ScrollArea>
                  </div>
                </AsyncState>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
