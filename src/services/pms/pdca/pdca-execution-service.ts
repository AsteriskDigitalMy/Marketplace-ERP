import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import {
  computeOverallProgress,
  computeTaskStatus,
  isPdcaTaskOverdue,
} from '@/lib/pms/pdca-helpers'
import { pdcaExecutionStore } from '@/mocks/pms/pdca-execution-store'
import { pdcaProposalsStore } from '@/mocks/pms/pdca-proposals-store'
import { PdcaExecutionTaskSchema, type PdcaExecutionTask } from '@/models/pms/operations'

export interface PdcaExecutionStepInput {
  description: string
  ownerId: string
  ownerName: string
  plannedDeadline: string
}

export interface PdcaExecutionSummary {
  ProposalId: string
  OverallProgressPct: number
  Tasks: PdcaExecutionTask[]
  TasksCreated: boolean
}

export interface PdcaTaskFilters {
  ownerId?: string
  status?: PdcaExecutionTask['Status'] | 'all'
  overdueOnly?: boolean
}

export async function fetchPdcaExecutionSummary(proposalId: string): Promise<PdcaExecutionSummary> {
  await randomDelay()
  const proposal = pdcaProposalsStore.getById(proposalId)
  if (!proposal) throw new ApiError('Proposal not found', 404)

  const tasks = pdcaExecutionStore.listByProposal(proposalId)
  return {
    ProposalId: proposalId,
    OverallProgressPct: computeOverallProgress(tasks),
    Tasks: tasks,
    TasksCreated: pdcaExecutionStore.hasTasksForProposal(proposalId),
  }
}

export async function createPdcaExecutionTasks(
  proposalId: string,
  steps: PdcaExecutionStepInput[],
): Promise<PdcaExecutionSummary> {
  await randomDelay()
  const proposal = pdcaProposalsStore.getById(proposalId)
  if (!proposal) throw new ApiError('Proposal not found', 404)
  if (!['approved', 'in_execution'].includes(proposal.Status)) {
    throw new ApiError('Proposal must be approved before creating execution tasks', 403)
  }
  if (steps.length === 0) {
    throw new ApiError('At least one execution step is required', 400)
  }

  for (const step of steps) {
    if (!step.description.trim()) throw new ApiError('Step description is required', 400)
    if (!step.ownerId) throw new ApiError('Responsible person is required', 400)
    if (!step.plannedDeadline) throw new ApiError('Planned deadline is required', 400)
  }

  const created = pdcaExecutionStore.replaceProposalTasks(
    proposalId,
    proposal.Title,
    steps.map((s) => ({
      StepOrder: 0,
      Description: s.description.trim(),
      OwnerId: s.ownerId,
      OwnerName: s.ownerName,
      PlannedDeadline: s.plannedDeadline,
    })),
  )

  for (const task of created) {
    const parsed = PdcaExecutionTaskSchema.safeParse(task)
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid task', 400)
    }
  }

  pdcaProposalsStore.save({ ...proposal, Status: 'in_execution' })
  return fetchPdcaExecutionSummary(proposalId)
}

export async function fetchPdcaTasks(filters?: PdcaTaskFilters): Promise<PdcaExecutionTask[]> {
  await randomDelay()
  let list = pdcaExecutionStore.list()
  if (filters?.ownerId) {
    list = list.filter((t) => t.OwnerId === filters.ownerId)
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((t) => t.Status === filters.status)
  }
  if (filters?.overdueOnly) {
    list = list.filter((t) => isPdcaTaskOverdue(t))
  }
  return list
}

export async function fetchPdcaTask(id: string): Promise<PdcaExecutionTask> {
  await randomDelay()
  const task = pdcaExecutionStore.getById(id)
  if (!task) throw new ApiError('Task not found', 404)
  return task
}

export async function updatePdcaTaskProgress(
  taskId: string,
  input: { progressPct: number; note: string },
  actorId: string,
): Promise<PdcaExecutionTask> {
  await randomDelay()
  const task = pdcaExecutionStore.getById(taskId)
  if (!task) throw new ApiError('Task not found', 404)
  if (task.OwnerId !== actorId) throw new ApiError('You can only update your own tasks', 403)

  const progressPct = Math.min(100, Math.max(0, input.progressPct))
  if (progressPct < 100 && !input.note.trim()) {
    throw new ApiError('Progress notes are required when progress is below 100%', 400)
  }

  const status = computeTaskStatus(progressPct, task.PlannedDeadline)
  const updated: PdcaExecutionTask = {
    ...task,
    ProgressPct: progressPct,
    Status: status,
    ProgressNotes: [
      ...task.ProgressNotes,
      {
        At: new Date().toISOString(),
        Note: input.note.trim() || 'Marked complete',
        ProgressPct: progressPct,
      },
    ],
  }

  pdcaExecutionStore.save(updated)
  await syncProposalProgress(task.ProposalId)
  return updated
}

async function syncProposalProgress(proposalId: string): Promise<void> {
  const proposal = pdcaProposalsStore.getById(proposalId)
  if (!proposal) return
  const tasks = pdcaExecutionStore.listByProposal(proposalId)
  if (tasks.length === 0) return

  const overall = computeOverallProgress(tasks)
  let status = proposal.Status
  if (overall >= 100) status = 'completed'
  else if (proposal.Status === 'approved') status = 'in_execution'

  pdcaProposalsStore.save({ ...proposal, Status: status })
}

export function assertProposalExecutionAccess(
  proposalStatus: string,
  canManage: boolean,
): void {
  if (!['approved', 'in_execution', 'completed'].includes(proposalStatus)) {
    throw new ApiError('Execution is only available for approved proposals', 403)
  }
  if (!canManage) {
    throw new ApiError('Management permission required', 403)
  }
}
