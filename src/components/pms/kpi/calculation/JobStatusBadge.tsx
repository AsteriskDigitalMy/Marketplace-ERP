import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { KpiCalculationJob } from '@/models/pms/kpi'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<KpiCalculationJob['Status'], string> = {
  running: 'Running',
  success: 'Success',
  partial: 'Partial',
  failed: 'Failed',
}

export function JobStatusBadge({
  status,
  className,
}: {
  status: KpiCalculationJob['Status']
  className?: string
}) {
  const variant =
    status === 'success'
      ? 'default'
      : status === 'partial'
        ? 'secondary'
        : status === 'failed'
          ? 'destructive'
          : 'secondary'

  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      {status === 'running' ? <Loader2 className="size-3 animate-spin" /> : null}
      {STATUS_LABELS[status]}
    </Badge>
  )
}
