import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { TrafficLightRule } from '@/models/pms/configuration'
import { TrafficLightRuleSchema } from '@/models/pms/configuration'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import { trafficLightRulesStore } from '@/mocks/pms/traffic-light-rules-store'

export type TrafficLightRuleInput = Omit<
  TrafficLightRule,
  'Id' | 'OrganizationId' | 'UpdatedAt' | 'UpdatedBy'
> & { Id?: string }

export const TRAFFIC_LIGHT_METRIC_OPTIONS = [
  'KPI Achievement',
  'Project Progress',
  'On-time Delivery',
  'Appraisal Score',
  'Filing Compliance',
  'Scrap Rate',
]

export async function fetchTrafficLightRules(
  category?: TrafficLightRule['Category'],
): Promise<TrafficLightRule[]> {
  await randomDelay()
  return trafficLightRulesStore.list(category)
}

export async function saveTrafficLightRule(input: TrafficLightRuleInput): Promise<TrafficLightRule> {
  await randomDelay()
  const parsed = TrafficLightRuleSchema.safeParse({
    ...input,
    Id: input.Id ?? crypto.randomUUID(),
    OrganizationId: MOCK_ORGANIZATION_ID,
    UpdatedAt: new Date().toISOString(),
    UpdatedBy: MOCK_ADMIN_USER_ID,
  })
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? 'Validation failed', 400)
  }
  return trafficLightRulesStore.save(parsed.data)
}

export async function deleteTrafficLightRule(id: string): Promise<void> {
  await randomDelay()
  const existing = trafficLightRulesStore.getById(id)
  if (!existing) {
    throw new ApiError('Rule not found', 404)
  }
  trafficLightRulesStore.delete(id)
}

export function validateBandOverlap(
  bands: TrafficLightRule['Bands'],
): {
  ok: boolean
  message?: string
  fieldErrors?: Partial<Record<'green' | 'yellow' | 'red', string>>
} {
  const fieldErrors: Partial<Record<'green' | 'yellow' | 'red', string>> = {}

  for (const band of bands) {
    if (band.Min > band.Max) {
      fieldErrors[band.Color] = 'Min must be less than or equal to max'
    }
    if (band.Min < 0 && band.Color !== 'red') {
      fieldErrors[band.Color] = 'Min cannot be negative for this band'
    }
  }

  const sorted = [...bands].sort((a, b) => a.Min - b.Min)
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].Min <= sorted[i - 1].Max) {
      fieldErrors[sorted[i].Color] = 'Bands must not overlap'
      fieldErrors[sorted[i - 1].Color] = 'Bands must not overlap'
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: 'Fix band range errors before saving',
      fieldErrors,
    }
  }

  return { ok: true }
}
