import { randomDelay } from '@/lib/api/delay'
import { Package, ShoppingCart, Truck, Users, Calendar } from 'lucide-react'
import type { ModuleDashboardData } from '@/components/shared/ModuleDashboard'
import { scmStore } from '@/mocks/scm/scm-store'

export async function fetchScmDashboard(): Promise<ModuleDashboardData> {
  await randomDelay()
  const orders = scmStore.getOrders()
  const pos = scmStore.getPurchaseOrders()
  const schedules = scmStore.getSchedules()

  return {
    kpis: [
      {
        label: 'Open orders',
        value: String(orders.filter((o) => !['closed', 'cancelled'].includes(o.Status)).length),
        icon: ShoppingCart,
        iconClassName: 'bg-primary/10 text-primary',
      },
      {
        label: 'Pending reviews',
        value: String(orders.filter((o) => o.Status === 'in_review').length),
        icon: Users,
        iconClassName: 'bg-violet-500/10 text-violet-600',
      },
      {
        label: 'Overdue POs',
        value: String(pos.filter((p) => p.Status === 'approved').length),
        icon: Package,
        iconClassName: 'bg-amber-500/10 text-amber-600',
      },
      {
        label: 'Schedule delays',
        value: String(schedules.filter((s) => s.CompletionPct < 50).length),
        icon: Calendar,
        iconClassName: 'bg-rose-500/10 text-rose-600',
      },
      {
        label: 'On-time delivery',
        value: '94%',
        change: '+2% vs last month',
        changeTone: 'positive',
        icon: Truck,
        iconClassName: 'bg-emerald-500/10 text-emerald-600',
      },
    ],
    pipeline: [
      { stage: 'Order', count: orders.length },
      { stage: 'Review', count: orders.filter((o) => o.Status === 'in_review').length },
      { stage: 'Plan', count: schedules.length },
      { stage: 'Produce', count: 1 },
      { stage: 'Ship', count: orders.filter((o) => o.Status === 'shipped').length },
      { stage: 'Close', count: orders.filter((o) => o.Status === 'closed').length },
    ],
    syncStatus: [
      { module: 'PDM', status: 'Synced', count: 1 },
      { module: 'MES', status: 'Synced', count: 1 },
      { module: 'WMS', status: 'Synced', count: 1 },
      { module: 'SAP', status: 'Pending', count: 2 },
    ],
    recentActivity: [
      { id: '1', message: 'SO-2026-10482 released to production planning', timestamp: '1h ago' },
      { id: '2', message: 'PO-2026-0088 approved for Pacific Textiles', timestamp: '3h ago' },
    ],
  }
}

export async function fetchScmCustomers() {
  await randomDelay()
  return scmStore.getCustomers()
}

export async function fetchScmOrders() {
  await randomDelay()
  return scmStore.getOrders()
}

export async function fetchScmSuppliers() {
  await randomDelay()
  return scmStore.getSuppliers()
}

export async function fetchScmRequisitions() {
  await randomDelay()
  return scmStore.getRequisitions()
}

export async function fetchScmPurchaseOrders() {
  await randomDelay()
  return scmStore.getPurchaseOrders()
}

export async function fetchScmSchedules() {
  await randomDelay()
  return scmStore.getSchedules()
}

export async function fetchScmSubcontracting() {
  await randomDelay()
  return scmStore.getSubcontracting()
}

export async function fetchScmImportExport() {
  await randomDelay()
  return scmStore.getImportExport()
}

export async function fetchPortalOrders() {
  await randomDelay()
  return scmStore.getOrders().filter((o) => o.CustomerId === '20000000-0000-0000-0000-000000000001')
}
