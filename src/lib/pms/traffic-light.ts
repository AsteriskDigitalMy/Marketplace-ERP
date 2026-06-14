import type { z } from 'zod'
import type { TrafficLightCategory } from '@/models/common/enums'
import { TrafficLightColorSchema } from '@/models/common/enums'

type TrafficLightColor = z.infer<typeof TrafficLightColorSchema>
import { trafficLightRulesStore } from '@/mocks/pms/traffic-light-rules-store'

const FALLBACK_BANDS: Record<
  TrafficLightCategory,
  { color: TrafficLightColor; min: number; max: number }[]
> = {
  progress: [
    { color: 'green', min: 90, max: Infinity },
    { color: 'yellow', min: 70, max: 89.99 },
    { color: 'red', min: -Infinity, max: 69.99 },
  ],
  delay: [
    { color: 'green', min: 0, max: 0 },
    { color: 'yellow', min: 1, max: 7 },
    { color: 'red', min: 8, max: Infinity },
  ],
  performance: [
    { color: 'green', min: 85, max: Infinity },
    { color: 'yellow', min: 70, max: 84.99 },
    { color: 'red', min: -Infinity, max: 69.99 },
  ],
}

function bandsForCategory(category: TrafficLightCategory) {
  const rules = trafficLightRulesStore.list(category)
  if (rules.length === 0) {
    return FALLBACK_BANDS[category]
  }
  return rules[0].Bands.map((b) => ({
    color: b.Color,
    min: b.Min,
    max: b.Max,
  }))
}

/** Resolve traffic-light color from global rule config (3.1.6.3). */
export function getStatusColor(
  value: number,
  category: TrafficLightCategory,
  metricKey?: string,
): TrafficLightColor {
  const rules = trafficLightRulesStore.list(category)
  const rule =
    rules.find((r) => metricKey && r.MetricScope.length > 0 && r.MetricScope.includes(metricKey)) ??
    rules[0]

  const bands = rule
    ? rule.Bands.map((b) => ({ color: b.Color, min: b.Min, max: b.Max }))
    : bandsForCategory(category)

  for (const band of bands) {
    if (value >= band.min && value <= band.max) {
      return TrafficLightColorSchema.parse(band.color)
    }
  }
  return 'red'
}

export function getAchievementRate(value: number | null, target: number): number | null {
  if (value === null || target === 0) return null
  return (value / target) * 100
}

export function getPerformanceTrafficLight(
  value: number | null,
  target: number,
): TrafficLightColor | null {
  const rate = getAchievementRate(value, target)
  if (rate === null) return null
  return getStatusColor(rate, 'performance')
}

export function formatVariancePct(value: number | null, target: number): string {
  const rate = getAchievementRate(value, target)
  if (rate === null) return '—'
  const variance = rate - 100
  const sign = variance > 0 ? '+' : ''
  return `${sign}${variance.toFixed(1)}%`
}

export function statusColorClass(color: TrafficLightColor): string {
  if (color === 'green') return 'border-l-emerald-500'
  if (color === 'yellow') return 'border-l-amber-500'
  return 'border-l-red-500'
}

export function statusDotClass(color: TrafficLightColor): string {
  if (color === 'green') return 'bg-emerald-500'
  if (color === 'yellow') return 'bg-amber-500'
  return 'bg-red-500'
}
