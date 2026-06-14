import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const pdcaNav = [
  { to: '/pms/pdca/proposals', label: 'My Proposals', end: true },
  { to: '/pms/pdca/tasks', label: 'My PDCA Tasks' },
]

export default function PmsPdcaLayout() {
  return (
    <ModuleLayout navItems={pdcaNav}>
      <Outlet />
    </ModuleLayout>
  )
}
