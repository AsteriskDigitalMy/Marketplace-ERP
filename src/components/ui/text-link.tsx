import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type TextLinkProps = {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'muted'
} & (
  | ({ to: string; href?: never } & Omit<ComponentProps<typeof Link>, 'to' | 'className'>)
  | ({ href: string; to?: never } & Omit<ComponentProps<'a'>, 'href' | 'className'>)
)

/** Inline content link — Metronic "Learn more" in card footers. */
export function TextLink({ children, className, variant = 'primary', to, href, ...rest }: TextLinkProps) {
  const styles = cn(
    'inline-flex items-center gap-1 text-2sm font-medium transition-colors',
    variant === 'primary' && 'text-primary hover:text-primary-hover hover:underline hover:underline-offset-4',
    variant === 'muted' && 'text-muted-foreground hover:text-primary hover:underline hover:underline-offset-4',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={styles} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={styles} {...rest}>
      {children}
    </a>
  )
}
