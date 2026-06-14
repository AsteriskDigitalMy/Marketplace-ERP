import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

const LABELS: Record<string, string> = {
  pms: 'PMS',
  admin: 'Admin',
  org: 'Organization',
  accounts: 'Accounts',
  roles: 'Roles',
  dictionaries: 'Dictionaries',
  logs: 'Logs',
  parameters: 'Parameters',
  kpi: 'KPI',
  indicators: 'Indicators',
  calculation: 'Calculation',
  jobs: 'Jobs',
  recalculate: 'Re-calculate',
  history: 'History',
  projects: 'Projects',
  approvals: 'Approvals',
  'acceptance-reviews': 'Acceptance',
  tasks: 'Tasks',
  my: 'My Tasks',
  'data-collection': 'Data Collection',
  rules: 'Rules',
  reviews: 'Reviews',
  fill: 'Fill',
  inventory: 'Inventory',
  orders: 'Orders',
  customers: 'Customers',
  reports: 'Reports',
  settings: 'Settings',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Home className="size-3.5" />
        <span className="font-medium text-foreground">Home</span>
      </nav>
    )
  }

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const isLast = i === segments.length - 1
    const label = LABELS[seg] ?? (seg.length > 12 ? `${seg.slice(0, 8)}…` : seg)
    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <Link to="/" className="transition-colors hover:text-foreground">
        <Home className="size-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <Fragment key={crumb.href}>
          <ChevronRight className="size-3 opacity-50" aria-hidden />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="transition-colors hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
