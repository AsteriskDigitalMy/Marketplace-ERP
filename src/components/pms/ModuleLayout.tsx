import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ModuleNavItem {
  to: string
  label: string
  end?: boolean
  badge?: number
}

interface ModuleLayoutProps {
  navItems: ModuleNavItem[]
  children: ReactNode
}

export function ModuleLayout({ navItems, children }: ModuleLayoutProps) {
  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap gap-0 border-b border-border"
        aria-label="Module navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                isActive && '-mb-px border-primary text-primary',
              )
            }
          >
            {item.label}
            {item.badge ? (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 justify-center bg-primary/10 px-1.5 text-[0.65rem] text-primary"
              >
                {item.badge}
              </Badge>
            ) : null}
          </NavLink>
        ))}
      </nav>

      {children}
    </div>
  )
}
