import type { PdcaExecutionTask } from '@/models/pms/operations'
import {
  MOCK_ADMIN_USER_ID,
  MOCK_EXECUTOR_USER_ID,
  MOCK_LEADER_USER_ID,
} from '@/lib/pms/constants'
import { computeTaskStatus } from '@/lib/pms/pdca-helpers'

const APPROVED_PROPOSAL_ID = '90000000-0000-0000-0000-000000000002'
const IN_EXECUTION_PROPOSAL_ID = '90000000-0000-0000-0000-000000000003'

function daysFromNow(d: number): string {
  const date = new Date()
  date.setDate(date.getDate() + d)
  return date.toISOString()
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()
}

const DEFAULT_TASKS: PdcaExecutionTask[] = [
  {
    Id: '91000000-0000-0000-0000-000000000001',
    ProposalId: IN_EXECUTION_PROPOSAL_ID,
    ProposalTitle: 'Consolidate inbound inspection stations',
    StepOrder: 1,
    Description: 'Map current IQC stations and document defect codes',
    OwnerId: MOCK_LEADER_USER_ID,
    OwnerName: 'Ahmad Rahman',
    PlannedDeadline: daysAgo(2),
    ProgressPct: 60,
    Status: 'overdue',
    ProgressNotes: [
      { At: daysAgo(5), Note: 'Site walk completed for both warehouses', ProgressPct: 30 },
      { At: daysAgo(1), Note: 'Defect taxonomy draft shared with QA', ProgressPct: 60 },
    ],
  },
  {
    Id: '91000000-0000-0000-0000-000000000002',
    ProposalId: IN_EXECUTION_PROPOSAL_ID,
    ProposalTitle: 'Consolidate inbound inspection stations',
    StepOrder: 2,
    Description: 'Configure shared digital station and barcode scanners',
    OwnerId: MOCK_ADMIN_USER_ID,
    OwnerName: 'System Administrator',
    PlannedDeadline: daysFromNow(7),
    ProgressPct: 25,
    Status: 'in_progress',
    ProgressNotes: [
      { At: daysAgo(2), Note: 'Hardware PO submitted', ProgressPct: 25 },
    ],
  },
  {
    Id: '91000000-0000-0000-0000-000000000003',
    ProposalId: IN_EXECUTION_PROPOSAL_ID,
    ProposalTitle: 'Consolidate inbound inspection stations',
    StepOrder: 3,
    Description: 'Train inspectors and run parallel pilot for two weeks',
    OwnerId: MOCK_EXECUTOR_USER_ID,
    OwnerName: 'Siti Nurhaliza',
    PlannedDeadline: daysFromNow(21),
    ProgressPct: 0,
    Status: 'not_started',
    ProgressNotes: [],
  },
]

let tasks: PdcaExecutionTask[] = [...DEFAULT_TASKS]
const tasksCreatedFor = new Set<string>([IN_EXECUTION_PROPOSAL_ID])

export const pdcaExecutionStore = {
  list(): PdcaExecutionTask[] {
    return [...tasks].sort((a, b) => a.StepOrder - b.StepOrder)
  },

  listByProposal(proposalId: string): PdcaExecutionTask[] {
    return this.list().filter((t) => t.ProposalId === proposalId)
  },

  listByOwner(ownerId: string): PdcaExecutionTask[] {
    return this.list().filter((t) => t.OwnerId === ownerId)
  },

  getById(id: string): PdcaExecutionTask | undefined {
    return tasks.find((t) => t.Id === id)
  },

  hasTasksForProposal(proposalId: string): boolean {
    return tasksCreatedFor.has(proposalId) || tasks.some((t) => t.ProposalId === proposalId)
  },

  replaceProposalTasks(
    proposalId: string,
    proposalTitle: string,
    rows: Omit<PdcaExecutionTask, 'Id' | 'ProposalId' | 'ProposalTitle' | 'ProgressPct' | 'Status' | 'ProgressNotes'>[],
  ): PdcaExecutionTask[] {
    tasks = tasks.filter((t) => t.ProposalId !== proposalId)
    const created = rows.map((row, index) => {
      const progressPct = 0
      const status = computeTaskStatus(progressPct, row.PlannedDeadline)
      return {
        Id: crypto.randomUUID(),
        ProposalId: proposalId,
        ProposalTitle: proposalTitle,
        StepOrder: index + 1,
        Description: row.Description,
        OwnerId: row.OwnerId,
        OwnerName: row.OwnerName,
        PlannedDeadline: row.PlannedDeadline,
        ProgressPct: progressPct,
        Status: status,
        ProgressNotes: [],
      } satisfies PdcaExecutionTask
    })
    tasks.push(...created)
    tasksCreatedFor.add(proposalId)
    return created
  },

  save(task: PdcaExecutionTask): PdcaExecutionTask {
    const idx = tasks.findIndex((t) => t.Id === task.Id)
    if (idx >= 0) tasks[idx] = task
    else tasks.push(task)
    return task
  },

  reset(): void {
    tasks = [...DEFAULT_TASKS]
    tasksCreatedFor.clear()
    tasksCreatedFor.add(IN_EXECUTION_PROPOSAL_ID)
  },
}

export const PDCA_SEED_APPROVED_PROPOSAL_ID = APPROVED_PROPOSAL_ID
export const PDCA_SEED_IN_EXECUTION_PROPOSAL_ID = IN_EXECUTION_PROPOSAL_ID
