import { TrafficLightColorSchema } from '@/models/common/enums'
import type { z } from 'zod'

type TrafficLightColor = z.infer<typeof TrafficLightColorSchema>

/** Default performance achievement bands (percent of target). */
const DEFAULT_PERFORMANCE_BANDS: { color: TrafficLightColor; min: number; max: number }[] = [
  { color: 'green', min: 95, max: Infinity },
  { color: 'yellow', min: 80, max: 94.99 },
  { color: 'red', min: -Infinity, max: 79.99 },
]

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
  for (const band of DEFAULT_PERFORMANCE_BANDS) {
    if (rate >= band.min && rate <= band.max) return band.color
  }
  return 'red'
}

export function formatVariancePct(value: number | null, target: number): string {
  const rate = getAchievementRate(value, target)
  if (rate === null) return '—'
  const variance = rate - 100
  const sign = variance > 0 ? '+' : ''
  return `${sign}${variance.toFixed(1)}%`
}
