import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { KpiIndicator } from '@/models/pms/kpi'
import type { FormulaValidationResult } from '@/models/pms/kpi'
import { kpiStore, type KpiIndicatorUsage } from '@/mocks/pms/kpi-store'
import type { KpiIndicatorVersion } from '@/models/pms/kpi'

export async function fetchKpiIndicators(filters?: {
  search?: string
  category?: string
  status?: KpiIndicator['Status']
}): Promise<KpiIndicator[]> {
  await randomDelay()
  let list = kpiStore.getIndicators()
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (i) => i.Code.toLowerCase().includes(q) || i.Name.toLowerCase().includes(q),
    )
  }
  if (filters?.category) {
    list = list.filter((i) => i.Category === filters.category)
  }
  if (filters?.status) {
    list = list.filter((i) => i.Status === filters.status)
  }
  return list
}

export async function fetchKpiIndicator(id: string): Promise<KpiIndicator> {
  await randomDelay()
  const indicator = kpiStore.getIndicatorById(id)
  if (!indicator) {
    throw new ApiError('Indicator not found', 404)
  }
  return indicator
}

export async function checkKpiCodeUnique(
  code: string,
  excludeId?: string,
): Promise<boolean> {
  await randomDelay(150, 350)
  return !kpiStore.getIndicatorByCode(code, excludeId)
}

export async function createKpiIndicator(
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
): Promise<KpiIndicator> {
  await randomDelay()
  try {
    return kpiStore.createIndicator(input)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create failed'
    throw new ApiError(message, 400, message.includes('code') ? { Code: message } : {})
  }
}

export async function updateKpiIndicator(
  id: string,
  input: Partial<KpiIndicator>,
): Promise<KpiIndicator> {
  await randomDelay()
  try {
    return kpiStore.updateIndicator(id, input)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed'
    throw new ApiError(message, 400)
  }
}

export async function setKpiIndicatorStatus(
  id: string,
  status: KpiIndicator['Status'],
): Promise<KpiIndicator> {
  await randomDelay()
  try {
    return kpiStore.setIndicatorStatus(id, status)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Status change failed', 400)
  }
}

export async function deleteKpiIndicator(id: string): Promise<void> {
  await randomDelay()
  try {
    kpiStore.deleteIndicator(id)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Delete failed', 400)
  }
}

export async function fetchKpiIndicatorVersions(
  indicatorId: string,
): Promise<KpiIndicatorVersion[]> {
  await randomDelay()
  return kpiStore.getIndicatorVersions(indicatorId)
}

export async function fetchKpiIndicatorUsage(indicatorId: string): Promise<KpiIndicatorUsage> {
  await randomDelay(200, 400)
  return kpiStore.getIndicatorUsage(indicatorId)
}

export async function fetchKpiCategories(): Promise<string[]> {
  await randomDelay(150, 300)
  return kpiStore.getKpiCategories()
}

export async function validateKpiFormula(
  formula: string,
  selfCode?: string,
): Promise<FormulaValidationResult> {
  await randomDelay(400, 800)
  return kpiStore.validateFormula(formula, selfCode)
}

export async function fetchFormulaPalette() {
  await randomDelay(200, 400)
  return {
    indicators: kpiStore.getEnabledIndicatorsForPalette(),
    parameters: kpiStore.getSystemParametersForPalette(),
    functions: kpiStore.getMathFunctions(),
  }
}
