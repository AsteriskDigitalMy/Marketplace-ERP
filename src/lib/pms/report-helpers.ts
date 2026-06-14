import type { GeneratedReport, ReportCatalogItem, ReportCategory, ReportCycle } from '@/models/pms/operations'

export const QUARTERLY_APPRAISAL_REPORT_ID = 'a1000000-0000-0000-0000-000000000007'

export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'production', label: 'Production' },
  { value: 'quality', label: 'Quality' },
  { value: 'supply_chain', label: 'Supply chain' },
  { value: 'performance', label: 'Performance' },
  { value: 'cost', label: 'Cost' },
]

export const REPORT_CYCLE_LABELS: Record<ReportCycle, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
}

export const REPORT_OUTPUT_FORMATS = [
  { value: 'preview' as const, label: 'Preview' },
  { value: 'pdf' as const, label: 'PDF' },
  { value: 'excel' as const, label: 'Excel' },
]

export type ReportOutputFormat = (typeof REPORT_OUTPUT_FORMATS)[number]['value']

export function reportCategoryLabel(category: ReportCategory): string {
  return REPORT_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function periodKeyForCycle(cycle: ReportCycle, periodValue: string): string {
  switch (cycle) {
    case 'daily':
      return periodValue
    case 'weekly':
      return periodValue
    case 'monthly':
      return periodValue
    case 'quarterly':
      return periodValue
  }
}

export function formatPeriodLabel(cycle: ReportCycle, periodValue: string): string {
  switch (cycle) {
    case 'daily':
      return new Date(periodValue).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    case 'weekly': {
      const start = new Date(periodValue)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return `Week of ${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
    }
    case 'monthly': {
      const [y, m] = periodValue.split('-')
      const date = new Date(Number(y), Number(m) - 1, 1)
      return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    }
    case 'quarterly':
      return periodValue.replace('-', ' ')
  }
}

export function defaultPeriodValue(cycle: ReportCycle): string {
  const now = new Date()
  switch (cycle) {
    case 'daily':
      return now.toISOString().slice(0, 10)
    case 'weekly': {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(now)
      monday.setDate(diff)
      return monday.toISOString().slice(0, 10)
    }
    case 'monthly':
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    case 'quarterly': {
      const q = Math.floor(now.getMonth() / 3) + 1
      return `${now.getFullYear()}-Q${q}`
    }
  }
}

export function isFuturePeriod(cycle: ReportCycle, periodValue: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  switch (cycle) {
    case 'daily':
      return new Date(periodValue) > today
    case 'weekly':
      return new Date(periodValue) > today
    case 'monthly': {
      const [y, m] = periodValue.split('-').map(Number)
      const end = new Date(y, m, 0)
      return end > today
    }
    case 'quarterly': {
      const [yearStr, qStr] = periodValue.split('-Q')
      const year = Number(yearStr)
      const q = Number(qStr)
      const endMonth = q * 3
      const end = new Date(year, endMonth, 0)
      return end > today
    }
  }
}

export function mockExportFilename(report: GeneratedReport, ext: 'pdf' | 'xlsx'): string {
  const safe = report.ReportName.replace(/[^a-z0-9]+/gi, '_')
  const period = report.PeriodLabel.replace(/[^a-z0-9]+/gi, '_')
  return `${safe}_${period}.${ext}`
}

export function findCatalogItem(
  catalog: ReportCatalogItem[],
  reportId: string | null,
): ReportCatalogItem | undefined {
  if (!reportId) return undefined
  return catalog.find((r) => r.Id === reportId)
}
