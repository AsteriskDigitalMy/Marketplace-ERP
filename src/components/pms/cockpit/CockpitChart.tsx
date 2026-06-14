import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoleCockpit } from '@/models/pms/operations'

type CockpitChartData = RoleCockpit['Charts'][number]

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface CockpitChartProps {
  chart: CockpitChartData
  onSegmentClick: (label: string, index: number) => void
}

export function CockpitChart({ chart, onSegmentClick }: CockpitChartProps) {
  const max = Math.max(...chart.Series.map((s) => s.Value), 1)

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader className="pb-2">
        <CardTitle className="type-card-title">{chart.Title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chart.Type === 'bar' ? (
          <div className="space-y-2">
            {chart.Series.map((s, i) => (
              <button
                key={s.Label}
                type="button"
                className="flex w-full min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Drill down into ${s.Label}`}
                onClick={() => onSegmentClick(s.Label, i)}
              >
                <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">{s.Label}</span>
                <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded"
                    style={{
                      width: `${(s.Value / max) * 100}%`,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium">{s.Value}</span>
              </button>
            ))}
          </div>
        ) : null}

        {chart.Type === 'line' ? (
          <div className="space-y-3">
            <svg viewBox="0 0 320 120" className="h-32 w-full" role="img" aria-label={chart.Title}>
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points={chart.Series.map((s, i) => {
                  const x = 20 + (i / Math.max(chart.Series.length - 1, 1)) * 280
                  const y = 100 - (s.Value / max) * 80
                  return `${x},${y}`
                }).join(' ')}
              />
              {chart.Series.map((s, i) => {
                const x = 20 + (i / Math.max(chart.Series.length - 1, 1)) * 280
                const y = 100 - (s.Value / max) * 80
                return (
                  <circle
                    key={s.Label}
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#3b82f6"
                    className="cursor-pointer"
                    onClick={() => onSegmentClick(s.Label, i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSegmentClick(s.Label, i)
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Drill down into ${s.Label}`}
                  />
                )
              })}
            </svg>
            <div className="flex justify-between text-xs text-muted-foreground">
              {chart.Series.map((s) => (
                <span key={s.Label}>{s.Label}</span>
              ))}
            </div>
          </div>
        ) : null}

        {chart.Type === 'donut' ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <DonutChart series={chart.Series} onSegmentClick={onSegmentClick} />
            <ul className="space-y-1 text-sm">
              {chart.Series.map((s, i) => (
                <li key={s.Label}>
                  <button
                    type="button"
                    className="flex items-center gap-2 hover:underline"
                    onClick={() => onSegmentClick(s.Label, i)}
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    {s.Label} ({s.Value})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DonutChart({
  series,
  onSegmentClick,
}: {
  series: CockpitChartData['Series']
  onSegmentClick: (label: string, index: number) => void
}) {
  const total = series.reduce((sum, s) => sum + s.Value, 0)
  let offset = 0
  const circles = series.map((s, i) => {
    const pct = total > 0 ? s.Value / total : 0
    const dash = pct * 283
    const el = (
      <circle
        key={s.Label}
        cx="60"
        cy="60"
        r="45"
        fill="transparent"
        stroke={CHART_COLORS[i % CHART_COLORS.length]}
        strokeWidth="18"
        strokeDasharray={`${dash} ${283 - dash}`}
        strokeDashoffset={-offset}
        className="cursor-pointer"
        transform="rotate(-90 60 60)"
        onClick={() => onSegmentClick(s.Label, i)}
        tabIndex={0}
        role="button"
        aria-label={`Drill down into ${s.Label}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSegmentClick(s.Label, i)
        }}
      />
    )
    offset += dash
    return el
  })

  return (
    <svg viewBox="0 0 120 120" className="size-28 shrink-0" role="img">
      {circles}
    </svg>
  )
}
