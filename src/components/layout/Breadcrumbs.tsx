import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { BreadcrumbItem } from '@/lib/navigation/page-meta'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('page-toolbar-breadcrumb', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <ChevronRight className="page-toolbar-breadcrumb-sep size-3 shrink-0" aria-hidden />
            ) : null}
            {item.href && !isLast ? (
              <Link to={item.href} className="page-toolbar-breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'page-toolbar-breadcrumb-current',
                  isLast && 'text-foreground',
                )}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
