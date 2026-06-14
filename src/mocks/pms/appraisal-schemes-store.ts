import type { AppraisalScheme } from '@/models/pms/operations'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'

const DEFAULT_GRADES: AppraisalScheme['GradeRules'] = [
  { Grade: 'A', MinScore: 90, MaxScore: 100 },
  { Grade: 'B', MinScore: 80, MaxScore: 89.99 },
  { Grade: 'C', MinScore: 70, MaxScore: 79.99 },
  { Grade: 'D', MinScore: 0, MaxScore: 69.99 },
]

const DEFAULT_SCHEMES: AppraisalScheme[] = [
  {
    Id: '80000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Name: '2026 Q1 Plant Operations',
    Departments: ['10000000-0000-0000-0000-000000000002'],
    Roles: ['20000000-0000-0000-0000-000000000001'],
    ProjectTypes: ['production'],
    Cycle: 'quarterly',
    Indicators: [
      { KpiId: '30000000-0000-0000-0000-000000000001', KpiName: 'Leather Yield Rate', WeightPct: 40 },
      { KpiId: '30000000-0000-0000-0000-000000000002', KpiName: 'On-Time Delivery Rate', WeightPct: 35 },
      { KpiId: '30000000-0000-0000-0000-000000000003', KpiName: 'Scrap Rate', WeightPct: 25 },
    ],
    GradeRules: DEFAULT_GRADES,
    Status: 'active',
  },
  {
    Id: '80000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Name: '2026 Logistics Quarterly',
    Departments: ['10000000-0000-0000-0000-000000000003'],
    Roles: ['20000000-0000-0000-0000-000000000002'],
    ProjectTypes: ['logistics'],
    Cycle: 'quarterly',
    Indicators: [
      { KpiId: '30000000-0000-0000-0000-000000000002', KpiName: 'On-Time Delivery Rate', WeightPct: 60 },
      { KpiId: '30000000-0000-0000-0000-000000000001', KpiName: 'Leather Yield Rate', WeightPct: 40 },
    ],
    GradeRules: DEFAULT_GRADES,
    Status: 'draft',
  },
]

let schemes: AppraisalScheme[] = [...DEFAULT_SCHEMES]

function overlaps(a: AppraisalScheme, b: AppraisalScheme): boolean {
  if (a.Status !== 'active' || b.Status !== 'active' || a.Id === b.Id) return false
  const deptOverlap = a.Departments.some((d) => b.Departments.includes(d))
  const roleOverlap = a.Roles.some((r) => b.Roles.includes(r))
  return deptOverlap && roleOverlap && a.Cycle === b.Cycle
}

export const appraisalSchemesStore = {
  list(): AppraisalScheme[] {
    return [...schemes]
  },

  getById(id: string): AppraisalScheme | undefined {
    return schemes.find((s) => s.Id === id)
  },

  save(scheme: AppraisalScheme): AppraisalScheme {
    const idx = schemes.findIndex((s) => s.Id === scheme.Id)
    if (idx >= 0) schemes[idx] = scheme
    else schemes.push(scheme)
    return scheme
  },

  findConflicts(scheme: AppraisalScheme): AppraisalScheme[] {
    return schemes.filter((s) => overlaps(scheme, s))
  },

  reset(): void {
    schemes = [...DEFAULT_SCHEMES]
  },
}
