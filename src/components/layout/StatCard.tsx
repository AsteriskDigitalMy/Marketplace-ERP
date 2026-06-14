import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string
  change?: string
  changeTone?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconClassName?: string
}

export function StatCard({
  label,
  value,
  change,
  changeTone = 'positive',
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-1">
          <p className="text-2sm font-medium text-muted-foreground">{label}</p>
          <p className="text-1_5xl font-semibold tracking-tight text-foreground">{value}</p>
          {change ? (
            <p
              className={cn(
                'text-2xs font-medium',
                changeTone === 'positive' && 'text-success',
                changeTone === 'negative' && 'text-destructive',
                changeTone === 'neutral' && 'text-muted-foreground',
              )}
            >
              {change}
            </p>
          ) : null}
        </div>
        <div className={cn('metronic-stat-icon bg-primary/10 text-primary', iconClassName)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
