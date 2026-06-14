import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const adminNav = [
  { to: '/pms/admin/org', label: 'Organization' },
  { to: '/pms/admin/accounts', label: 'Accounts' },
  { to: '/pms/admin/roles', label: 'Roles' },
  { to: '/pms/admin/dictionaries', label: 'Dictionaries' },
  { to: '/pms/admin/logs', label: 'Operation Logs' },
  { to: '/pms/admin/parameters', label: 'Parameters' },
]

export default function PmsAdminLayout() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PMS</p>
        <h2 className="text-lg font-semibold">System Basic Management</h2>
      </div>
      <nav className="flex flex-wrap gap-2 border-b pb-3" aria-label="PMS admin">
        {adminNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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
