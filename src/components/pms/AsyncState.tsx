import { AlertCircle, Inbox, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface AsyncStateProps {
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  onRetry?: () => void
  children: React.ReactNode
  skeleton?: React.ReactNode
}

export function AsyncState({
  loading,
  error,
  empty,
  emptyTitle = 'No data yet',
  emptyDescription,
  emptyAction,
  onRetry,
  children,
  skeleton,
}: AsyncStateProps) {
  if (loading) {
    return (
      skeleton ?? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      )
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>{error}</span>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    )
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center shadow-[var(--shadow-card)]">
        <Inbox className="mb-3 size-10 text-muted-foreground/70" />
        <h3 className="text-base font-semibold text-foreground">{emptyTitle}</h3>
        {emptyDescription ? (
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        ) : null}
        {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
      </div>
    )
  }

  return <>{children}</>
}

export function SubmitSpinner() {
  return <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
}
