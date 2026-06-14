import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { RecalculationRequest } from '@/models/pms/kpi'
import { fetchKpiIndicators } from '@/services/pms/kpi/kpi-service'
import {
  fetchActiveRecalculation,
  fetchLatestRecalculation,
  getEstimatedRemaining,
  retryRecalculation,
  startRecalculation,
} from '@/services/pms/kpi/calculation-service'

const CYCLE_OPTIONS = [
  '2026-Q1 monthly',
  '2026-Q1 weekly',
  '2026-W24 daily',
  '2025-Q4 monthly',
]

export default function ManualRecalculatePage() {
  const { userId, hasPermission } = usePmsAuth()
  const [scope, setScope] = useState<'all' | 'indicator' | 'cycle'>('all')
  const [indicatorId, setIndicatorId] = useState('')
  const [cycleLabel, setCycleLabel] = useState('')
  const [indicators, setIndicators] = useState<{ Id: string; Name: string }[]>([])
  const [active, setActive] = useState<RecalculationRequest | null>(null)
  const [latest, setLatest] = useState<RecalculationRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [failedJob, setFailedJob] = useState<RecalculationRequest | null>(null)
  const toastedCompleteId = useRef<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [inds, act, last] = await Promise.all([
        fetchKpiIndicators({ status: 'enabled' }),
        fetchActiveRecalculation(),
        fetchLatestRecalculation(),
      ])
      setIndicators(inds.map((i) => ({ Id: i.Id, Name: i.Name })))
      setActive(act)
      setLatest(last)
      if (last?.Status === 'failed') setFailedJob(last)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => void load(), 2000)
    return () => clearInterval(timer)
  }, [active, load])

  useEffect(() => {
    if (active?.Status === 'completed' && active.Id !== toastedCompleteId.current) {
      toastedCompleteId.current = active.Id
      toast.success(`Re-calculation complete. ${active.OverwrittenCount} value(s) overwritten.`)
      setActive(null)
      void load()
    }
  }, [active, load])

  const handleStart = async () => {
    if (scope === 'indicator' && !indicatorId) {
      toast.error('Select an indicator')
      return
    }
    if (scope === 'cycle' && !cycleLabel) {
      toast.error('Select a cycle period')
      return
    }
    setSubmitting(true)
    setFailedJob(null)
    try {
      const result = await startRecalculation({
        Scope: scope,
        IndicatorId: scope === 'indicator' ? indicatorId : null,
        CycleLabel: scope === 'cycle' ? cycleLabel : null,
        StartedBy: userId,
      })
      if (result.QueuedBehind) {
        toast.info('Job queued behind current run.')
      }
      setActive(result)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = async () => {
    if (!failedJob) return
    setSubmitting(true)
    try {
      const result = await retryRecalculation(failedJob.Id, userId)
      setFailedJob(null)
      setActive(result)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Retry failed')
    } finally {
      setSubmitting(false)
    }
  }

  const isRunning = active?.Status === 'queued' || active?.Status === 'running'

  return (
    <PermissionGate allowed={hasPermission('kpi.calculate')}>
      <PageHeader
        title="Manual Re-calculation"
        description="Trigger targeted or full-volume KPI re-calculation after data corrections."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/pms/kpi/calculation/recalculate/history">
              <History className="mr-2 size-4" />
              View history
            </Link>
          </Button>
        }
      />

      {isRunning ? (
        <Alert className="mb-4 border-primary/30">
          <Loader2 className="size-4 animate-spin" />
          <AlertTitle>Re-calculation in progress</AlertTitle>
          <AlertDescription>
            You can navigate away — progress continues in the background.
          </AlertDescription>
        </Alert>
      ) : null}

      {failedJob ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Last re-calculation failed</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              Partial overwrite: {failedJob.OverwrittenCount} value(s) before failure.
            </span>
            <Button size="sm" variant="outline" onClick={() => void handleRetry()} disabled={submitting}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <AsyncState loading={loading}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scope</CardTitle>
              <CardDescription>Choose what to re-calculate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={scope}
                onValueChange={(v) => setScope(v as typeof scope)}
                disabled={isRunning}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="all" id="scope-all" />
                  <Label htmlFor="scope-all">All indicators</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="indicator" id="scope-indicator" />
                  <Label htmlFor="scope-indicator">Designated indicator</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cycle" id="scope-cycle" />
                  <Label htmlFor="scope-cycle">Designated cycle</Label>
                </div>
              </RadioGroup>

              {scope === 'indicator' ? (
                <Select value={indicatorId} onValueChange={setIndicatorId} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicators.map((ind) => (
                      <SelectItem key={ind.Id} value={ind.Id}>
                        {ind.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              {scope === 'cycle' ? (
                <Select value={cycleLabel} onValueChange={setCycleLabel} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle / period" />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLE_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              <Button onClick={() => void handleStart()} disabled={isRunning || submitting}>
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Start re-calculation
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {active ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    Active job
                    <Badge variant="secondary">{active.Status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Progress value={active.ProgressPct} />
                  <p>{active.ProgressPct}% — {getEstimatedRemaining(active.ProgressPct)}</p>
                  <p className="text-muted-foreground">
                    Started {new Date(active.StartedAt).toLocaleString()}
                  </p>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/pms/kpi/calculation/recalculate/history">View history</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {latest && latest.Status === 'completed' && !active ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Latest result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">{latest.OverwrittenCount}</span> value(s)
                    overwritten
                  </p>
                  <p className="text-muted-foreground">
                    Completed {latest.CompletedAt ? new Date(latest.CompletedAt).toLocaleString() : '—'}
                  </p>
                  {latest.HistoryRetained ? (
                    <Badge variant="outline">Previous run preserved — view history</Badge>
                  ) : null}
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link to="/pms/kpi/calculation/recalculate/history">View full history</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {latest?.Status === 'completed' && latest.OverwrittenCount === 0 && !active ? (
              <Alert>
                <AlertDescription>
                  Last run completed with zero overwrites — no approved data matched the scope.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
