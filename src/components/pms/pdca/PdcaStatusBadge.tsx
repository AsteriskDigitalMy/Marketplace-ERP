import { Badge } from '@/components/ui/badge'
import { PDCA_STATUS_LABELS, pdcaStatusBadgeClass } from '@/lib/pms/pdca-helpers'
import type { PdcaProposal } from '@/models/pms/operations'
import { cn } from '@/lib/utils'

interface PdcaStatusBadgeProps {
  status: PdcaProposal['Status']
  className?: string
}

export function PdcaStatusBadge({ status, className }: PdcaStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium', pdcaStatusBadgeClass(status), className)}>
      {PDCA_STATUS_LABELS[status]}
    </Badge>
  )
}
