import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumbs } from './Breadcrumbs'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/inventory': 'Inventory',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/pms': 'Performance Management',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/pms/admin')) return 'System Management'
  if (pathname.startsWith('/pms/kpi/calculation')) return 'KPI Calculation'
  if (pathname.startsWith('/pms/kpi')) return 'KPI Library'
  if (pathname.startsWith('/pms/projects') || pathname.startsWith('/pms/tasks')) {
    return 'Project Management'
  }
  if (pathname.startsWith('/pms/data-collection')) return 'Data Collection'
  return routeTitles[pathname] ?? 'Marketplace ERP'
}

export default function AppHeader() {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  return (
    <header className="app-header">
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
        <h1 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 w-56 border-border bg-muted/40 pl-9 text-sm shadow-none focus-visible:bg-card"
          />
        </div>
        <Button variant="light" size="icon" className="size-9 shrink-0">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          SA
        </div>
      </div>
    </header>
  )
}
