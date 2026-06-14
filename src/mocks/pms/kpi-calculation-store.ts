import type { KpiCalculationJob, RecalculationRequest } from '@/models/pms/kpi'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import { kpiStore } from '@/mocks/pms/kpi-store'

function nowIso(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString()
}

const indicators = () => kpiStore.getIndicators().filter((i) => i.Status === 'enabled')

function buildResults(
  variant: 'success' | 'partial' | 'failed' | 'running',
): KpiCalculationJob['Results'] {
  const inds = indicators()
  if (variant === 'running') {
    return inds.slice(0, 1).map((ind) => ({
      IndicatorId: ind.Id,
      IndicatorName: ind.Name,
      Value: null,
      TargetValue: ind.TargetValue,
      Status: 'ok' as const,
      ErrorMessage: null,
    }))
  }
  if (variant === 'failed') {
    return inds.map((ind) => ({
      IndicatorId: ind.Id,
      IndicatorName: ind.Name,
      Value: null,
      TargetValue: ind.TargetValue,
      Status: 'error' as const,
      ErrorMessage: 'Formula evaluation failed: missing approved data for period',
    }))
  }
  return inds.map((ind, idx) => {
    if (variant === 'partial' && idx === inds.length - 1) {
      return {
        IndicatorId: ind.Id,
        IndicatorName: ind.Name,
        Value: null,
        TargetValue: ind.TargetValue,
        Status: 'error' as const,
        ErrorMessage: 'No approved data for selected period',
      }
    }
    const value =
      idx === 1 ? ind.TargetValue * 0.82 : idx === 2 ? ind.TargetValue * 1.02 : ind.TargetValue * 0.97
    const status: 'ok' | 'anomaly' | 'error' =
      idx === 1 ? 'anomaly' : idx === 2 && variant === 'partial' ? 'error' : 'ok'
    return {
      IndicatorId: ind.Id,
      IndicatorName: ind.Name,
      Value: status === 'error' ? null : Math.round(value * 100) / 100,
      TargetValue: ind.TargetValue,
      Status: status,
      ErrorMessage: status === 'error' ? 'Referenced indicator SCRAP_RATE is disabled' : null,
    }
  })
}

let jobs: KpiCalculationJob[] = [
  {
    Id: '50000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Cycle: 'monthly',
    ScheduledAt: hoursAgo(2),
    CompletedAt: hoursAgo(1.9),
    Status: 'success',
    Results: buildResults('success'),
  },
  {
    Id: '50000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Cycle: 'weekly',
    ScheduledAt: hoursAgo(6),
    CompletedAt: hoursAgo(5.8),
    Status: 'partial',
    Results: buildResults('partial'),
  },
  {
    Id: '50000000-0000-0000-0000-000000000003',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Cycle: 'daily',
    ScheduledAt: hoursAgo(12),
    CompletedAt: hoursAgo(11.9),
    Status: 'failed',
    Results: buildResults('failed'),
  },
  {
    Id: '50000000-0000-0000-0000-000000000004',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Cycle: 'monthly',
    ScheduledAt: minutesAgo(3),
    CompletedAt: null,
    Status: 'running',
    Results: buildResults('running'),
  },
]

let recalculations: RecalculationRequest[] = [
  {
    Id: '60000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Scope: 'all',
    IndicatorId: null,
    CycleLabel: null,
    Status: 'completed',
    ProgressPct: 100,
    StartedBy: MOCK_ADMIN_USER_ID,
    StartedAt: hoursAgo(48),
    CompletedAt: hoursAgo(47.9),
    OverwrittenCount: 12,
    HistoryRetained: true,
  },
  {
    Id: '60000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Scope: 'indicator',
    IndicatorId: '30000000-0000-0000-0000-000000000001',
    CycleLabel: null,
    Status: 'completed',
    ProgressPct: 100,
    StartedBy: MOCK_ADMIN_USER_ID,
    StartedAt: hoursAgo(24),
    CompletedAt: hoursAgo(23.95),
    OverwrittenCount: 1,
    HistoryRetained: true,
  },
  {
    Id: '60000000-0000-0000-0000-000000000003',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Scope: 'cycle',
    IndicatorId: null,
    CycleLabel: '2026-Q1 monthly',
    Status: 'failed',
    ProgressPct: 42,
    StartedBy: MOCK_ADMIN_USER_ID,
    StartedAt: hoursAgo(8),
    CompletedAt: hoursAgo(7.9),
    OverwrittenCount: 3,
    HistoryRetained: true,
  },
]

