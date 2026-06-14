import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PMS</p>
        <h2 className="text-lg font-semibold">Data Collection &amp; Filling</h2>
      </div>
      <nav className="flex flex-wrap gap-2 border-b pb-3" aria-label="PMS data collection">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {item.label}
            {'badge' in item && item.badge ? (
              <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1 text-xs">
                {item.badge}
              </Badge>
            ) : null}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
