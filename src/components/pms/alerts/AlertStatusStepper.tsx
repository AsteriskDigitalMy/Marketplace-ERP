import { cn } from '@/lib/utils'
import type { AlertRecord } from '@/models/pms/operations'

const STEPS: { key: AlertRecord['Status'] | 'triggered'; label: string }[] = [
  { key: 'triggered', label: 'Triggered' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'rectifying', label: 'Rectifying' },
  { key: 'pending_verification', label: 'Pending verification' },
  { key: 'closed', label: 'Closed' },
]

function stepIndex(status: AlertRecord['Status']): number {
  if (status === 'open') return 0
  if (status === 'investigating') return 1
  if (status === 'rectifying') return 2
  if (status === 'pending_verification') return 3
  return 4
}

export function AlertStatusStepper({ status }: { status: AlertRecord['Status'] }) {
  const active = stepIndex(status)

  return (
    <ol className="flex flex-wrap gap-2">
      {STEPS.map((step, i) => {
        const isActive = i === active
        const isDone = i < active
        return (
          <li
            key={step.key}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              isActive && 'border-primary bg-primary/10 text-primary',
              isDone && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
              !isActive && !isDone && 'border-border text-muted-foreground',
            )}
          >
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}
