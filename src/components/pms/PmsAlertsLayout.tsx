import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const alertsNav = [
  { to: '/pms/alerts', label: 'Alert Inbox' },
  { to: '/pms/alerts/rules', label: 'Alert Rules' },
]

export default function PmsAlertsLayout() {
  return (
    <ModuleLayout navItems={alertsNav}>
      <Outlet />
    </ModuleLayout>
  )
}
