import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { buildBreadcrumbs, type BreadcrumbItem } from '@/lib/navigation/page-meta'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  const { pathname } = useLocation()
  const crumbs = breadcrumbs ?? buildBreadcrumbs(pathname, title)

  return (
    <div
      className={cn(
        'page-toolbar mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2.5">
        <Breadcrumbs items={crumbs} />
        <div className="flex flex-col gap-1">
          <h1 className="page-toolbar-title">{title}</h1>
          {description ? <p className="page-toolbar-description">{description}</p> : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
