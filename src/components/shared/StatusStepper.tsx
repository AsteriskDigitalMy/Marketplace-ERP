import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatusStep {
  key: string
  label: string
  description?: string
}

interface StatusStepperProps {
  steps: StatusStep[]
  currentStepKey: string
  className?: string
}

export function StatusStepper({ steps, currentStepKey, className }: StatusStepperProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStepKey)

  return (
    <ol className={cn('flex flex-col gap-0 sm:flex-row sm:items-start', className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        return (
          <li
            key={step.key}
            className={cn(
              'relative flex flex-1 flex-col items-start pb-6 sm:pb-0 sm:items-center sm:text-center',
              index < steps.length - 1 &&
                'sm:after:absolute sm:after:left-1/2 sm:after:top-4 sm:after:h-0.5 sm:after:w-full sm:after:bg-border sm:after:content-[""]',
            )}
          >
            <div
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold',
                isComplete && 'border-primary bg-primary text-primary-foreground',
                isCurrent && 'border-primary bg-primary/10 text-primary',
                isPending && 'border-border bg-muted text-muted-foreground',
              )}
            >
              {isComplete ? <Check className="size-4" /> : index + 1}
            </div>
            <div className="mt-2 min-w-0 sm:px-2">
              <p
                className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-primary' : 'text-foreground',
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
