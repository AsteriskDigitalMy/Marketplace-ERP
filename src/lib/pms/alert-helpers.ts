import type { AlertChannel, AlertLevel } from '@/models/common/enums'
import type { AlertRule } from '@/models/pms/operations'

export const ALERT_MONITORED_OBJECTS: Record<
  AlertRule['Type'],
  { Id: string; Label: string }[]
> = {
  kpi: [
    { Id: '20000000-0000-0000-0000-000000000001', Label: 'Monthly Output KPI' },
    { Id: '20000000-0000-0000-0000-000000000002', Label: 'Quality Yield KPI' },
    { Id: '20000000-0000-0000-0000-000000000003', Label: 'On-time Delivery KPI' },
  ],
  project: [
    { Id: '30000000-0000-0000-0000-000000000001', Label: 'Spring Collection Launch' },
    { Id: '30000000-0000-0000-0000-000000000002', Label: 'Warehouse Automation' },
    { Id: '30000000-0000-0000-0000-000000000003', Label: 'Cutting Line Upgrade' },
  ],
  filing: [
    { Id: '40000000-0000-0000-0000-000000000001', Label: 'Q1 Production Report' },
    { Id: '40000000-0000-0000-0000-000000000002', Label: 'Monthly Safety Filing' },
    { Id: '40000000-0000-0000-0000-000000000003', Label: 'Environmental Compliance Form' },
  ],
}

export const ALERT_CONDITION_FIELDS: Record<
  AlertRule['Type'],
  { value: string; label: string; valueType: 'number' | 'date' }[]
> = {
  kpi: [
    { value: 'achievement_rate', label: 'Achievement rate (%)', valueType: 'number' },
    { value: 'yoy_change', label: 'Year-over-year change (%)', valueType: 'number' },
    { value: 'variance', label: 'Variance from target', valueType: 'number' },
  ],
  project: [
    { value: 'progress_pct', label: 'Progress (%)', valueType: 'number' },
    { value: 'days_overdue', label: 'Days overdue', valueType: 'number' },
    { value: 'budget_variance_pct', label: 'Budget variance (%)', valueType: 'number' },
  ],
  filing: [
    { value: 'days_overdue', label: 'Days overdue', valueType: 'number' },
    { value: 'due_date', label: 'Due date', valueType: 'date' },
  ],
}

const OPERATOR_LABELS: Record<string, string> = {
  '>': 'is greater than',
  '<': 'is less than',
  '=': 'equals',
  '>=': 'is at least',
  '<=': 'is at most',
}

const LEVEL_LABELS: Record<AlertLevel, string> = {
  general: 'General',
  important: 'Important',
  urgent: 'Urgent',
}

const CHANNEL_LABELS: Record<AlertChannel, string> = {
  in_app: 'in-app message',
  email: 'email',
  sms: 'SMS',
}

export function formatAlertRulePreview(rule: {
  MonitoredObjectLabel: string
  Condition: AlertRule['Condition']
  Level: AlertLevel
  Channels: AlertChannel[]
}): string {
  const op = OPERATOR_LABELS[rule.Condition.Operator] ?? rule.Condition.Operator
  const channels = rule.Channels.map((c) => CHANNEL_LABELS[c]).join(', ')
  return `When ${rule.MonitoredObjectLabel} ${rule.Condition.Field.replace(/_/g, ' ')} ${op} ${rule.Condition.Value}, send ${LEVEL_LABELS[rule.Level]} alert via ${channels}.`
}

export function alertLevelBadgeVariant(
  level: AlertLevel,
): 'default' | 'secondary' | 'destructive' {
  if (level === 'urgent') return 'destructive'
  if (level === 'important') return 'secondary'
  return 'default'
}

export function alertTypeLabel(type: AlertRule['Type']): string {
  if (type === 'kpi') return 'KPI indicator'
  if (type === 'project') return 'Project progress'
  return 'Filing overdue'
}

export function isRuleComplete(rule: AlertRule): boolean {
  return Boolean(
    rule.Name.trim() &&
      rule.MonitoredObjectId &&
      rule.MonitoredObjectLabel &&
      rule.Condition.Field &&
      rule.Channels.length > 0,
  )
}
