import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface CockpitWidgetSlotProps {
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
  onRetry?: () => void
  children: ReactNode
  skeleton?: ReactNode
}

export function CockpitWidgetSlot({
  loading,
  error,
  empty,
  emptyMessage = 'No data to display',
  onRetry,
  children,
  skeleton,
}: CockpitWidgetSlotProps) {
  if (loading) {
    return (
      skeleton ?? (
        <div className="space-y-3 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      )
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="shadow-[var(--shadow-card)]">
        <AlertCircle className="size-4" />
        <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
          <span>{error}</span>
          {onRetry ? (
            <Button type="button" size="sm" variant="light" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    )
  }

  if (empty) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]">
        {emptyMessage}
      </div>
    )
  }

  return <>{children}</>
}
