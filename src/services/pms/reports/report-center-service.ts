import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import {
  formatPeriodLabel,
  isFuturePeriod,
  periodKeyForCycle,
} from '@/lib/pms/report-helpers'
import { appraisalWorkflowStore } from '@/mocks/pms/appraisal-workflow-store'
import { reportCenterStore } from '@/mocks/pms/report-center-store'
import {
  GeneratedReportSchema,
  type GeneratedReport,
  type ReportCatalogItem,
  type ReportCycle,
} from '@/models/pms/operations'

export interface ReportReadinessResult {
  ready: boolean
  readinessPct: number
  missingSources: string[]
}

export interface GenerateReportInput {
  reportId: string
  cycle: ReportCycle
  periodValue: string
}

const GENERATION_STEPS = [
  'Validating archived data…',
  'Aggregating KPI data…',
  'Building tabular sections…',
  'Finalizing report layout…',
]

export async function fetchReportCatalog(): Promise<ReportCatalogItem[]> {
  await randomDelay()
  return reportCenterStore.listCatalog()
}

export async function checkReportReadiness(
  reportId: string,
  cycle: ReportCycle,
  periodValue: string,
): Promise<ReportReadinessResult> {
  await randomDelay(200, 400)
  if (isFuturePeriod(cycle, periodValue)) {
    return {
      ready: false,
      readinessPct: 0,
      missingSources: ['Selected period is in the future'],
    }
  }

  const periodKey = periodKeyForCycle(cycle, periodValue)
  const base = reportCenterStore.checkReadiness(reportId, cycle, periodKey)

  const item = reportCenterStore.getCatalogItem(reportId)
  if (item?.Id === 'a1000000-0000-0000-0000-000000000007') {
    const published = appraisalWorkflowStore
      .getRecords()
      .some((r) => r.Status === 'published')
    if (!published && base.ready) {
      return {
        ready: false,
        readinessPct: 55,
        missingSources: ['No published appraisal cycle — complete executive final review first'],
      }
    }
  }

  return base
}

export async function generateReport(
  input: GenerateReportInput,
  onProgress?: (step: string, pct: number) => void,
): Promise<GeneratedReport> {
  const item = reportCenterStore.getCatalogItem(input.reportId)
  if (!item) throw new ApiError('Report not found', 404)
  if (!item.SupportedCycles.includes(input.cycle)) {
    throw new ApiError('Selected cycle is not supported for this report', 400)
  }
  if (isFuturePeriod(input.cycle, input.periodValue)) {
    throw new ApiError('Cannot generate reports for future periods', 400)
  }

  const readiness = await checkReportReadiness(input.reportId, input.cycle, input.periodValue)
  if (!readiness.ready) {
    throw new ApiError('Data not ready for selected period', 400)
  }

  for (let i = 0; i < GENERATION_STEPS.length; i++) {
    onProgress?.(GENERATION_STEPS[i], Math.round(((i + 1) / GENERATION_STEPS.length) * 100))
    await randomDelay(300, 500)
  }

  const periodLabel = formatPeriodLabel(input.cycle, input.periodValue)
  const report = reportCenterStore.buildMockReport(item, input.cycle, periodLabel)
  const parsed = GeneratedReportSchema.safeParse(report)
  if (!parsed.success) {
    throw new ApiError('Failed to build report', 500)
  }

  reportCenterStore.markGenerated(input.reportId, parsed.data.GeneratedAt)
  return parsed.data
}

export function getGenerationSteps(): string[] {
  return [...GENERATION_STEPS]
}

export async function mockExportReport(report: GeneratedReport, format: 'pdf' | 'excel'): Promise<string> {
  await randomDelay(400, 700)
  const ext = format === 'pdf' ? 'pdf' : 'xlsx'
  return `${report.ReportName.replace(/[^a-z0-9]+/gi, '_')}_${report.PeriodLabel.replace(/[^a-z0-9]+/gi, '_')}.${ext}`
}
