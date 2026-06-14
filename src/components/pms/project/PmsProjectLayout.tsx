import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PMS</p>
        <h2 className="text-lg font-semibold">Project Management</h2>
      </div>
      <nav className="flex flex-wrap gap-2 border-b pb-3" aria-label="PMS projects">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
            {item.badge ? (
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
