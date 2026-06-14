import type { AlertRule } from '@/models/pms/operations'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

const DEFAULT_RULES: AlertRule[] = [
  {
    Id: '70000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Name: 'KPI achievement below 80%',
    Type: 'kpi',
    MonitoredObjectId: '20000000-0000-0000-0000-000000000001',
    MonitoredObjectLabel: 'Monthly Output KPI',
    Condition: { Field: 'achievement_rate', Operator: '<', Value: 80 },
    Level: 'important',
    Channels: ['in_app', 'email'],
    IsEnabled: true,
    LastTriggeredAt: hoursAgo(6),
  },
  {
    Id: '70000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Name: 'Project milestone overdue',
    Type: 'project',
    MonitoredObjectId: '30000000-0000-0000-0000-000000000001',
    MonitoredObjectLabel: 'Spring Collection Launch',
    Condition: { Field: 'days_overdue', Operator: '>', Value: 3 },
    Level: 'urgent',
    Channels: ['in_app', 'email', 'sms'],
    IsEnabled: true,
    LastTriggeredAt: hoursAgo(2),
  },
  {
    Id: '70000000-0000-0000-0000-000000000003',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Name: 'Filing submission overdue',
    Type: 'filing',
    MonitoredObjectId: '40000000-0000-0000-0000-000000000001',
    MonitoredObjectLabel: 'Q1 Production Report',
    Condition: { Field: 'days_overdue', Operator: '>', Value: 0 },
    Level: 'general',
    Channels: ['in_app'],
    IsEnabled: true,
    LastTriggeredAt: hoursAgo(48),
  },
  {
    Id: '70000000-0000-0000-0000-000000000004',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Name: 'Budget variance alert',
    Type: 'project',
    MonitoredObjectId: '30000000-0000-0000-0000-000000000002',
    MonitoredObjectLabel: 'Warehouse Automation',
    Condition: { Field: 'budget_variance_pct', Operator: '>', Value: 10 },
    Level: 'important',
    Channels: ['in_app', 'email'],
    IsEnabled: false,
    LastTriggeredAt: null,
  },
]

let rules: AlertRule[] = [...DEFAULT_RULES]

export const alertRulesStore = {
  list(): AlertRule[] {
    return [...rules]
  },

  getById(id: string): AlertRule | undefined {
    return rules.find((r) => r.Id === id)
  },

  save(rule: AlertRule): AlertRule {
    const idx = rules.findIndex((r) => r.Id === rule.Id)
    if (idx >= 0) {
      rules[idx] = rule
    } else {
      rules.push(rule)
    }
    return rule
  },

  delete(id: string): void {
    rules = rules.filter((r) => r.Id !== id)
  },

  isNameTaken(name: string, excludeId?: string): boolean {
    return rules.some(
      (r) => r.Name.toLowerCase() === name.toLowerCase() && r.Id !== excludeId,
    )
  },

  reset(): void {
    rules = [...DEFAULT_RULES]
  },
}
