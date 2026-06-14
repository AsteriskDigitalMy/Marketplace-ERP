import { cn } from '@/lib/utils'
import type { TrafficLightColor } from '@/models/common/enums'
import { statusDotClass } from '@/lib/pms/traffic-light'

export function StatusColorDot({
  color,
  className,
}: {
  color: TrafficLightColor
  className?: string
}) {
  return (
    <span
      className={cn('inline-block size-2.5 shrink-0 rounded-full', statusDotClass(color), className)}
      aria-hidden
    />
  )
}
