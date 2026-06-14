import type { PdcaExecutionTask, PdcaProposal } from '@/models/pms/operations'

export const PDCA_CATEGORIES: { value: PdcaProposal['Category']; label: string }[] = [
  { value: 'production', label: 'Production' },
  { value: 'cost', label: 'Cost' },
  { value: 'efficiency', label: 'Efficiency' },
  { value: 'management', label: 'Management' },
]

export const PDCA_STATUS_LABELS: Record<PdcaProposal['Status'], string> = {
  pending_evaluation: 'Pending evaluation',
  approved: 'Approved',
  rejected: 'Rejected',
  in_execution: 'In execution',
  completed: 'Completed',
}

export const PDCA_TASK_STATUS_LABELS: Record<PdcaExecutionTask['Status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  overdue: 'Overdue',
}

export function pdcaCategoryLabel(category: PdcaProposal['Category']): string {
  return PDCA_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export function pdcaStatusBadgeClass(status: PdcaProposal['Status']): string {
  switch (status) {
    case 'pending_evaluation':
      return 'bg-warning/15 text-warning-foreground border-warning/30'
    case 'approved':
      return 'bg-success/15 text-success border-success/30'
    case 'rejected':
      return 'bg-destructive/10 text-destructive border-destructive/30'
    case 'in_execution':
      return 'bg-primary/10 text-primary border-primary/30'
    case 'completed':
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function pdcaTaskStatusBadgeClass(status: PdcaExecutionTask['Status']): string {
  switch (status) {
    case 'not_started':
      return 'bg-muted text-muted-foreground'
    case 'in_progress':
      return 'bg-primary/10 text-primary'
    case 'completed':
      return 'bg-success/15 text-success'
    case 'overdue':
      return 'bg-destructive/10 text-destructive'
  }
}

export function isPdcaTaskOverdue(task: PdcaExecutionTask): boolean {
  if (task.Status === 'completed') return false
  return new Date(task.PlannedDeadline) < new Date(new Date().toDateString())
}

export function computeTaskStatus(
  progressPct: number,
  plannedDeadline: string,
): PdcaExecutionTask['Status'] {
  if (progressPct >= 100) return 'completed'
  const overdue = new Date(plannedDeadline) < new Date(new Date().toDateString())
  if (overdue) return 'overdue'
  if (progressPct > 0) return 'in_progress'
  return 'not_started'
}

export function computeOverallProgress(tasks: PdcaExecutionTask[]): number {
  if (tasks.length === 0) return 0
  const sum = tasks.reduce((acc, t) => acc + t.ProgressPct, 0)
  return Math.round(sum / tasks.length)
}
