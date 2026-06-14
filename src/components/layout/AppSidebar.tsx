import { useEffect, useState, type ComponentType } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Calculator,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  Minus,
  Plus,
  Settings,
  ShoppingCart,
  Users,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLeaf {
  to: string
  label: string
  icon?: ComponentType<{ className?: string }>
  end?: boolean
}

const erpNav: NavLeaf[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const pmsNav: NavLeaf[] = [
  { to: '/pms', label: 'Overview', icon: Workflow, end: true },
  { to: '/pms/admin/org', label: 'Administration', icon: Building2 },
  { to: '/pms/kpi/indicators', label: 'KPI Indicators', icon: BarChart3 },
  { to: '/pms/projects', label: 'Projects', icon: FolderKanban },
  { to: '/pms/data-collection/my-tasks', label: 'Data Collection', icon: ClipboardList },
  { to: '/pms/kpi/calculation/jobs', label: 'KPI Calculation', icon: Calculator },
  { to: '/pms/cockpit', label: 'KPI Cockpit', icon: Gauge },
  { to: '/pms/alerts', label: 'Exception Alerts', icon: Bell },
  { to: '/pms/appraisal/schemes', label: 'Performance Appraisal', icon: ClipboardCheck },
  { to: '/pms/pdca/proposals', label: 'PDCA Improvement', icon: ClipboardList },
]

function MenuBullet() {
  return <span className="kt-menu-bullet" aria-hidden />
}

function MenuIcon({ icon: Icon }: { icon: ComponentType<{ className?: string }> }) {
  return (
    <span className="kt-menu-icon">
      <Icon className="size-[18px]" aria-hidden />
    </span>
  )
}

function MenuHeading({ children }: { children: string }) {
  return (
    <div className="kt-menu-item kt-menu-item--heading">
      <span className="kt-menu-heading">{children}</span>
    </div>
  )
}

function MenuLeafLink({ to, label, end }: NavLeaf) {
  return (
    <div className="kt-menu-item">
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn('kt-menu-link kt-menu-link--leaf', isActive && 'kt-menu-link--active')
        }
      >
        <MenuBullet />
        <span className="kt-menu-title">{label}</span>
      </NavLink>
    </div>
  )
}

function MenuTopLink({ to, label, icon: Icon, end }: NavLeaf & { icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="kt-menu-item">
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn('kt-menu-link kt-menu-link--top', isActive && 'kt-menu-link--active')
        }
      >
        <MenuIcon icon={Icon} />
        <span className="kt-menu-title">{label}</span>
      </NavLink>
    </div>
  )
}

function PmsAccordion({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const location = useLocation()
  const isGroupActive = location.pathname.startsWith('/pms')

  return (
    <div className={cn('kt-menu-item', open && 'kt-menu-item--show', isGroupActive && 'kt-menu-item--here')}>
      <button
        type="button"
        className="kt-menu-link kt-menu-link--top w-full"
        onClick={onToggle}
        aria-expanded={open}
      >
        <MenuIcon icon={Workflow} />
        <span className="kt-menu-title">Performance Management</span>
        <span className="kt-menu-arrow">
          {open ? <Minus className="size-2.5" aria-hidden /> : <Plus className="size-2.5" aria-hidden />}
        </span>
      </button>
      <div className="kt-menu-accordion">
        {pmsNav.map((item) => (
          <MenuLeafLink key={item.to} {...item} />
        ))}
      </div>
    </div>
  )
}

export default function AppSidebar() {
  const location = useLocation()
  const isPmsRoute = location.pathname.startsWith('/pms')
  const [pmsOpen, setPmsOpen] = useState(isPmsRoute)

  useEffect(() => {
    if (isPmsRoute) {
      setPmsOpen(true)
    }
  }, [isPmsRoute])

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">M</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Marketplace ERP</p>
          <p className="truncate text-xs text-muted-foreground">Operations Console</p>
        </div>
      </div>

      <div className="sidebar-scroll">
        <nav className="kt-menu" aria-label="Main navigation">
          <MenuHeading>Applications</MenuHeading>
          {erpNav.map((item) => (
            <MenuTopLink key={item.to} {...item} icon={item.icon!} />
          ))}

          <MenuHeading>Modules</MenuHeading>
          <PmsAccordion open={pmsOpen} onToggle={() => setPmsOpen((value) => !value)} />
        </nav>
      </div>
    </aside>
  )
}
