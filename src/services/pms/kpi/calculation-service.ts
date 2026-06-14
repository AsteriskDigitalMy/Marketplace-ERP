import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { KpiCalculationJob, RecalculationRequest } from '@/models/pms/kpi'
import {
  kpiCalculationStore,
  type CalculationJobFilters,
  type RecalculationFilters,
  type StartRecalculationInput,
} from '@/mocks/pms/kpi-calculation-store'

export type { CalculationJobFilters, RecalculationFilters, StartRecalculationInput }

export interface JobListSummary {
  total: number
  success: number
  partial: number
  failed: number
  nextScheduledRun: string
}

export function summarizeJobResults(job: KpiCalculationJob): {
  total: number
  success: number
  anomaly: number
  error: number
} {
  const total = job.Results.length
  const success = job.Results.filter((r) => r.Status === 'ok').length
  const anomaly = job.Results.filter((r) => r.Status === 'anomaly').length
  const error = job.Results.filter((r) => r.Status === 'error').length
  return { total, success, anomaly, error }
}

export function formatJobDuration(job: KpiCalculationJob): string | null {
  if (!job.CompletedAt) return null
  const ms = new Date(job.CompletedAt).getTime() - new Date(job.ScheduledAt).getTime()
  if (ms < 1000) return `${ms}ms`
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec}s`
  return `${Math.floor(sec / 60)}m ${sec % 60}s`
}

export async function fetchCalculationJobs(
  filters?: CalculationJobFilters,
): Promise<KpiCalculationJob[]> {
  await randomDelay()
  return kpiCalculationStore.getJobs(filters)
}

export async function fetchCalculationJobSummary(): Promise<JobListSummary> {
  await randomDelay(150, 300)
  const counts = kpiCalculationStore.getJobSummary24h()
  return {
    ...counts,
    nextScheduledRun: kpiCalculationStore.getNextScheduledRun(),
  }
}

export async function fetchCalculationJob(id: string): Promise<KpiCalculationJob> {
  await randomDelay(150, 400)
  const job = kpiCalculationStore.getJobById(id)
  if (!job) {
    throw new ApiError('Calculation job not found', 404)
  }
  return job
}

export async function fetchCalculationJobErrorLog(id: string): Promise<string> {
  await randomDelay(150, 300)
  const log = kpiCalculationStore.getErrorLog(id)
  if (log === null) {
    throw new ApiError('Calculation job not found', 404)
  }
  return log
}

export async function pollAnomalyAlert(
  jobId: string,
): Promise<{ jobId: string; count: number } | null> {
  await randomDelay(50, 100)
  const alert = kpiCalculationStore.consumeAnomalyAlert(jobId)
  if (!alert) return null
  return { jobId, count: alert.count }
}

export async function fetchRecalculationHistory(
  filters?: RecalculationFilters,
): Promise<RecalculationRequest[]> {
  await randomDelay()
  return kpiCalculationStore.getRecalculations(filters)
}

export async function fetchRecalculation(id: string): Promise<RecalculationRequest> {
  await randomDelay(150, 300)
  const req = kpiCalculationStore.getRecalculationById(id)
  if (!req) {
    throw new ApiError('Recalculation request not found', 404)
  }
  return req
}

export async function fetchActiveRecalculation(): Promise<RecalculationRequest | null> {
  await randomDelay(100, 200)
  return kpiCalculationStore.getActiveRecalculation()
}

export async function fetchLatestRecalculation(): Promise<RecalculationRequest | null> {
  await randomDelay(100, 200)
  return kpiCalculationStore.getLatestCompletedRecalculation()
}

export type StartRecalculationResult = RecalculationRequest & { QueuedBehind?: boolean }

export async function startRecalculation(
  input: Omit<StartRecalculationInput, 'StartedBy'> & { StartedBy: string },
): Promise<StartRecalculationResult> {
  await randomDelay(200, 400)
  if (input.Scope === 'indicator' && !input.IndicatorId) {
    throw new ApiError('Select an indicator for designated indicator scope', 400)
  }
  if (input.Scope === 'cycle' && !input.CycleLabel) {
    throw new ApiError('Select a cycle period for designated cycle scope', 400)
  }
  const active = kpiCalculationStore.getActiveRecalculation()
  const req = kpiCalculationStore.startRecalculation(input)
  return { ...req, QueuedBehind: active ? true : undefined }
}

export async function retryRecalculation(
  id: string,
  startedBy: string,
): Promise<RecalculationRequest> {
  await randomDelay(200, 400)
  try {
    return kpiCalculationStore.retryRecalculation(id, startedBy)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Retry failed', 400)
  }
}

export function getRecalculationScopeLabel(req: RecalculationRequest): string {
  return kpiCalculationStore.getScopeLabel(req)
}

export function getEstimatedRemaining(pct: number): string {
  if (pct >= 100) return 'Complete'
  const remainingSec = Math.max(1, Math.round(((100 - pct) / 100) * 10))
  return `~${remainingSec}s remaining`
}
