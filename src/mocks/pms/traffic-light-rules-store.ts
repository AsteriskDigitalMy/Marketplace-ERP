import type { TrafficLightRule } from '@/models/pms/configuration'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

const DEFAULT_RULES: TrafficLightRule[] = [
  {
    Id: '60000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Category: 'progress',
    MetricScope: [],
    Bands: [
      { Color: 'green', Min: 90, Max: 100 },
      { Color: 'yellow', Min: 70, Max: 89.99 },
      { Color: 'red', Min: 0, Max: 69.99 },
    ],
    UpdatedAt: hoursAgo(48),
    UpdatedBy: MOCK_ADMIN_USER_ID,
  },
  {
    Id: '60000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Category: 'delay',
    MetricScope: [],
    Bands: [
      { Color: 'green', Min: 0, Max: 0 },
      { Color: 'yellow', Min: 1, Max: 7 },
      { Color: 'red', Min: 8, Max: 365 },
    ],
    UpdatedAt: hoursAgo(24),
    UpdatedBy: MOCK_ADMIN_USER_ID,
  },
  {
    Id: '60000000-0000-0000-0000-000000000003',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Category: 'performance',
    MetricScope: [],
    Bands: [
      { Color: 'green', Min: 85, Max: 100 },
      { Color: 'yellow', Min: 70, Max: 84.99 },
      { Color: 'red', Min: 0, Max: 69.99 },
    ],
    UpdatedAt: hoursAgo(12),
    UpdatedBy: MOCK_ADMIN_USER_ID,
  },
]

let rules: TrafficLightRule[] = [...DEFAULT_RULES]

export const trafficLightRulesStore = {
  list(category?: TrafficLightRule['Category']): TrafficLightRule[] {
    if (!category) return [...rules]
    return rules.filter((r) => r.Category === category)
  },

  getById(id: string): TrafficLightRule | undefined {
    return rules.find((r) => r.Id === id)
  },

  save(input: Omit<TrafficLightRule, 'UpdatedAt'> & { UpdatedAt?: string }): TrafficLightRule {
    const now = new Date().toISOString()
    const existing = rules.findIndex((r) => r.Id === input.Id)
    const record: TrafficLightRule = {
      ...input,
      UpdatedAt: input.UpdatedAt ?? now,
    }
    if (existing >= 0) {
      rules[existing] = record
    } else {
      rules.push(record)
    }
    return record
  },

  delete(id: string): void {
    rules = rules.filter((r) => r.Id !== id)
  },

  reset(): void {
    rules = [...DEFAULT_RULES]
  },
}
