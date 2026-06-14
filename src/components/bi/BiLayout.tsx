import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const navItems = [
  { to: '/bi', label: 'Home', end: true },
  { to: '/bi/executive', label: 'Executive' },
  { to: '/bi/operations/scm', label: 'SCM' },
  { to: '/bi/operations/mes', label: 'MES' },
  { to: '/bi/operations/wms', label: 'WMS' },
  { to: '/bi/operations/finance', label: 'Finance' },
  { to: '/bi/operations/kpi', label: 'KPI / PMS' },
  { to: '/bi/kanban/workshop', label: 'Workshop kanban' },
  { to: '/bi/kanban/warehouse', label: 'Warehouse kanban' },
  { to: '/bi/reports/designer', label: 'Report designer' },
  { to: '/bi/reports', label: 'My reports' },
  { to: '/bi/alerts', label: 'Alerts' },
]

export default function BiLayout() {
  return (
    <ModuleLayout navItems={navItems}>
      <Outlet />
    </ModuleLayout>
  )
}
