import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import {
  ALERT_CONDITION_FIELDS,
  ALERT_MONITORED_OBJECTS,
  isRuleComplete,
} from '@/lib/pms/alert-helpers'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import type { AlertLevel } from '@/models/common/enums'
import type { AlertRule } from '@/models/pms/operations'
import { AlertRuleSchema } from '@/models/pms/operations'
import { alertRulesStore } from '@/mocks/pms/alert-rules-store'

export type AlertRuleInput = Omit<AlertRule, 'Id' | 'OrganizationId' | 'LastTriggeredAt'> & {
  Id?: string
}

export interface AlertRuleFilters {
  type?: AlertRule['Type'] | 'all'
  level?: AlertLevel | 'all'
  enabled?: 'all' | 'yes' | 'no'
  search?: string
}

export { ALERT_CONDITION_FIELDS, ALERT_MONITORED_OBJECTS }

export async function fetchAlertRules(filters?: AlertRuleFilters): Promise<AlertRule[]> {
  await randomDelay()
  let list = alertRulesStore.list()
  if (filters?.type && filters.type !== 'all') {
    list = list.filter((r) => r.Type === filters.type)
  }
  if (filters?.level && filters.level !== 'all') {
    list = list.filter((r) => r.Level === filters.level)
  }
  if (filters?.enabled === 'yes') {
    list = list.filter((r) => r.IsEnabled)
  }
  if (filters?.enabled === 'no') {
    list = list.filter((r) => !r.IsEnabled)
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter((r) => r.Name.toLowerCase().includes(q))
  }
  return list
}

export async function fetchAlertRule(id: string): Promise<AlertRule> {
  await randomDelay()
  const rule = alertRulesStore.getById(id)
  if (!rule) throw new ApiError('Alert rule not found', 404)
  return rule
}

export async function saveAlertRule(input: AlertRuleInput): Promise<AlertRule> {
  await randomDelay()
  if (alertRulesStore.isNameTaken(input.Name, input.Id)) {
    throw new ApiError('Rule name must be unique', 400)
  }
  if (input.Channels.length === 0) {
    throw new ApiError('Select at least one channel', 400)
  }
  const parsed = AlertRuleSchema.safeParse({
    ...input,
    Id: input.Id ?? crypto.randomUUID(),
    OrganizationId: MOCK_ORGANIZATION_ID,
    LastTriggeredAt: input.Id ? alertRulesStore.getById(input.Id)?.LastTriggeredAt ?? null : null,
  })
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? 'Validation failed', 400)
  }
  const saved = alertRulesStore.save(parsed.data)
  for (const channel of saved.Channels) {
    console.info(`[mock alert delivery] ${channel} queued for rule "${saved.Name}"`)
  }
  return saved
}

export async function deleteAlertRule(id: string): Promise<void> {
  await randomDelay()
  if (!alertRulesStore.getById(id)) throw new ApiError('Alert rule not found', 404)
  alertRulesStore.delete(id)
}

export async function toggleAlertRule(id: string, enabled: boolean): Promise<AlertRule> {
  await randomDelay()
  const rule = alertRulesStore.getById(id)
  if (!rule) throw new ApiError('Alert rule not found', 404)
  if (enabled && !isRuleComplete(rule)) {
    throw new ApiError('Complete rule configuration first', 400)
  }
  return alertRulesStore.save({ ...rule, IsEnabled: enabled })
}

export async function bulkSetAlertRulesEnabled(ids: string[], enabled: boolean): Promise<void> {
  await randomDelay()
  for (const id of ids) {
    const rule = alertRulesStore.getById(id)
    if (!rule) continue
    if (enabled && !isRuleComplete(rule)) continue
    alertRulesStore.save({ ...rule, IsEnabled: enabled })
  }
}

export async function duplicateAlertRule(id: string): Promise<AlertRule> {
  await randomDelay()
  const rule = alertRulesStore.getById(id)
  if (!rule) throw new ApiError('Alert rule not found', 404)
  const copy: AlertRule = {
    ...rule,
    Id: crypto.randomUUID(),
    Name: `${rule.Name} (copy)`,
    IsEnabled: false,
    LastTriggeredAt: null,
  }
  return alertRulesStore.save(copy)
}
