import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertLevelBadge } from '@/components/pms/alerts/AlertLevelBadge'
import { formatAlertRulePreview } from '@/lib/pms/alert-helpers'
import type { AlertChannel, AlertLevel } from '@/models/common/enums'
import type { AlertRule } from '@/models/pms/operations'

interface AlertRulePreviewProps {
  monitoredObjectLabel: string
  condition: AlertRule['Condition']
  level: AlertLevel
  channels: AlertChannel[]
}

export function AlertRulePreview({
  monitoredObjectLabel,
  condition,
  level,
  channels,
}: AlertRulePreviewProps) {
  const sentence = formatAlertRulePreview({
    MonitoredObjectLabel: monitoredObjectLabel || '(object)',
    Condition: condition,
    Level: level,
    Channels: channels.length > 0 ? channels : ['in_app'],
  })

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader className="pb-2">
        <CardTitle className="type-card-title">Rule preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">{sentence}</p>
        <AlertLevelBadge level={level} />
      </CardContent>
    </Card>
  )
}
