import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ContentPanelProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function ContentPanel({
  title,
  description,
  actions,
  children,
  className,
  noPadding,
}: ContentPanelProps) {
  return (
    <Card className={cn('shadow-[var(--shadow-card)]', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className={cn(noPadding && 'p-0')}>{children}</CardContent>
    </Card>
  )
}
