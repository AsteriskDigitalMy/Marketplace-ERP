import { Badge } from '@/components/ui/badge'
import type { AlertLevel } from '@/models/common/enums'
import { alertLevelBadgeVariant } from '@/lib/pms/alert-helpers'

const LABELS: Record<AlertLevel, string> = {
  general: 'General',
  important: 'Important',
  urgent: 'Urgent',
}

export function AlertLevelBadge({ level }: { level: AlertLevel }) {
  return <Badge variant={alertLevelBadgeVariant(level)}>{LABELS[level]}</Badge>
}
