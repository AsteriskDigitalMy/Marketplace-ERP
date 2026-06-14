import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'

const appraisalNav = [
  { to: '/pms/appraisal/schemes', label: 'Schemes' },
  { to: '/pms/appraisal/cycles', label: 'Cycles' },
  { to: '/pms/appraisal/preliminary', label: 'Preliminary Review' },
  { to: '/pms/appraisal/hr', label: 'HR Rectification' },
  { to: '/pms/appraisal/secondary', label: 'Secondary Review' },
  { to: '/pms/appraisal/final', label: 'Final Review' },
]

export default function PmsAppraisalLayout() {
  return (
    <ModuleLayout navItems={appraisalNav}>
      <Outlet />
    </ModuleLayout>
  )
}
