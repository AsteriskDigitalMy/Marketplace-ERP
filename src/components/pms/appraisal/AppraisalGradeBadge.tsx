import { Badge } from '@/components/ui/badge'
import type { PerformanceGrade } from '@/models/common/enums'
import { gradeColorClass } from '@/lib/pms/appraisal-helpers'

export function AppraisalGradeBadge({ grade }: { grade: PerformanceGrade }) {
  return <Badge className={gradeColorClass(grade)}>{grade}</Badge>
}