const runningJobStartedAt = new Map<string, number>()
const recalcStartedAt = new Map<string, number>()
const anomalyToastShown = new Set<string>()

export interface CalculationJobFilters {
  cycle?: string
  status?: KpiCalculationJob['Status']
  dateFrom?: string
  dateTo?: string
}

export interface RecalculationFilters {
  scope?: RecalculationRequest['Scope']
  status?: RecalculationRequest['Status']
  dateFrom?: string
  dateTo?: string
}

export interface StartRecalculationInput {
  Scope: RecalculationRequest['Scope']
  IndicatorId: string | null
  CycleLabel: string | null
  StartedBy: string
}

function advanceRunningJob(job: KpiCalculationJob): KpiCalculationJob {
  if (job.Status !== 'running') return job
  const started = runningJobStartedAt.get(job.Id) ?? Date.now()
  if (!runningJobStartedAt.has(job.Id)) {
    runningJobStartedAt.set(job.Id, started)
  }
  const elapsed = Date.now() - started
  if (elapsed < 8000) return job

  const hasAnomaly = true
  const updated: KpiCalculationJob = {
    ...job,
    Status: hasAnomaly ? 'partial' : 'success',
    CompletedAt: nowIso(),
    Results: buildResults('partial'),
  }
  const idx = jobs.findIndex((j) => j.Id === job.Id)
  if (idx >= 0) jobs[idx] = updated
  runningJobStartedAt.delete(job.Id)
  return updated
}

function advanceRecalculation(req: RecalculationRequest): RecalculationRequest {
  if (req.Status === 'completed' || req.Status === 'failed') return req

  const started = recalcStartedAt.get(req.Id) ?? Date.now()
  if (!recalcStartedAt.has(req.Id)) {
    recalcStartedAt.set(req.Id, started)
  }
  const elapsed = Date.now() - started

  if (req.Status === 'queued' && elapsed > 1500) {
    const running = { ...req, Status: 'running' as const, ProgressPct: 5 }
    const idx = recalculations.findIndex((r) => r.Id === req.Id)
    if (idx >= 0) recalculations[idx] = running
    return running
  }

  if (req.Status === 'running') {
    const pct = Math.min(95, Math.floor((elapsed / 10000) * 100))
    if (pct < 100 && elapsed < 10000) {
      const running = { ...req, ProgressPct: pct }
      const idx = recalculations.findIndex((r) => r.Id === req.Id)
      if (idx >= 0) recalculations[idx] = running
      return running
    }
    const completed: RecalculationRequest = {
      ...req,
      Status: 'completed',
      ProgressPct: 100,
      CompletedAt: nowIso(),
      OverwrittenCount:
        req.Scope === 'all' ? 12 : req.Scope === 'indicator' ? 1 : req.OverwrittenCount || 5,
      HistoryRetained: true,
    }
    const idx = recalculations.findIndex((r) => r.Id === req.Id)
    if (idx >= 0) recalculations[idx] = completed
    recalcStartedAt.delete(req.Id)
    return completed
  }

  return req
}

function buildErrorLog(job: KpiCalculationJob): string {
  const lines = [
    `[${job.ScheduledAt}] Batch calculation job ${job.Id}`,
    `Cycle: ${job.Cycle} | Status: ${job.Status}`,
    '---',
  ]
  job.Results.forEach((r) => {
    if (r.Status === 'error' || r.Status === 'anomaly') {
      lines.push(
        `[${r.Status.toUpperCase()}] ${r.IndicatorName} (${r.IndicatorId}): ${r.ErrorMessage ?? 'Value outside threshold'}`,
      )
    }
  })
  if (lines.length === 3) {
    lines.push('No errors or anomalies recorded.')
  }
  return lines.join('\n')
}

