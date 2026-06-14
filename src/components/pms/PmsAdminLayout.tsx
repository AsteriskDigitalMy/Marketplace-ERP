import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

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
    <ModuleLayout navItems={adminNav}>
      <Outlet />
    </ModuleLayout>
  )
}
