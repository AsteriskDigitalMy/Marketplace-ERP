import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const navItems = [
  { to: '/mes', label: 'Overview', end: true },
  { to: '/mes/work-orders', label: 'Work orders' },
  { to: '/mes/scheduling', label: 'Scheduling' },
  { to: '/mes/cutting', label: 'Cutting' },
  { to: '/mes/sewing', label: 'Sewing' },
  { to: '/mes/post-processing', label: 'Post-processing' },
  { to: '/mes/traceability', label: 'Traceability' },
  { to: '/mes/quality', label: 'Quality' },
  { to: '/mes/rework', label: 'Rework' },
  { to: '/mes/equipment', label: 'Equipment' },
  { to: '/mes/tooling', label: 'Tooling' },
  { to: '/mes/personnel', label: 'Personnel' },
  { to: '/mes/wages', label: 'Wages' },
  { to: '/mes/costs', label: 'Costs' },
  { to: '/mes/reports', label: 'Reports' },
  { to: '/mes/pad', label: 'Pad home' },
]

export default function MesLayout() {
  return (
    <ModuleLayout navItems={navItems}>
      <Outlet />
    </ModuleLayout>
  )
}
