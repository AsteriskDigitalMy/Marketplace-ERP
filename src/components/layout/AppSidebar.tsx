import { useEffect, useState, type ComponentType } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  Factory,
  Layers,
  LayoutDashboard,
  Link2,
  Minus,
  Plus,
  Settings,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLeaf {
  to: string
  label: string
  end?: boolean
}

interface NavGroup {
  id: string
  title: string
  icon: ComponentType<{ className?: string }>
  prefix: string
  items: NavLeaf[]
}

const erpNav = [
  { to: '/', label: 'ERP Console', icon: LayoutDashboard, end: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const moduleGroups: NavGroup[] = [
  {
    id: 'pms',
    title: 'Performance Management',
    icon: Workflow,
    prefix: '/pms',
    items: [
      { to: '/pms', label: 'Overview', end: true },
      { to: '/pms/admin/org', label: 'Administration' },
      { to: '/pms/kpi/indicators', label: 'KPI Indicators' },
      { to: '/pms/projects', label: 'Projects' },
      { to: '/pms/data-collection/my-tasks', label: 'Data Collection' },
      { to: '/pms/kpi/calculation/jobs', label: 'KPI Calculation' },
      { to: '/pms/cockpit', label: 'KPI Cockpit' },
      { to: '/pms/alerts', label: 'Exception Alerts' },
      { to: '/pms/appraisal/schemes', label: 'Performance Appraisal' },
      { to: '/pms/pdca/proposals', label: 'PDCA Improvement' },
      { to: '/pms/reports', label: 'Report Center' },
    ],
  },
  {
    id: 'pdm',
    title: 'Product Data (PDM)',
    icon: Layers,
    prefix: '/pdm',
    items: [
      { to: '/pdm', label: 'Overview', end: true },
      { to: '/pdm/projects', label: 'Projects' },
      { to: '/pdm/designs', label: 'Designs' },
      { to: '/pdm/sampling', label: 'Sampling' },
      { to: '/pdm/bom', label: 'BOM' },
      { to: '/pdm/changes', label: 'Changes' },
    ],
  },
  {
    id: 'scm',
    title: 'Supply Chain (SCM)',
    icon: Boxes,
    prefix: '/scm',
    items: [
      { to: '/scm', label: 'Overview', end: true },
      { to: '/scm/customers', label: 'Customers' },
      { to: '/scm/orders', label: 'Sales orders' },
      { to: '/scm/suppliers', label: 'Suppliers' },
      { to: '/scm/purchase-orders', label: 'Purchase orders' },
      { to: '/scm/scheduling', label: 'Scheduling' },
      { to: '/portal/orders', label: 'Customer portal' },
    ],
  },
  {
    id: 'mes',
    title: 'Manufacturing (MES)',
    icon: Factory,
    prefix: '/mes',
    items: [
      { to: '/mes', label: 'Overview', end: true },
      { to: '/mes/work-orders', label: 'Work orders' },
      { to: '/mes/quality', label: 'Quality' },
      { to: '/mes/equipment', label: 'Equipment' },
      { to: '/mes/pad', label: 'Pad home' },
    ],
  },
  {
    id: 'wms',
    title: 'Warehouse (WMS)',
    icon: Boxes,
    prefix: '/wms',
    items: [
      { to: '/wms', label: 'Overview', end: true },
      { to: '/wms/inbound', label: 'Inbound' },
      { to: '/wms/outbound', label: 'Outbound' },
      { to: '/wms/materials', label: 'Materials' },
      { to: '/wms/pda', label: 'PDA home' },
    ],
  },
  {
    id: 'sap',
    title: 'SAP Integration',
    icon: Link2,
    prefix: '/sap',
    items: [
      { to: '/sap', label: 'Overview', end: true },
      { to: '/sap/p2p', label: 'P2P (AP)' },
      { to: '/sap/o2c', label: 'O2C (AR)' },
      { to: '/sap/logs', label: 'Sync logs' },
      { to: '/sap/exceptions', label: 'Exceptions' },
    ],
  },
  {
    id: 'bi',
    title: 'Business Intelligence',
    icon: BarChart3,
    prefix: '/bi',
    items: [
      { to: '/bi', label: 'Home', end: true },
      { to: '/bi/executive', label: 'Executive cockpit' },
      { to: '/bi/operations/scm', label: 'SCM dashboard' },
      { to: '/bi/operations/mes', label: 'MES dashboard' },
      { to: '/bi/kanban/workshop', label: 'Workshop kanban' },
    ],
  },
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

function MenuTopLink({
  to,
  label,
  icon: Icon,
  end,
}: NavLeaf & { icon: ComponentType<{ className?: string }> }) {
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

function ModuleAccordion({
  group,
  open,
  onToggle,
}: {
  group: NavGroup
  open: boolean
  onToggle: () => void
}) {
  const location = useLocation()
  const isGroupActive = location.pathname.startsWith(group.prefix)

  return (
    <div
      className={cn(
        'kt-menu-item',
        open && 'kt-menu-item--show',
        isGroupActive && 'kt-menu-item--here',
      )}
    >
      <button
        type="button"
        className="kt-menu-link kt-menu-link--top w-full"
        onClick={onToggle}
        aria-expanded={open}
      >
        <MenuIcon icon={group.icon} />
        <span className="kt-menu-title">{group.title}</span>
        <span className="kt-menu-arrow">
          {open ? <Minus className="size-2.5" aria-hidden /> : <Plus className="size-2.5" aria-hidden />}
        </span>
      </button>
      <div className="kt-menu-accordion">
        {group.items.map((item) => (
          <MenuLeafLink key={item.to} {...item} />
        ))}
      </div>
    </div>
  )
}

export default function AppSidebar() {
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const active = moduleGroups.find((g) => location.pathname.startsWith(g.prefix))
    if (active) {
      setOpenGroups((prev) => ({ ...prev, [active.id]: true }))
    }
  }, [location.pathname])

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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
            <MenuTopLink key={item.to} {...item} icon={item.icon} />
          ))}

          <MenuHeading>Modules</MenuHeading>
          {moduleGroups.map((group) => (
            <ModuleAccordion
              key={group.id}
              group={group}
              open={!!openGroups[group.id]}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </nav>
      </div>
    </aside>
  )
}
