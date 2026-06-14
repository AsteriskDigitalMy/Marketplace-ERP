import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'
import { usePmsAuth } from '@/contexts/pms-auth-context'

const baseNavItems = [{ to: '/pms/kpi/indicators', label: 'Indicators' }]

const calculationNavItems = [
  { to: '/pms/kpi/calculation/jobs', label: 'Calculation jobs' },
  { to: '/pms/kpi/calculation/recalculate', label: 'Re-calculate' },
]

export default function PmsKpiLayout() {
  const { hasPermission } = usePmsAuth()
  const navItems = [
    ...baseNavItems,
    ...(hasPermission('kpi.calculate') ? calculationNavItems : []),
  ]

  return (
    <ModuleLayout
      section="PMS · 3.1.2 / 3.1.5"
      title="KPI Indicator Library"
      description="Define indicators, formulas, versions, scheduled calculation, and manual re-calculation."
      navItems={navItems}
    >
      <Outlet />
    </ModuleLayout>
  )
}
