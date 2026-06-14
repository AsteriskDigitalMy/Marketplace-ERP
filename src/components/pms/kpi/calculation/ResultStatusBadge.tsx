import { Badge } from '@/components/ui/badge'
import type { KpiCalculationJob } from '@/models/pms/kpi'
import { getPerformanceTrafficLight } from '@/lib/pms/traffic-light'
import { cn } from '@/lib/utils'

type ResultStatus = KpiCalculationJob['Results'][number]['Status']

const RESULT_LABELS: Record<ResultStatus, string> = {
  ok: 'OK',
  anomaly: 'Anomaly',
  error: 'Error',
}

export function ResultStatusBadge({
  status,
  value,
  target,
}: {
  status: ResultStatus
  value: number | null
  target: number
}) {
  if (status === 'error') {
    return <Badge variant="destructive">{RESULT_LABELS.error}</Badge>
  }
  if (status === 'anomaly') {
    return (
      <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">
        {RESULT_LABELS.anomaly}
      </Badge>
    )
  }
  const light = getPerformanceTrafficLight(value, target)
  const variant =
    light === 'green' ? 'default' : light === 'yellow' ? 'secondary' : 'destructive'
  return <Badge variant={variant}>{RESULT_LABELS.ok}</Badge>
}

export function resultRowClass(status: ResultStatus): string {
  if (status === 'anomaly') return 'bg-amber-500/5'
  if (status === 'error') return 'bg-destructive/5'
  return ''
}

export function TrafficLightDot({
  value,
  target,
  className,
}: {
  value: number | null
  target: number
  className?: string
}) {
  const light = getPerformanceTrafficLight(value, target)
  return (
    <span
      className={cn(
        'inline-block size-2.5 rounded-full',
        light === 'green' && 'bg-emerald-500',
        light === 'yellow' && 'bg-amber-500',
        light === 'red' && 'bg-red-500',
        !light && 'bg-muted-foreground',
        className,
      )}
      aria-hidden
    />
  )
}
