import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const navItems = [
  { to: '/pdm', label: 'Overview', end: true },
  { to: '/pdm/projects', label: 'Projects' },
  { to: '/pdm/designs', label: 'Designs' },
  { to: '/pdm/sampling', label: 'Sampling' },
  { to: '/pdm/finalization', label: 'Finalization' },
  { to: '/pdm/processes', label: 'Process library' },
  { to: '/pdm/working-hours', label: 'Working hours' },
  { to: '/pdm/routing', label: 'Routing' },
  { to: '/pdm/bom', label: 'BOM' },
  { to: '/pdm/cost-pricing', label: 'Cost & pricing' },
  { to: '/pdm/changes', label: 'Changes' },
]

export default function PdmLayout() {
  return (
    <ModuleLayout navItems={navItems}>
      <Outlet />
    </ModuleLayout>
  )
}
