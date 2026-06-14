import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PdaLayoutProps {
  title: string
  children: ReactNode
  backTo?: string
  className?: string
}

export function PdaLayout({ title, children, backTo = '/wms/pda', className }: PdaLayoutProps) {
  return (
    <div className={cn('mx-auto min-h-[calc(100vh-8rem)] max-w-[360px] space-y-4 p-4', className)}>
      <div className="flex items-center gap-2">
        {backTo ? (
          <Button variant="ghost" size="icon" asChild>
            <Link to={backTo} aria-label="Back">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        ) : null}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  )
}
