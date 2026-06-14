import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'
import { fetchProjectNavBadges } from '@/services/pms/project/project-service'

export default function PmsProjectLayout() {
  const [badges, setBadges] = useState({
    pendingApprovals: 0,
    pendingAcceptance: 0,
    myTasks: 0,
  })

  useEffect(() => {
    void fetchProjectNavBadges().then(setBadges)
  }, [])

  const navItems = [
    { to: '/pms/projects', label: 'Projects', end: true },
    {
      to: '/pms/projects/approvals',
      label: 'Initiation Approvals',
      badge: badges.pendingApprovals,
    },
    {
      to: '/pms/projects/acceptance-reviews',
      label: 'Acceptance Reviews',
      badge: badges.pendingAcceptance,
    },
    { to: '/pms/tasks/my', label: 'My Tasks', badge: badges.myTasks },
  ]

  return (
    <ModuleLayout
      section="PMS · 3.1.3"
      title="Project Management"
      description="Initiation, tasks, progress tracking, issues, Gantt charts, and acceptance workflows."
      navItems={navItems}
    >
      <Outlet />
    </ModuleLayout>
  )
}
