import type { PerformanceGrade } from '@/models/common/enums'
import type { AppraisalScheme } from '@/models/pms/operations'
import { getStatusColor } from '@/lib/pms/traffic-light'

export const APPRAISAL_DEPARTMENT_OPTIONS = [
  { Id: '10000000-0000-0000-0000-000000000002', Name: 'Cutting Department' },
  { Id: '10000000-0000-0000-0000-000000000003', Name: 'Sewing Department' },
  { Id: '10000000-0000-0000-0000-000000000004', Name: 'Logistics' },
]

export const APPRAISAL_ROLE_OPTIONS = [
  { Id: '20000000-0000-0000-0000-000000000001', Name: 'Line Supervisor' },
  { Id: '20000000-0000-0000-0000-000000000002', Name: 'Department Manager' },
  { Id: '20000000-0000-0000-0000-000000000003', Name: 'Operator' },
]

export const APPRAISAL_PROJECT_TYPES = ['production', 'logistics', 'quality', 'maintenance']

export const DEFAULT_GRADE_RULES: AppraisalScheme['GradeRules'] = [
  { Grade: 'A', MinScore: 90, MaxScore: 100 },
  { Grade: 'B', MinScore: 80, MaxScore: 89.99 },
  { Grade: 'C', MinScore: 70, MaxScore: 79.99 },
  { Grade: 'D', MinScore: 0, MaxScore: 69.99 },
]

export function sumIndicatorWeights(indicators: AppraisalScheme['Indicators']): number {
  return indicators.reduce((sum, i) => sum + i.WeightPct, 0)
}

export function validateGradeRules(rules: AppraisalScheme['GradeRules']): string | null {
  const sorted = [...rules].sort((a, b) => a.MinScore - b.MinScore)
  for (const rule of sorted) {
    if (rule.MinScore > rule.MaxScore) {
      return `Grade ${rule.Grade}: min cannot exceed max`
    }
  }
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].MinScore <= sorted[i - 1].MaxScore) {
      return 'Grade ranges must not overlap'
    }
  }
  return null
}

export function gradeColorClass(grade: PerformanceGrade): string {
  const score = grade === 'A' ? 95 : grade === 'B' ? 85 : grade === 'C' ? 75 : 60
  const color = getStatusColor(score, 'performance')
  if (color === 'green') return 'bg-emerald-500/15 text-emerald-700'
  if (color === 'yellow') return 'bg-amber-500/15 text-amber-700'
  return 'bg-red-500/15 text-red-700'
}

export function cycleLabel(cycle: AppraisalScheme['Cycle']): string {
  const map: Record<AppraisalScheme['Cycle'], string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    semi_annual: 'Semi-annual',
    annual: 'Annual',
  }
  return map[cycle]
}

export function schemeStatusBadge(status: AppraisalScheme['Status']) {
  if (status === 'active') return 'default' as const
  if (status === 'archived') return 'secondary' as const
  return 'outline' as const
}
