import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TableCellPrimary({
  title,
  subtitle,
  leading,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{title}</div>
        {subtitle ? (
          <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
    </div>
  )
}

export function TableAvatar({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary',
        className,
      )}
    >
      {initials || '?'}
    </div>
  )
}
