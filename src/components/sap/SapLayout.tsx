import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const navItems = [
  { to: '/sap', label: 'Overview', end: true },
  { to: '/sap/config', label: 'Integration config' },
  { to: '/sap/master-data', label: 'Master data sync' },
  { to: '/sap/p2p', label: 'P2P (AP)' },
  { to: '/sap/o2c', label: 'O2C (AR)' },
  { to: '/sap/costing', label: 'Production costing' },
  { to: '/sap/inventory', label: 'Inventory valuation' },
  { to: '/sap/logs', label: 'Sync logs' },
  { to: '/sap/exceptions', label: 'Exceptions' },
]

export default function SapLayout() {
  return (
    <ModuleLayout navItems={navItems}>
      <Outlet />
    </ModuleLayout>
  )
}
