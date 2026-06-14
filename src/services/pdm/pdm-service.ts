import { randomDelay } from '@/lib/api/delay'
import { FolderKanban, Layers, Palette, Package, RefreshCw } from 'lucide-react'
import type { ModuleDashboardData } from '@/components/shared/ModuleDashboard'
import { pdmStore } from '@/mocks/pdm/pdm-store'

export async function fetchPdmDashboard(): Promise<ModuleDashboardData> {
  await randomDelay()
  const projects = pdmStore.getProjects()
  const styles = pdmStore.getStyles()
  const sampling = pdmStore.getSampling()
  const boms = pdmStore.getBoms()
  const changes = pdmStore.getChanges()

  return {
    kpis: [
      {
        label: 'Active projects',
        value: String(projects.filter((p) => p.Status !== 'Archived').length),
        change: '+1 this month',
        changeTone: 'positive',
        icon: FolderKanban,
        iconClassName: 'bg-primary/10 text-primary',
      },
      {
        label: 'Designs in review',
        value: String(styles.filter((s) => s.Status === 'In Review').length),
        icon: Palette,
        iconClassName: 'bg-violet-500/10 text-violet-600',
      },
      {
        label: 'Open sampling tasks',
        value: String(sampling.filter((s) => s.Status !== 'passed').length),
        icon: Layers,
        iconClassName: 'bg-amber-500/10 text-amber-600',
      },
      {
        label: 'Pending BOM approvals',
        value: String(boms.filter((b) => b.Status === 'In Review').length),
        icon: Package,
        iconClassName: 'bg-emerald-500/10 text-emerald-600',
      },
      {
        label: 'Change requests',
        value: String(changes.filter((c) => c.Status === 'In Review').length),
        change: '1 awaiting approval',
        icon: RefreshCw,
        iconClassName: 'bg-teal-500/10 text-teal-600',
      },
    ],
    pipeline: [
      { stage: 'Projects', count: projects.length },
      { stage: 'Design', count: styles.length },
      { stage: 'Sampling', count: sampling.length },
      { stage: 'Finalization', count: pdmStore.getFinalization().length },
    ],
    syncStatus: [
      { module: 'SCM', status: 'Synced', count: 1 },
      { module: 'MES', status: 'Synced', count: 1 },
      { module: 'WMS', status: 'Pending', count: 1 },
    ],
    recentActivity: [
      { id: '1', message: 'BOM v1.0 approved for STY-JKT-001', timestamp: '2h ago' },
      { id: '2', message: 'PP sample started for Summit Trail Jacket', timestamp: '5h ago' },
    ],
  }
}

export async function fetchPdmProjects() {
  await randomDelay()
  return pdmStore.getProjects()
}

export async function fetchPdmDesigns() {
  await randomDelay()
  return pdmStore.getDesigns()
}

export async function fetchPdmSampling() {
  await randomDelay()
  return pdmStore.getSampling()
}

export async function fetchPdmFinalization() {
  await randomDelay()
  return pdmStore.getFinalization()
}

export async function fetchPdmProcesses() {
  await randomDelay()
  return pdmStore.getProcesses()
}

export async function fetchPdmWorkingHours() {
  await randomDelay()
  return pdmStore.getWorkingHours()
}

export async function fetchPdmRouting() {
  await randomDelay()
  return pdmStore.getRouting()
}

export async function fetchPdmBoms() {
  await randomDelay()
  return pdmStore.getBoms()
}

export async function fetchPdmCostPricing() {
  await randomDelay()
  return pdmStore.getCostPricing()
}

export async function fetchPdmChanges() {
  await randomDelay()
  return pdmStore.getChanges()
}
