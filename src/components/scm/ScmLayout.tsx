import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const navItems = [
  { to: '/scm', label: 'Overview', end: true },
  { to: '/scm/customers', label: 'Customers' },
  { to: '/scm/orders', label: 'Sales orders' },
  { to: '/scm/suppliers', label: 'Suppliers' },
  { to: '/scm/procurement', label: 'Procurement' },
  { to: '/scm/purchase-orders', label: 'Purchase orders' },
  { to: '/scm/scheduling', label: 'Scheduling' },
  { to: '/scm/subcontracting', label: 'Subcontracting' },
  { to: '/scm/import-export', label: 'Import/export' },
  { to: '/scm/reports', label: 'Reports' },
]

export default function ScmLayout() {
  return (
    <ModuleLayout navItems={navItems}>
      <Outlet />
    </ModuleLayout>
  )
}
