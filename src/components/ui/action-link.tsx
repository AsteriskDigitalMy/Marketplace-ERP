import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActionLinkBaseProps = {
  children: ReactNode
  className?: string
  variant?: 'link' | 'link-muted'
}

type ActionLinkToProps = ActionLinkBaseProps & {
  to: string
}

type ActionLinkHrefProps = ActionLinkBaseProps & {
  href: string
}

type ActionLinkButtonProps = ActionLinkBaseProps & {
  onClick: () => void
}

type ActionLinkProps = ActionLinkToProps | ActionLinkHrefProps | ActionLinkButtonProps

/** Card/section header text action — Metronic "Edit Billing", "Download All". */
export function ActionLink(props: ActionLinkProps) {
  const { children, className, variant = 'link' } = props

  if ('to' in props) {
    return (
      <Button asChild variant={variant} size="link" className={cn('font-medium', className)}>
        <Link to={props.to}>{children}</Link>
      </Button>
    )
  }

  if ('href' in props) {
    return (
      <Button asChild variant={variant} size="link" className={cn('font-medium', className)}>
        <a href={props.href}>{children}</a>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="link"
      className={cn('font-medium', className)}
      onClick={props.onClick}
    >
      {children}
    </Button>
  )
}
