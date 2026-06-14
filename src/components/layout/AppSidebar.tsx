import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Boxes,
  Gauge,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const erpNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const pmsNav = [
  { to: '/pms', label: 'Performance Management', icon: Workflow, end: true },
  { to: '/pms/cockpit', label: 'KPI Cockpit', icon: Gauge },
  { to: '/pms/alerts', label: 'Alerts', icon: Bell },
]

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn('sidebar-link', isActive && 'sidebar-link--active')
      }
    >
      <Icon className="sidebar-link-icon" aria-hidden />
      {label}
    </NavLink>
  )
}

export default function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">M</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Marketplace ERP</p>
          <p className="truncate text-xs text-muted-foreground">Operations Console</p>
        </div>
      </div>

      <p className="sidebar-section-label">Applications</p>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {erpNav.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <p className="sidebar-section-label">Modules</p>
      <nav className="sidebar-nav border-t-0 pt-0" aria-label="PMS navigation">
        {pmsNav.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  )
}