export const kpiCalculationStore = {
  getJobs(filters?: CalculationJobFilters): KpiCalculationJob[] {
    jobs = jobs.map((j) => (j.Status === 'running' ? advanceRunningJob(j) : j))
    let list = [...jobs]
    if (filters?.cycle) {
      list = list.filter((j) => j.Cycle === filters.cycle)
    }
    if (filters?.status) {
      list = list.filter((j) => j.Status === filters.status)
    }
    if (filters?.dateFrom) {
      list = list.filter((j) => j.ScheduledAt >= filters.dateFrom!)
    }
    if (filters?.dateTo) {
      list = list.filter((j) => j.ScheduledAt <= filters.dateTo!)
    }
    return list.sort((a, b) => b.ScheduledAt.localeCompare(a.ScheduledAt))
  },

  getJobById(id: string): KpiCalculationJob | undefined {
    const job = jobs.find((j) => j.Id === id)
    if (!job) return undefined
    if (job.Status === 'running') {
      const advanced = advanceRunningJob(job)
      return advanced
    }
    return job
  },

  getJobSummary24h(): { total: number; success: number; partial: number; failed: number } {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const recent = this.getJobs().filter((j) => j.ScheduledAt >= cutoff)
    return {
      total: recent.length,
      success: recent.filter((j) => j.Status === 'success').length,
      partial: recent.filter((j) => j.Status === 'partial').length,
      failed: recent.filter((j) => j.Status === 'failed').length,
    }
  },

  getNextScheduledRun(): string {
    const next = new Date()
    next.setHours(next.getHours() + 2, 0, 0, 0)
    return next.toISOString()
  },

  getErrorLog(jobId: string): string | null {
    const job = this.getJobById(jobId)
    if (!job) return null
    return buildErrorLog(job)
  },

  consumeAnomalyAlert(jobId: string): { count: number } | null {
    const job = this.getJobById(jobId)
    if (!job || job.Status === 'running') return null
    const anomalyCount = job.Results.filter((r) => r.Status === 'anomaly').length
    if (anomalyCount === 0) return null
    if (anomalyToastShown.has(jobId)) return null
    anomalyToastShown.add(jobId)
    return { count: anomalyCount }
  },

  getRecalculations(filters?: RecalculationFilters): RecalculationRequest[] {
    recalculations = recalculations.map((r) =>
      r.Status === 'queued' || r.Status === 'running' ? advanceRecalculation(r) : r,
    )
    let list = [...recalculations]
    if (filters?.scope) {
      list = list.filter((r) => r.Scope === filters.scope)
    }
    if (filters?.status) {
      list = list.filter((r) => r.Status === filters.status)
    }
    if (filters?.dateFrom) {
      list = list.filter((r) => r.StartedAt >= filters.dateFrom!)
    }
    if (filters?.dateTo) {
      list = list.filter((r) => r.StartedAt <= filters.dateTo!)
    }
    return list.sort((a, b) => b.StartedAt.localeCompare(a.StartedAt))
  },

  getRecalculationById(id: string): RecalculationRequest | undefined {
    const req = recalculations.find((r) => r.Id === id)
    if (!req) return undefined
    if (req.Status === 'queued' || req.Status === 'running') {
      return advanceRecalculation(req)
    }
    return req
  },

  getActiveRecalculation(): RecalculationRequest | null {
    const active = this.getRecalculations().find(
      (r) => r.Status === 'queued' || r.Status === 'running',
    )
    return active ?? null
  },

  getLatestCompletedRecalculation(): RecalculationRequest | null {
    return (
      this.getRecalculations().find((r) => r.Status === 'completed' || r.Status === 'failed') ??
      null
    )
  },

  startRecalculation(input: StartRecalculationInput): RecalculationRequest {
    const active = this.getActiveRecalculation()
    const req: RecalculationRequest = {
      Id: newId(),
      OrganizationId: MOCK_ORGANIZATION_ID,
      Scope: input.Scope,
      IndicatorId: input.IndicatorId,
      CycleLabel: input.CycleLabel,
      Status: active ? 'queued' : 'running',
      ProgressPct: active ? 0 : 5,
      StartedBy: input.StartedBy,
      StartedAt: nowIso(),
      CompletedAt: null,
      OverwrittenCount: 0,
      HistoryRetained: true,
    }
    recalculations.unshift(req)
    recalcStartedAt.set(req.Id, Date.now())
    if (!active && req.Status === 'running') {
      return advanceRecalculation(req)
    }
    return req
  },

  retryRecalculation(id: string, startedBy: string): RecalculationRequest {
    const prev = this.getRecalculationById(id)
    if (!prev) throw new Error('Recalculation not found')
    return this.startRecalculation({
      Scope: prev.Scope,
      IndicatorId: prev.IndicatorId,
      CycleLabel: prev.CycleLabel,
      StartedBy: startedBy,
    })
  },

  getScopeLabel(req: RecalculationRequest): string {
    if (req.Scope === 'all') return 'All indicators'
    if (req.Scope === 'indicator') {
      const ind = req.IndicatorId ? kpiStore.getIndicatorById(req.IndicatorId) : null
      return ind ? `Indicator: ${ind.Name}` : 'Designated indicator'
    }
    return req.CycleLabel ? `Cycle: ${req.CycleLabel}` : 'Designated cycle'
  },
}
