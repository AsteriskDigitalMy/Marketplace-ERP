import type { AppraisalCycle, AppraisalEmployeeRecord, AppraisalScheme } from '@/models/pms/operations'
import type { PerformanceGrade } from '@/models/common/enums'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import { appraisalSchemesStore } from '@/mocks/pms/appraisal-schemes-store'

const MOCK_EMPLOYEES = [
  { EmployeeId: 'E-1001', EmployeeName: 'Wei Lin', Department: 'Cutting', Role: 'Line Supervisor' },
  { EmployeeId: 'E-1002', EmployeeName: 'Anna Park', Department: 'Cutting', Role: 'Operator' },
  { EmployeeId: 'E-1003', EmployeeName: 'James Wu', Department: 'Cutting', Role: 'Operator' },
  { EmployeeId: 'E-2001', EmployeeName: 'Sara Chen', Department: 'Sewing', Role: 'Department Manager' },
  { EmployeeId: 'E-2002', EmployeeName: 'Mike Tan', Department: 'Sewing', Role: 'Operator' },
  { EmployeeId: 'E-3001', EmployeeName: 'Lisa Ho', Department: 'Logistics', Role: 'Coordinator' },
]

function assignGrade(score: number, rules: AppraisalScheme['GradeRules']): PerformanceGrade {
  for (const rule of rules) {
    if (score >= rule.MinScore && score <= rule.MaxScore) return rule.Grade
  }
  return 'D'
}

function buildIndicatorDetails(
  scheme: AppraisalScheme,
  seed: number,
): AppraisalEmployeeRecord['IndicatorDetails'] {
  return scheme.Indicators.map((ind, i) => {
    const raw = Math.min(100, Math.max(55, 70 + seed * 3 + i * 5))
    const weighted = (raw * ind.WeightPct) / 100
    return {
      KpiId: ind.KpiId,
      KpiName: ind.KpiName,
      RawScore: raw,
      WeightPct: ind.WeightPct,
      WeightedContribution: Math.round(weighted * 100) / 100,
      Target: 90,
      Actual: raw,
    }
  })
}

function generateRecords(cycle: AppraisalCycle, scheme: AppraisalScheme): AppraisalEmployeeRecord[] {
  return MOCK_EMPLOYEES.map((emp, idx) => {
    const details = buildIndicatorDetails(scheme, idx)
    const total = Math.round(details.reduce((s, d) => s + d.WeightedContribution, 0) * 10) / 10
    const grade = assignGrade(total, scheme.GradeRules)
    return {
      Id: crypto.randomUUID(),
      OrganizationId: MOCK_ORGANIZATION_ID,
      CycleId: cycle.Id,
      EmployeeId: emp.EmployeeId,
      EmployeeName: emp.EmployeeName,
      Department: emp.Department,
      Role: emp.Role,
      TotalScore: total,
      AutoGrade: grade,
      ConfirmedGrade: null,
      ReviewOpinion: null,
      Status: 'pending_preliminary',
      RoutingSource: null,
      IndicatorDetails: details,
      HrAssistanceSummary: null,
      HrAssistanceType: null,
      SecondaryOpinion: null,
      FinalOpinion: null,
      LinkedPdcaProposalId: null,
      ShuntingLog: [
        {
          At: new Date().toISOString(),
          Actor: 'System',
          Action: 'Generated',
          Detail: `Preliminary appraisal created for ${cycle.Label}`,
        },
      ],
    }
  })
}

const CYCLES: AppraisalCycle[] = [
  {
    Id: '81000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Label: '2026 Q1',
    SchemeId: '80000000-0000-0000-0000-000000000001',
    SchemeName: '2026 Q1 Plant Operations',
    PeriodStart: '2026-01-01T00:00:00.000Z',
    PeriodEnd: '2026-03-31T23:59:59.000Z',
    KpiCompletenessPct: 100,
    Status: 'ready',
  },
  {
    Id: '81000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Label: '2025 Q4',
    SchemeId: '80000000-0000-0000-0000-000000000001',
    SchemeName: '2026 Q1 Plant Operations',
    PeriodStart: '2025-10-01T00:00:00.000Z',
    PeriodEnd: '2025-12-31T23:59:59.000Z',
    KpiCompletenessPct: 100,
    Status: 'generated',
  },
]

let cycles = [...CYCLES]
let records: AppraisalEmployeeRecord[] = []

// Seed Q4 generated records
const q4Scheme = appraisalSchemesStore.getById('80000000-0000-0000-0000-000000000001')
if (q4Scheme) {
  records = generateRecords(cycles[1], q4Scheme)
  records[0] = {
    ...records[0],
    Status: 'pending_hr',
    ConfirmedGrade: 'D',
    ReviewOpinion: 'Low yield trend',
  }
  records[1] = {
    ...records[1],
    Status: 'pending_final_review',
    ConfirmedGrade: 'A',
    RoutingSource: 'direct_ab',
  }
  records[2] = {
    ...records[2],
    Status: 'hr_processed',
    ConfirmedGrade: 'C',
    HrAssistanceSummary: 'Completed coaching sessions on quality checks',
    HrAssistanceType: 'coaching',
  }
  records[3] = { ...records[3], Status: 'pending_preliminary' }
}

export const appraisalWorkflowStore = {
  getCycles(): AppraisalCycle[] {
    return [...cycles]
  },

  getCycle(id: string): AppraisalCycle | undefined {
    return cycles.find((c) => c.Id === id)
  },

  updateCycle(cycle: AppraisalCycle): AppraisalCycle {
    const idx = cycles.findIndex((c) => c.Id === cycle.Id)
    if (idx >= 0) cycles[idx] = cycle
    return cycle
  },

  getRecords(cycleId?: string): AppraisalEmployeeRecord[] {
    if (!cycleId) return [...records]
    return records.filter((r) => r.CycleId === cycleId)
  },

  getRecord(id: string): AppraisalEmployeeRecord | undefined {
    return records.find((r) => r.Id === id)
  },

  saveRecord(record: AppraisalEmployeeRecord): AppraisalEmployeeRecord {
    const idx = records.findIndex((r) => r.Id === record.Id)
    if (idx >= 0) records[idx] = record
    else records.push(record)
    return record
  },

  generateForCycle(cycleId: string): AppraisalEmployeeRecord[] {
    const cycle = cycles.find((c) => c.Id === cycleId)
    if (!cycle) throw new Error('Cycle not found')
    const scheme = appraisalSchemesStore.getById(cycle.SchemeId)
    if (!scheme) throw new Error('Scheme not found')
    const generated = generateRecords(cycle, scheme)
    records = records.filter((r) => r.CycleId !== cycleId).concat(generated)
    cycles = cycles.map((c) =>
      c.Id === cycleId ? { ...c, Status: 'generated' as const } : c,
    )
    return generated
  },

  appendShuntLog(record: AppraisalEmployeeRecord, action: string, detail: string, actor = 'Auditor') {
    record.ShuntingLog.push({
      At: new Date().toISOString(),
      Actor: actor,
      Action: action,
      Detail: detail,
    })
  },
}
