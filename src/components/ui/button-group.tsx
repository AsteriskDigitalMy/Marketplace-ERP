import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonGroupProps {
  children: ReactNode
  className?: string
}

/** Side-by-side actions — Metronic "Cancel Plan" + "Upgrade Plan". */
export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return <div className={cn('flex flex-wrap items-center gap-2.5', className)}>{children}</div>
}
