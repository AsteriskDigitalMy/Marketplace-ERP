import { randomDelay } from '@/lib/api/delay'
import { AlertTriangle, ClipboardList, Factory, Gauge, Wrench } from 'lucide-react'
import type { ModuleDashboardData } from '@/components/shared/ModuleDashboard'
import { mesStore } from '@/mocks/mes/mes-store'

export async function fetchMesDashboard(): Promise<ModuleDashboardData> {
  await randomDelay()
  const wos = mesStore.getWorkOrders()
  const ipqc = mesStore.getIpqc()
  const equipment = mesStore.getEquipment()

  return {
    kpis: [
      {
        label: 'Open work orders',
        value: String(wos.filter((w) => w.Status !== 'closed').length),
        icon: ClipboardList,
        iconClassName: 'bg-primary/10 text-primary',
      },
      {
        label: 'In production',
        value: String(wos.filter((w) => w.Status === 'in_progress').length),
        icon: Factory,
        iconClassName: 'bg-emerald-500/10 text-emerald-600',
      },
      {
        label: 'IPQC failures',
        value: String(ipqc.filter((i) => i.Result === 'fail').length),
        icon: AlertTriangle,
        iconClassName: 'bg-amber-500/10 text-amber-600',
      },
      {
        label: 'Equipment faults',
        value: String(equipment.filter((e) => e.Status === 'fault').length),
        icon: Wrench,
        iconClassName: 'bg-rose-500/10 text-rose-600',
      },
      {
        label: 'Avg OEE',
        value: '78%',
        change: 'Target 85%',
        changeTone: 'negative',
        icon: Gauge,
        iconClassName: 'bg-violet-500/10 text-violet-600',
      },
    ],
    syncStatus: [
      { module: 'SCM', status: 'Synced', count: 1 },
      { module: 'WMS', status: 'Synced', count: 2 },
      { module: 'SAP', status: 'Pending', count: 1 },
    ],
    recentActivity: [
      { id: '1', message: 'WO-2026-00142 cutting completed — 140 pcs', timestamp: '30m ago' },
      { id: '2', message: 'IPQC pass for main seam assembly', timestamp: '2h ago' },
    ],
  }
}

export async function fetchMesWorkOrders() {
  await randomDelay()
  return mesStore.getWorkOrders()
}

export async function fetchMesBaoGong() {
  await randomDelay()
  return mesStore.getBaoGong()
}

export async function fetchMesIpqc() {
  await randomDelay()
  return mesStore.getIpqc()
}

export async function fetchMesOqc() {
  await randomDelay()
  return mesStore.getOqc()
}

export async function fetchMesRework() {
  await randomDelay()
  return mesStore.getRework()
}

export async function fetchMesEquipment() {
  await randomDelay()
  return mesStore.getEquipment()
}

export async function fetchMesTooling() {
  await randomDelay()
  return mesStore.getTooling()
}

export async function fetchMesTeams() {
  await randomDelay()
  return mesStore.getTeams()
}

export async function fetchMesWages() {
  await randomDelay()
  return mesStore.getWages()
}

export async function fetchMesCosts() {
  await randomDelay()
  return mesStore.getCosts()
}

export async function fetchMesScheduling() {
  await randomDelay()
  return mesStore.getWorkOrders()
}
