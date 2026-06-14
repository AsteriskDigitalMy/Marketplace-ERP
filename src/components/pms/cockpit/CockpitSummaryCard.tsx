import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { RoleCockpit } from '@/models/pms/operations'
import { statusColorClass } from '@/lib/pms/traffic-light'

type CockpitCard = RoleCockpit['Cards'][number]

interface CockpitSummaryCardProps {
  card: CockpitCard
  onDrillDown: () => void
}

export function CockpitSummaryCard({ card, onDrillDown }: CockpitSummaryCardProps) {
  const trendUp = card.TrendPct !== null && card.TrendPct >= 0

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`Drill down into ${card.Label}`}
      className={cn(
        'cursor-pointer border-l-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-ring',
        statusColorClass(card.StatusColor),
      )}
      onClick={onDrillDown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onDrillDown()
        }
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="type-card-description font-medium">{card.Label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        <div>
          <p className="text-1_5xl font-semibold tracking-tight">
            {card.Value}
            <span className="ml-1 text-sm font-normal text-muted-foreground">{card.Unit}</span>
          </p>
          {card.TrendPct !== null ? (
            <p
              className={cn(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                trendUp ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {trendUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {trendUp ? '+' : ''}
              {card.TrendPct}%
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
