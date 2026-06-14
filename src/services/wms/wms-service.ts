import { randomDelay } from '@/lib/api/delay'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, MapPin } from 'lucide-react'
import type { ModuleDashboardData } from '@/components/shared/ModuleDashboard'
import { wmsStore } from '@/mocks/wms/wms-store'

export async function fetchWmsDashboard(): Promise<ModuleDashboardData> {
  await randomDelay()
  const inbound = wmsStore.getInbound()
  const outbound = wmsStore.getOutbound()
  const alerts = wmsStore.getAlerts()
  const stockTakes = wmsStore.getStockTakes()

  return {
    kpis: [
      {
        label: 'Open inbound',
        value: String(inbound.filter((t) => t.Status !== 'completed').length),
        icon: ArrowDownToLine,
        iconClassName: 'bg-primary/10 text-primary',
      },
      {
        label: 'Open outbound',
        value: String(outbound.filter((t) => t.Status !== 'completed').length),
        icon: ArrowUpFromLine,
        iconClassName: 'bg-emerald-500/10 text-emerald-600',
      },
      {
        label: 'Active alerts',
        value: String(alerts.filter((a) => !a.IsAcknowledged).length),
        icon: AlertTriangle,
        iconClassName: 'bg-amber-500/10 text-amber-600',
      },
      {
        label: 'Locations occupied',
        value: '72%',
        icon: MapPin,
        iconClassName: 'bg-violet-500/10 text-violet-600',
      },
      {
        label: 'Pending counts',
        value: String(stockTakes.filter((s) => s.Status !== 'completed').length),
        icon: Boxes,
        iconClassName: 'bg-rose-500/10 text-rose-600',
      },
    ],
    syncStatus: [
      { module: 'SCM', status: 'Synced', count: 1 },
      { module: 'MES', status: 'Synced', count: 1 },
      { module: 'SAP', status: 'Failed', count: 1 },
    ],
    recentActivity: [
      { id: '1', message: 'Pick 400m FAB-NYL-210 for WO-2026-00142', timestamp: '45m ago' },
      { id: '2', message: 'Low stock alert for FAB-NYL-210', timestamp: '2h ago' },
    ],
  }
}

export async function fetchWmsLocations() {
  await randomDelay()
  return wmsStore.getLocations()
}

export async function fetchWmsMaterials() {
  await randomDelay()
  return wmsStore.getMaterials()
}

export async function fetchWmsStrategies() {
  await randomDelay()
  return wmsStore.getStrategies()
}

export async function fetchWmsInbound() {
  await randomDelay()
  return wmsStore.getInbound()
}

export async function fetchWmsOutbound() {
  await randomDelay()
  return wmsStore.getOutbound()
}

export async function fetchWmsTransfers() {
  await randomDelay()
  return wmsStore.getTransfers()
}

export async function fetchWmsAlerts() {
  await randomDelay()
  return wmsStore.getAlerts()
}

export async function fetchWmsBatches() {
  await randomDelay()
  return wmsStore.getBatches()
}

export async function fetchWmsReservations() {
  await randomDelay()
  return wmsStore.getReservations()
}

export async function fetchWmsStockTakes() {
  await randomDelay()
  return wmsStore.getStockTakes()
}

export async function fetchWmsTraceability() {
  await randomDelay()
  return wmsStore.getTraceability()
}
