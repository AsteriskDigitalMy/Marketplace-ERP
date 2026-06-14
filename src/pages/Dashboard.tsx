import { useEffect, useState } from 'react'
import {
  BarChart3,
  Boxes,
  Factory,
  Gauge,
  Layers,
  Link2,
  Workflow,
} from 'lucide-react'
import { StatCard } from '@/components/layout/StatCard'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { ModuleHomeCard } from '@/components/shared/ModuleHomeCard'
import { fetchErpLauncherData, type ErpLauncherData } from '@/services/launcher/erp-dashboard-service'

const moduleCards = [
  {
    key: 'PMS',
    title: 'Performance Management',
    description: 'KPI, projects, appraisal, PDCA, and reporting.',
    to: '/pms',
    icon: Workflow,
    accent: 'bg-primary/10 text-primary',
    status: 'live' as const,
    section: '3.1',
  },
  {
    key: 'PDM',
    title: 'Product Data',
    description: 'Products, BOM, routing, processes, and cost data.',
    to: '/pdm',
    icon: Layers,
    accent: 'bg-violet-500/10 text-violet-600',
    status: 'live' as const,
    section: '3.2',
  },
  {
    key: 'SCM',
    title: 'Supply Chain',
    description: 'Sales, procurement, scheduling, and logistics.',
    to: '/scm',
    icon: Boxes,
    accent: 'bg-emerald-500/10 text-emerald-600',
    status: 'live' as const,
    section: '3.3',
  },
  {
    key: 'MES',
    title: 'Manufacturing Execution',
    description: 'Work orders, shop floor, quality, and equipment.',
    to: '/mes',
    icon: Factory,
    accent: 'bg-amber-500/10 text-amber-600',
    status: 'live' as const,
    section: '3.4',
  },
  {
    key: 'WMS',
    title: 'Warehouse Management',
    description: 'Inbound, outbound, inventory, and traceability.',
    to: '/wms',
    icon: Boxes,
    accent: 'bg-cyan-500/10 text-cyan-600',
    status: 'live' as const,
    section: '3.5',
  },
  {
    key: 'SAP',
    title: 'SAP Integration',
    description: 'Financial sync monitors and exception handling.',
    to: '/sap',
    icon: Link2,
    accent: 'bg-slate-500/10 text-slate-600',
    status: 'live' as const,
    section: '3.6',
  },
  {
    key: 'BI',
    title: 'Business Intelligence',
    description: 'Dashboards, analytics, and execution kanbans.',
    to: '/bi',
    icon: BarChart3,
    accent: 'bg-indigo-500/10 text-indigo-600',
    status: 'live' as const,
    section: '3.7',
  },
]

export default function Dashboard() {
  const [data, setData] = useState<ErpLauncherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      setData(await fetchErpLauncherData())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load launcher')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const statsMap = new Map(data?.modules.map((m) => [m.module, m.stats]) ?? [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="ERP Console"
        description="Unified launcher for all marketplace ERP modules."
      />

      <AsyncState loading={loading} error={error} onRetry={() => { setLoading(true); void load() }}>
        {data ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {data.quickStats.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  change={stat.change}
                  changeTone="neutral"
                  icon={Gauge}
                  iconClassName="bg-primary/10 text-primary"
                />
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {moduleCards.map((mod) => (
                <ModuleHomeCard
                  key={mod.key}
                  title={mod.title}
                  description={mod.description}
                  to={mod.to}
                  icon={mod.icon}
                  accent={mod.accent}
                  status={mod.status}
                  section={mod.section}
                  stats={statsMap.get(mod.key)}
                />
              ))}
            </div>
          </>
        ) : null}
      </AsyncState>
    </div>
  )
}
