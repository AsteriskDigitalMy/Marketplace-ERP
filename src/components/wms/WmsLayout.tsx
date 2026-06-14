import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const navItems = [
  { to: '/wms', label: 'Overview', end: true },
  { to: '/wms/locations', label: 'Locations' },
  { to: '/wms/materials', label: 'Materials' },
  { to: '/wms/strategies', label: 'Strategies' },
  { to: '/wms/inbound', label: 'Inbound' },
  { to: '/wms/outbound', label: 'Outbound' },
  { to: '/wms/transfers', label: 'Transfers' },
  { to: '/wms/alerts', label: 'Alerts' },
  { to: '/wms/batches', label: 'Batches' },
  { to: '/wms/reservations', label: 'Reservations' },
  { to: '/wms/stock-taking', label: 'Stock-taking' },
  { to: '/wms/traceability', label: 'Traceability' },
  { to: '/wms/reports', label: 'Reports' },
  { to: '/wms/pda', label: 'PDA home' },
]

export default function WmsLayout() {
  return (
    <ModuleLayout navItems={navItems}>
      <Outlet />
    </ModuleLayout>
  )
}
