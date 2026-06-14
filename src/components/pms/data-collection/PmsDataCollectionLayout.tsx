import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ModuleLayout } from '@/components/pms/ModuleLayout'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { fetchDataCollectionNavBadges } from '@/services/pms/data-collection/data-collection-service'

export default function PmsDataCollectionLayout() {
  const { userId, hasPermission } = usePmsAuth()
  const [badges, setBadges] = useState({ myDueTasks: 0, pendingReviews: 0 })

  useEffect(() => {
    void fetchDataCollectionNavBadges(userId).then(setBadges)
  }, [userId])

  const navItems = [
    ...(hasPermission('data.manage')
      ? [
          { to: '/pms/data-collection/rules', label: 'Filling rules' },
          { to: '/pms/data-collection/tasks', label: 'Task monitor' },
        ]
      : []),
    {
      to: '/pms/data-collection/my-tasks',
      label: 'My filling tasks',
      badge: badges.myDueTasks,
    },
    ...(hasPermission('data.review')
      ? [
          {
            to: '/pms/data-collection/reviews',
            label: 'Data review',
            badge: badges.pendingReviews,
          },
        ]
      : []),
  ]

  return (
    <ModuleLayout
      section="PMS · 3.1.4"
      title="Data Collection & Filling"
      description="Periodic filling tasks, manual entry forms, and multi-level data review workflows."
      navItems={navItems}
    >
      <Outlet />
    </ModuleLayout>
  )
}
