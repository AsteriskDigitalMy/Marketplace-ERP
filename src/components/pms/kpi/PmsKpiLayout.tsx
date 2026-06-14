import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PMS</p>
        <h2 className="text-lg font-semibold">KPI Indicator Library</h2>
      </div>
      <nav className="flex flex-wrap gap-2 border-b pb-3" aria-label="PMS KPI">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
