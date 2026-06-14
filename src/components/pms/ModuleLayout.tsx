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
  section: string
  title: string
  description?: string
  navItems: ModuleNavItem[]
  children: ReactNode
}

export function ModuleLayout({
  section,
  title,
  description,
  navItems,
  children,
}: ModuleLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{section}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <nav
        className="flex flex-wrap gap-0 border-b border-border"
        aria-label={`${title} navigation`}
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
