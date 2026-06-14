import { randomDelay } from '@/lib/api/delay'
import { fetchBiHomeDashboard } from '@/services/bi/bi-service'
import { fetchMesDashboard } from '@/services/mes/mes-service'
import { fetchPdmDashboard } from '@/services/pdm/pdm-service'
import { fetchSapDashboard } from '@/services/sap/sap-service'
import { fetchScmDashboard } from '@/services/scm/scm-service'
import { fetchWmsDashboard } from '@/services/wms/wms-service'
import { projectStore } from '@/mocks/pms/project-store'

export interface ErpModuleSummary {
  module: string
  code: string
  stats: { label: string; value: string }[]
}

export interface ErpLauncherData {
  modules: ErpModuleSummary[]
  quickStats: { label: string; value: string; change?: string }[]
}

export async function fetchErpLauncherData(): Promise<ErpLauncherData> {
  await randomDelay()

  const [pdm, scm, mes, wms, sap, bi] = await Promise.all([
    fetchPdmDashboard(),
    fetchScmDashboard(),
    fetchMesDashboard(),
    fetchWmsDashboard(),
    fetchSapDashboard(),
    fetchBiHomeDashboard(),
  ])

  const projectCount = projectStore.getProjects().length

  return {
    modules: [
      {
        module: 'PMS',
        code: '3.1',
        stats: [
          { label: 'Active projects', value: String(projectCount || 12) },
          { label: 'Open alerts', value: '5' },
        ],
      },
      {
        module: 'PDM',
        code: '3.2',
        stats: pdm.kpis.slice(0, 2).map((k) => ({ label: k.label, value: k.value })),
      },
      {
        module: 'SCM',
        code: '3.3',
        stats: scm.kpis.slice(0, 2).map((k) => ({ label: k.label, value: k.value })),
      },
      {
        module: 'MES',
        code: '3.4',
        stats: mes.kpis.slice(0, 2).map((k) => ({ label: k.label, value: k.value })),
      },
      {
        module: 'WMS',
        code: '3.5',
        stats: wms.kpis.slice(0, 2).map((k) => ({ label: k.label, value: k.value })),
      },
      {
        module: 'SAP',
        code: '3.6',
        stats: sap.kpis.slice(0, 2).map((k) => ({ label: k.label, value: k.value })),
      },
      {
        module: 'BI',
        code: '3.7',
        stats: bi.kpis.slice(0, 2).map((k) => ({ label: k.label, value: k.value })),
      },
    ],
    quickStats: [
      { label: 'Open sales orders', value: scm.kpis[0]?.value ?? '0', change: 'SCM' },
      { label: 'Work orders in production', value: mes.kpis[1]?.value ?? '0', change: 'MES' },
      { label: 'Warehouse alerts', value: wms.kpis[2]?.value ?? '0', change: 'WMS' },
      { label: 'SAP sync success', value: sap.kpis[0]?.value ?? '—', change: 'SAP' },
    ],
  }
}
