import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BiKpiCard } from '@/models/bi'

interface BiKpiCardViewProps {
  kpi: BiKpiCard
}

const statusColors = {
  green: 'text-emerald-600',
  yellow: 'text-amber-600',
  red: 'text-destructive',
  gray: 'text-muted-foreground',
}

export function BiKpiCardView({ kpi }: BiKpiCardViewProps) {
  const trendUp = kpi.TrendPct !== null && kpi.TrendPct >= 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.Label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <p className={cn('text-2xl font-semibold tabular-nums', statusColors[kpi.StatusColor])}>
            {kpi.Value.toLocaleString()}
            {kpi.Unit ? (
              <span className="ml-1 text-sm font-normal text-muted-foreground">{kpi.Unit}</span>
            ) : null}
          </p>
          {kpi.TrendPct !== null ? (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trendUp ? 'text-emerald-600' : 'text-destructive',
              )}
            >
              {trendUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {Math.abs(kpi.TrendPct).toFixed(1)}%
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
