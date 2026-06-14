import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type ModuleStatus = 'live' | 'coming_soon'

interface ModuleHomeCardProps {
  title: string
  description: string
  to: string
  icon: ComponentType<{ className?: string }>
  accent: string
  status?: ModuleStatus
  section?: string
  stats?: { label: string; value: string }[]
}

export function ModuleHomeCard({
  title,
  description,
  to,
  icon: Icon,
  accent,
  status = 'live',
  section,
  stats,
}: ModuleHomeCardProps) {
  const isLive = status === 'live'

  const content = (
    <Card
      className={cn(
        'h-full border-border/80 shadow-[var(--shadow-card)] transition-all duration-200',
        isLive &&
          'group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:shadow-[var(--shadow-card-hover)]',
        !isLive && 'opacity-75',
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('metronic-stat-icon', accent)}>
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {section ? (
              <Badge variant="outline" className="text-[0.65rem] font-medium">
                {section}
              </Badge>
            ) : null}
            <Badge variant={isLive ? 'success' : 'secondary'} className="text-[0.65rem]">
              {isLive ? 'Live' : 'Coming soon'}
            </Badge>
          </div>
        </div>
        <div>
          <CardTitle className="text-base font-semibold leading-snug">{title}</CardTitle>
          <CardDescription className="mt-2 leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Open module
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Available in a future release</span>
        )}
      </CardContent>
    </Card>
  )

  if (!isLive) {
    return <div className="block h-full">{content}</div>
  }

  return (
    <Link to={to} className="group block h-full">
      {content}
    </Link>
  )
}
