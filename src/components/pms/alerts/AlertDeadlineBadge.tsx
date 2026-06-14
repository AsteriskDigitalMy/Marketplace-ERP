import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function formatDeadlineCountdown(deadlineAt: string, isClosed: boolean) {
  if (isClosed) {
    return { label: 'Closed', variant: 'secondary' as const }
  }
  const ms = new Date(deadlineAt).getTime() - Date.now()
  if (ms < 0) {
    const hours = Math.abs(Math.floor(ms / (1000 * 60 * 60)))
    return {
      label: hours >= 24 ? `${Math.floor(hours / 24)}d overdue` : `${hours}h overdue`,
      variant: 'destructive' as const,
    }
  }
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours <= 72) {
    return {
      label: hours >= 24 ? `${Math.floor(hours / 24)}d left` : `${hours}h left`,
      variant: 'secondary' as const,
    }
  }
  const days = Math.floor(hours / 24)
  return { label: `${days}d left`, variant: 'default' as const }
}

export function AlertDeadlineBadge({
  deadlineAt,
  isClosed,
}: {
  deadlineAt: string
  isClosed: boolean
}) {
  const { label, variant } = formatDeadlineCountdown(deadlineAt, isClosed)
  return (
    <Badge
      variant={variant === 'destructive' ? 'destructive' : variant === 'secondary' ? 'secondary' : 'outline'}
      className={cn(variant === 'default' && 'border-border')}
    >
      {label}
    </Badge>
  )
}
