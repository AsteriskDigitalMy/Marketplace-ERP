import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActionLink } from '@/components/ui/action-link'
import { cn } from '@/lib/utils'

interface ContentPanelProps {
  title: string
  description?: string
  actions?: ReactNode
  headerAction?: { label: string; onClick?: () => void; to?: string; href?: string }
  children: ReactNode
  className?: string
  noPadding?: boolean
}

function renderHeaderAction(headerAction: NonNullable<ContentPanelProps['headerAction']>) {
  if (headerAction.to) {
    return <ActionLink to={headerAction.to}>{headerAction.label}</ActionLink>
  }
  if (headerAction.href) {
    return <ActionLink href={headerAction.href}>{headerAction.label}</ActionLink>
  }
  if (headerAction.onClick) {
    return <ActionLink onClick={headerAction.onClick}>{headerAction.label}</ActionLink>
  }
  return null
}

export function ContentPanel({
  title,
  description,
  actions,
  headerAction,
  children,
  className,
  noPadding,
}: ContentPanelProps) {
  const headerActions = headerAction ? renderHeaderAction(headerAction) : actions

  return (
    <Card className={cn('shadow-[var(--shadow-card)]', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <CardTitle className="type-card-title">{title}</CardTitle>
          {description ? (
            <p className="type-card-description mt-1">{description}</p>
          ) : null}
        </div>
        {headerActions ? (
          <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
        ) : null}
      </CardHeader>
      <CardContent className={cn(noPadding && 'p-0')}>{children}</CardContent>
    </Card>
  )
}
