import { randomDelay } from '@/lib/api/delay'
import { BarChart3, LayoutDashboard, LineChart, Monitor } from 'lucide-react'
import type { ModuleDashboardData } from '@/components/shared/ModuleDashboard'
import type { BiDashboardPayload } from '@/models/bi'
import { biStore } from '@/mocks/bi/bi-store'

export async function fetchBiDashboard(key: string): Promise<BiDashboardPayload | null> {
  await randomDelay(200, 800)
  return biStore.getDashboard(key)
}

export async function fetchBiHomeDashboard(): Promise<ModuleDashboardData> {
  await randomDelay()
  return {
    kpis: [
      {
        label: 'Dashboards',
        value: String(biStore.getDashboardKeys().length),
        icon: LayoutDashboard,
        iconClassName: 'bg-primary/10 text-primary',
      },
      {
        label: 'Open alerts',
        value: '3',
        icon: Monitor,
        iconClassName: 'bg-amber-500/10 text-amber-600',
      },
      {
        label: 'Reports saved',
        value: '12',
        icon: BarChart3,
        iconClassName: 'bg-violet-500/10 text-violet-600',
      },
      {
        label: 'Data freshness',
        value: '< 5 min',
        icon: LineChart,
        iconClassName: 'bg-emerald-500/10 text-emerald-600',
      },
    ],
    recentActivity: [
      { id: '1', message: 'Executive cockpit refreshed', timestamp: '2m ago' },
      { id: '2', message: 'MES dashboard drill-down saved', timestamp: '1h ago' },
    ],
  }
}
