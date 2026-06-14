import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { DictionaryCategory, OperationLog } from '@/models/pms/configuration'
import type { SystemParameterRecord } from '@/mocks/pms/store'
import { pmsStore } from '@/mocks/pms/store'

export async function fetchDictionaries(): Promise<DictionaryCategory[]> {
  await randomDelay()
  return pmsStore.getDictionaries()
}

export async function updateDictionary(
  categoryCode: string,
  items: DictionaryCategory['Items'],
): Promise<DictionaryCategory> {
  await randomDelay()
  try {
    return pmsStore.updateDictionary(categoryCode, items)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Update failed', 400)
  }
}

export async function fetchOperationLogs(filters: {
  operator?: string
  businessType?: string
  from?: string
  to?: string
  ip?: string
}): Promise<OperationLog[]> {
  await randomDelay()
  return pmsStore.getOperationLogs(filters)
}

export async function fetchOperationLog(id: string): Promise<OperationLog> {
  await randomDelay(200, 400)
  const log = pmsStore.getOperationLogById(id)
  if (!log) {
    throw new ApiError('Log entry not found', 404)
  }
  return log
}

export async function fetchParameters(): Promise<SystemParameterRecord[]> {
  await randomDelay()
  return pmsStore.getParameters()
}

export async function updateParameter(
  code: string,
  value: string | number | boolean,
  effectiveAt: string,
): Promise<SystemParameterRecord> {
  await randomDelay()
  try {
    return pmsStore.updateParameter(code, value, effectiveAt)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Update failed', 400)
  }
}

export async function fetchActiveDepartments() {
  await randomDelay(150, 250)
  return pmsStore
    .getActiveOrgUnits()
    .filter((u) => u.TierType === 'department' || u.TierType === 'plant')
    .map((u) => ({ Id: u.Id, Name: u.Name }))
}
