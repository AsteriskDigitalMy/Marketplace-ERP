import { randomDelay } from '@/lib/api/delay'
import { Activity, AlertCircle, CheckCircle, Link2, Server } from 'lucide-react'
import type { ModuleDashboardData } from '@/components/shared/ModuleDashboard'
import { sapStore } from '@/mocks/sap/sap-store'

export async function fetchSapDashboard(): Promise<ModuleDashboardData> {
  await randomDelay()
  const logs = sapStore.getSyncLogs()
  const exceptions = sapStore.getExceptions()
  const synced = logs.filter((l) => l.Status === 'synced').length
  const total = logs.length

  return {
    kpis: [
      {
        label: 'Sync success rate (24h)',
        value: total > 0 ? `${Math.round((synced / total) * 100)}%` : '—',
        change: 'Target ≥ 99%',
        changeTone: synced / total >= 0.99 ? 'positive' : 'negative',
        icon: CheckCircle,
        iconClassName: 'bg-emerald-500/10 text-emerald-600',
      },
      {
        label: 'Failed documents',
        value: String(logs.filter((l) => l.Status === 'failed').length),
        icon: AlertCircle,
        iconClassName: 'bg-destructive/10 text-destructive',
      },
      {
        label: 'Open exceptions',
        value: String(exceptions.filter((e) => e.Status === 'open').length),
        icon: Activity,
        iconClassName: 'bg-amber-500/10 text-amber-600',
      },
      {
        label: 'Interfaces online',
        value: '3/3',
        icon: Server,
        iconClassName: 'bg-primary/10 text-primary',
      },
      {
        label: 'Last health check',
        value: 'Healthy',
        icon: Link2,
        iconClassName: 'bg-violet-500/10 text-violet-600',
      },
    ],
    pipeline: [
      { stage: 'AP (P2P)', count: sapStore.getP2p().length },
      { stage: 'AR (O2C)', count: sapStore.getO2c().length },
      { stage: 'Production cost', count: sapStore.getCosting().length },
      { stage: 'Inventory val.', count: sapStore.getInventory().length },
    ],
    recentActivity: logs.slice(0, 5).map((l) => ({
      id: l.Id,
      message: `${l.DocumentNumber} — ${l.Status}`,
      timestamp: new Date(l.AttemptedAt).toLocaleString(),
    })),
  }
}

export async function fetchSapConfig() {
  await randomDelay()
  return sapStore.getConfig()
}

export async function fetchSapMasterData() {
  await randomDelay()
  return sapStore.getMasterData()
}

export async function fetchSapP2p() {
  await randomDelay()
  return sapStore.getP2p()
}

export async function fetchSapO2c() {
  await randomDelay()
  return sapStore.getO2c()
}

export async function fetchSapCosting() {
  await randomDelay()
  return sapStore.getCosting()
}

export async function fetchSapInventory() {
  await randomDelay()
  return sapStore.getInventory()
}

export async function fetchSapSyncLogs() {
  await randomDelay()
  return sapStore.getSyncLogs()
}

export async function fetchSapExceptions() {
  await randomDelay()
  return sapStore.getExceptions()
}
