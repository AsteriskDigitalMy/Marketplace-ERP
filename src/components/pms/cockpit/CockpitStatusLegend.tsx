import type { TrafficLightColor } from '@/models/common/enums'
import { cn } from '@/lib/utils'
import { statusDotClass } from '@/lib/pms/traffic-light'

const BANDS: { color: TrafficLightColor; label: string; description: string }[] = [
  { color: 'green', label: 'On track', description: 'Meets target thresholds' },
  { color: 'yellow', label: 'At risk', description: 'Needs attention' },
  { color: 'red', label: 'Critical', description: 'Below threshold' },
]

interface CockpitStatusLegendProps {
  onDrillDown: (band: TrafficLightColor) => void
}

export function CockpitStatusLegend({ onDrillDown }: CockpitStatusLegendProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {BANDS.map((band) => (
        <button
          key={band.color}
          type="button"
          aria-label={`Drill down into ${band.label} items`}
          className={cn(
            'flex min-h-11 min-w-[140px] flex-1 items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs',
            band.color === 'green' && 'border-l-4 border-l-emerald-500',
            band.color === 'yellow' && 'border-l-4 border-l-amber-500',
            band.color === 'red' && 'border-l-4 border-l-red-500',
          )}
          onClick={() => onDrillDown(band.color)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onDrillDown(band.color)
            }
          }}
        >
          <span className={cn('size-3 shrink-0 rounded-full', statusDotClass(band.color))} />
          <span>
            <span className="block text-sm font-medium">{band.label}</span>
            <span className="block text-xs text-muted-foreground">{band.description}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
