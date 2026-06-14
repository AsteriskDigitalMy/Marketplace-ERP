import type { KpiIndicator, KpiIndicatorVersion } from '@/models/pms/kpi'
import type { FormulaValidationResult } from '@/models/pms/kpi'
import {
  MOCK_ADMIN_USER_ID,
  MOCK_ORGANIZATION_ID,
} from '@/lib/pms/constants'
import { pmsStore } from '@/mocks/pms/store'

function nowIso(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function auditFields() {
  const ts = nowIso()
  return {
    OrganizationId: MOCK_ORGANIZATION_ID,
    CreatedBy: MOCK_ADMIN_USER_ID,
    CreatedDatetime: ts,
    ModifiedBy: MOCK_ADMIN_USER_ID,
    ModifiedDatetime: ts,
  }
}

const kpiIndicators: KpiIndicator[] = [
  {
    Id: '30000000-0000-0000-0000-000000000001',
    Code: 'LEATHER_YIELD_RATE',
    Name: 'Leather Yield Rate',
    Category: 'Production Quality',
    StatisticalScope: 'Plant-wide qualified output vs total processed volume',
    Formula: 'ROUND((QUALIFIED_QTY / TOTAL_QTY) * 100, 2)',
    TargetValue: 95,
    ChallengeValue: 98,
    BaselineValue: 92,
    Cycle: 'monthly',
    EvaluationObject: 'department',
    DataSource: 'auto',
    WeightPct: 25,
    AlertThreshold: 90,
    Version: 'V1.0',
    Status: 'enabled',
    IsCoreLocked: true,
    HasCalculationHistory: true,
    ...auditFields(),
  },
  {
    Id: '30000000-0000-0000-0000-000000000002',
    Code: 'ON_TIME_DELIVERY',
    Name: 'On-Time Delivery Rate',
    Category: 'Supply Chain',
    StatisticalScope: 'Orders delivered on or before committed date',
    Formula: 'ROUND((ON_TIME_COUNT / TOTAL_ORDERS) * 100, 2)',
    TargetValue: 92,
    ChallengeValue: 96,
    BaselineValue: 88,
    Cycle: 'weekly',
    EvaluationObject: 'department',
    DataSource: 'mixed',
    WeightPct: 20,
    AlertThreshold: 85,
    Version: 'V1.0',
    Status: 'enabled',
    IsCoreLocked: false,
    HasCalculationHistory: false,
    ...auditFields(),
  },
  {
    Id: '30000000-0000-0000-0000-000000000003',
    Code: 'SCRAP_RATE',
    Name: 'Scrap Rate',
    Category: 'Production Quality',
    StatisticalScope: 'Scrapped units as percentage of total production',
    Formula: 'ROUND((SCRAP_QTY / TOTAL_QTY) * 100, 2)',
    TargetValue: 3,
    ChallengeValue: 2,
    BaselineValue: 5,
    Cycle: 'daily',
    EvaluationObject: 'individual',
    DataSource: 'manual',
    WeightPct: 15,
    AlertThreshold: 5,
    Version: 'V1.0',
    Status: 'disabled',
    IsCoreLocked: false,
    HasCalculationHistory: false,
    ...auditFields(),
  },
]

const kpiIndicatorVersions: KpiIndicatorVersion[] = [
  {
    IndicatorId: '30000000-0000-0000-0000-000000000001',
    Version: 'V1.0',
    ChangedAt: nowIso(),
    ChangedBy: MOCK_ADMIN_USER_ID,
    Summary: 'Initial core industry KPI definition',
    HasCalculationHistory: true,
    Snapshot: { ...kpiIndicators[0] },
  },
]

export interface KpiIndicatorUsage {
  IndicatorId: string
  ActiveProjects: number
  AppraisalSchemes: number
  LastCalculatedAt: string | null
  References: { EntityType: string; EntityId: string; Label: string }[]
}

const kpiUsage: KpiIndicatorUsage[] = [
  {
    IndicatorId: '30000000-0000-0000-0000-000000000001',
    ActiveProjects: 2,
    AppraisalSchemes: 1,
    LastCalculatedAt: nowIso(),
    References: [
      { EntityType: 'project', EntityId: 'proj-001', Label: 'Q2 Yield Improvement' },
      { EntityType: 'scheme', EntityId: 'scheme-001', Label: '2026 Q1 Appraisal' },
    ],
  },
  {
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    ActiveProjects: 1,
    AppraisalSchemes: 0,
    LastCalculatedAt: null,
    References: [
      { EntityType: 'project', EntityId: 'proj-002', Label: 'OTD Excellence Program' },
    ],
  },
  {
    IndicatorId: '30000000-0000-0000-0000-000000000003',
    ActiveProjects: 0,
    AppraisalSchemes: 0,
    LastCalculatedAt: null,
    References: [],
  },
]

export const INDUSTRY_FORMULA_TEMPLATES: Record<string, { label: string; formula: string }> = {
  YIELD_RATE: {
    label: 'Leather Yield Rate',
    formula: 'ROUND((QUALIFIED_QTY / TOTAL_QTY) * 100, 2)',
  },
  ON_TIME_DELIVERY: {
    label: 'On-Time Delivery Rate',
    formula: 'ROUND((ON_TIME_COUNT / TOTAL_ORDERS) * 100, 2)',
  },
  SCRAP_RATE: {
    label: 'Scrap Rate',
    formula: 'ROUND((SCRAP_QTY / TOTAL_QTY) * 100, 2)',
  },
  OEE: {
    label: 'Overall Equipment Effectiveness',
    formula: 'ROUND(AVAILABILITY * PERFORMANCE * QUALITY * 100, 2)',
  },
}

const MATH_FUNCTIONS = ['SUM', 'AVG', 'MIN', 'MAX', 'IF', 'ROUND']

function bumpVersion(current: string): string {
  const match = /^V(\d+)\.(\d+)$/.exec(current)
  if (!match) {
    return 'V1.1'
  }
  const major = Number(match[1])
  const minor = Number(match[2]) + 1
  return `V${major}.${minor}`
}

function extractIndicatorRefs(formula: string): string[] {
  const refs = new Set<string>()
  kpiIndicators.forEach((ind) => {
    if (formula.includes(ind.Code)) {
      refs.add(ind.Code)
    }
  })
  return [...refs]
}

export const kpiStore = {
  getIndicators(): KpiIndicator[] {
    return kpiIndicators.map((i) => ({ ...i }))
  },

  getIndicatorById(id: string): KpiIndicator | undefined {
    return kpiIndicators.find((i) => i.Id === id)
  },

  getIndicatorByCode(code: string, excludeId?: string): KpiIndicator | undefined {
    return kpiIndicators.find(
      (i) => i.Code.toUpperCase() === code.toUpperCase() && i.Id !== excludeId,
    )
  },

  createIndicator(
    input: Omit<
      KpiIndicator,
      | 'Id'
      | 'Version'
      | 'Status'
      | 'IsCoreLocked'
      | 'HasCalculationHistory'
      | 'OrganizationId'
      | 'CreatedBy'
      | 'CreatedDatetime'
      | 'ModifiedBy'
      | 'ModifiedDatetime'
    >,
  ): KpiIndicator {
    if (kpiStore.getIndicatorByCode(input.Code)) {
      throw new Error('Indicator code already exists')
    }
    const indicator: KpiIndicator = {
      Id: newId(),
      ...input,
      Code: input.Code.toUpperCase(),
      Version: 'V1.0',
      Status: 'enabled',
      IsCoreLocked: false,
      HasCalculationHistory: false,
      ...auditFields(),
    }
    kpiIndicators.push(indicator)
    kpiIndicatorVersions.push({
      IndicatorId: indicator.Id,
      Version: 'V1.0',
      ChangedAt: nowIso(),
      ChangedBy: MOCK_ADMIN_USER_ID,
      Summary: 'Initial indicator created',
      HasCalculationHistory: false,
      Snapshot: { ...indicator },
    })
    kpiUsage.push({
      IndicatorId: indicator.Id,
      ActiveProjects: 0,
      AppraisalSchemes: 0,
      LastCalculatedAt: null,
      References: [],
    })
    return { ...indicator }
  },

  updateIndicator(
    id: string,
    input: Partial<KpiIndicator>,
  ): KpiIndicator {
    const index = kpiIndicators.findIndex((i) => i.Id === id)
    if (index === -1) {
      throw new Error('Indicator not found')
    }
    const current = kpiIndicators[index]
    if (input.Code && kpiStore.getIndicatorByCode(input.Code, id)) {
      throw new Error('Indicator code already exists')
    }
    const nextVersion = bumpVersion(current.Version)
    const updated: KpiIndicator = {
      ...current,
      ...input,
      Id: id,
      Code: current.IsCoreLocked ? current.Code : (input.Code ?? current.Code),
      Category: current.IsCoreLocked ? current.Category : (input.Category ?? current.Category),
      Formula: current.IsCoreLocked ? current.Formula : (input.Formula ?? current.Formula),
      Version: nextVersion,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    kpiIndicators[index] = updated
    kpiIndicatorVersions.unshift({
      IndicatorId: id,
      Version: nextVersion,
      ChangedAt: nowIso(),
      ChangedBy: MOCK_ADMIN_USER_ID,
      Summary: `Updated to ${nextVersion}`,
      HasCalculationHistory: current.HasCalculationHistory,
      Snapshot: { ...updated },
    })
    return { ...updated }
  },

  setIndicatorStatus(id: string, status: KpiIndicator['Status']): KpiIndicator {
    const index = kpiIndicators.findIndex((i) => i.Id === id)
    if (index === -1) {
      throw new Error('Indicator not found')
    }
    if (status === 'enabled' && kpiIndicators[index].Formula.trim() === '') {
      throw new Error('Cannot enable indicator with empty formula')
    }
    kpiIndicators[index] = {
      ...kpiIndicators[index],
      Status: status,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    return { ...kpiIndicators[index] }
  },

  deleteIndicator(id: string): void {
    const index = kpiIndicators.findIndex((i) => i.Id === id)
    if (index === -1) {
      throw new Error('Indicator not found')
    }
    if (kpiIndicators[index].HasCalculationHistory) {
      throw new Error('Cannot delete indicator with calculation history')
    }
    kpiIndicators.splice(index, 1)
    const versionIndexes = kpiIndicatorVersions
      .map((v, i) => (v.IndicatorId === id ? i : -1))
      .filter((i) => i >= 0)
      .reverse()
    versionIndexes.forEach((i) => kpiIndicatorVersions.splice(i, 1))
  },

  getIndicatorVersions(indicatorId: string): KpiIndicatorVersion[] {
    return kpiIndicatorVersions
      .filter((v) => v.IndicatorId === indicatorId)
      .sort((a, b) => b.ChangedAt.localeCompare(a.ChangedAt))
  },

  getIndicatorUsage(indicatorId: string): KpiIndicatorUsage {
    return (
      kpiUsage.find((u) => u.IndicatorId === indicatorId) ?? {
        IndicatorId: indicatorId,
        ActiveProjects: 0,
        AppraisalSchemes: 0,
        LastCalculatedAt: null,
        References: [],
      }
    )
  },

  getEnabledIndicatorsForPalette(): { Code: string; Name: string; IsEnabled: boolean }[] {
    return kpiIndicators.map((i) => ({
      Code: i.Code,
      Name: i.Name,
      IsEnabled: i.Status === 'enabled',
    }))
  },

  validateFormula(formula: string, selfCode?: string): FormulaValidationResult {
    const errors: string[] = []
    const trimmed = formula.trim()

    if (!trimmed) {
      return {
        IsValid: false,
        Errors: ['Formula is required'],
        SimulatedResult: null,
        ReferencedIndicators: [],
      }
    }

    if (!/[A-Z0-9_()+\-*/.,\s]+$/i.test(trimmed)) {
      errors.push('Formula contains invalid characters')
    }

    const refs = extractIndicatorRefs(trimmed)
    const referencedIndicators = refs.map((code) => {
      const ind = kpiStore.getIndicatorByCode(code)
      return {
        Code: code,
        Name: ind?.Name ?? code,
        IsEnabled: ind?.Status === 'enabled',
      }
    })

    if (selfCode && refs.includes(selfCode.toUpperCase())) {
      errors.push('Circular reference: formula cannot reference itself')
    }

    referencedIndicators.forEach((ref) => {
      if (!ref.IsEnabled) {
        errors.push(`Referenced indicator ${ref.Code} is disabled`)
      }
    })

    let simulatedResult: number | null = null
    if (errors.length === 0) {
      if (trimmed.includes('YIELD') || trimmed.includes('QUALIFIED')) {
        simulatedResult = 94.2
      } else if (trimmed.includes('ON_TIME')) {
        simulatedResult = 91.5
      } else if (trimmed.includes('SCRAP')) {
        simulatedResult = 2.8
      } else {
        simulatedResult = 87.3
      }
    }

    return {
      IsValid: errors.length === 0,
      Errors: errors,
      SimulatedResult: simulatedResult,
      ReferencedIndicators: referencedIndicators,
    }
  },

  getKpiCategories(): string[] {
    const dict = pmsStore.getDictionaries().find((d) => d.Code === 'kpi_category')
    if (dict) {
      return dict.Items.filter((i) => i.IsEnabled).map((i) => i.DisplayName)
    }
    return ['Production Quality', 'Supply Chain', 'Cost Efficiency', 'Safety']
  },

  getSystemParametersForPalette(): { Code: string; Name: string }[] {
    return pmsStore.getParameters().map((p) => ({ Code: p.Code, Name: p.Name }))
  },

  getMathFunctions(): string[] {
    return [...MATH_FUNCTIONS]
  },
}
