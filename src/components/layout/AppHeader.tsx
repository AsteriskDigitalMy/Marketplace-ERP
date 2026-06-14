import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="hidden min-w-0 flex-1 md:block" />

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 w-44 border-border bg-card pl-9 text-sm shadow-none focus-visible:border-primary lg:w-56"
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
