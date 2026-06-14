import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/layout/StatCard'
import type { LucideIcon } from 'lucide-react'

export interface DashboardKpi {
  label: string
  value: string
  change?: string
  changeTone?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconClassName?: string
}

export interface ModuleDashboardData {
  kpis: DashboardKpi[]
  pipeline?: { stage: string; count: number }[]
  recentActivity?: { id: string; message: string; timestamp: string }[]
  syncStatus?: { module: string; status: string; count: number }[]
}

interface ModuleDashboardProps {
  fetchDashboard: () => Promise<ModuleDashboardData>
  children?: React.ReactNode
}

export function ModuleDashboard({ fetchDashboard, children }: ModuleDashboardProps) {
  const [data, setData] = useState<ModuleDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      setData(await fetchDashboard())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error ?? 'Dashboard unavailable'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {data.pipeline && data.pipeline.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold text-foreground">Pipeline</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {data.pipeline.map((stage) => (
              <div key={stage.stage} className="min-w-[120px] rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">{stage.stage}</p>
                <p className="text-xl font-semibold tabular-nums">{stage.count}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.syncStatus && data.syncStatus.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold text-foreground">Downstream sync status</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {data.syncStatus.map((s) => (
              <div
                key={s.module}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium">{s.module}</span>
                <span className="text-muted-foreground">{s.status}</span>
                <span className="tabular-nums text-muted-foreground">({s.count})</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data.recentActivity && data.recentActivity.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
          <ul className="mt-4 space-y-3">
            {data.recentActivity.map((entry) => (
              <li key={entry.id} className="flex justify-between gap-4 text-sm">
                <span>{entry.message}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{entry.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {children}
    </div>
  )
}
