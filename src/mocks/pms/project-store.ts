import type {
  Project,
  ProjectAcceptanceApplication,
  ProjectAcceptanceReview,
  ProjectIssue,
  ProjectSubTask,
  TaskProgressUpdate,
} from '@/models/pms/project'
import {
  MOCK_ADMIN_USER_ID,
  MOCK_EXECUTOR_USER_ID,
  MOCK_LEADER_USER_ID,
  MOCK_ORGANIZATION_ID,
} from '@/lib/pms/constants'
import { pmsStore } from '@/mocks/pms/store'
import { kpiStore } from '@/mocks/pms/kpi-store'

function nowIso(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function auditFields() {
  const ts = nowIso()
  return {
    OrganizationId: MOCK_ORGANIZATION_ID,
    CreatedBy: MOCK_ADMIN_USER_ID,
    CreatedDatetime: ts,
    ModifiedBy: MOCK_ADMIN_USER_ID,
    ModifiedDatetime: ts,
  }
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface ProjectRecord extends Project {
  GanttSketch: string | null
  RejectionOpinion: string | null
  ApprovalOpinion: string | null
  AcceptanceApplication: ProjectAcceptanceApplication | null
  AcceptanceReview: ProjectAcceptanceReview | null
}

export interface SubTaskRecord extends ProjectSubTask {
  IsAtRisk: boolean
  ActualStart: string | null
  ActualEnd: string | null
  LastProgressAt: string | null
}

export interface DurationChangeRequest {
  Id: string
  TaskId: string
  ProjectId: string
  TaskName: string
  ExecutorName: string
  OriginalStart: string
  OriginalEnd: string
  ProposedStart: string
  ProposedEnd: string
  Reason: string
  Status: 'pending' | 'approved' | 'rejected'
  SubmittedBy: string
  SubmittedAt: string
  ReviewOpinion: string | null
  ReviewedAt: string | null
}

export interface IssueDisposalLogEntry {
  At: string
  Action: string
  ActorId: string
  Note: string
}

export interface IssueRecord extends ProjectIssue {
  DisposalLog: IssueDisposalLogEntry[]
}

export interface KpiSyncMapping {
  KpiId: string
  KpiCode: string
  KpiName: string
  SyncedValue: number
  TargetValue: number
  SourceFlag: 'project_auto_sync'
  LastSyncedAt: string | null
  TaskIds: string[]
}

export interface KpiSyncLogEntry {
  Id: string
  At: string
  TaskId: string
  TaskName: string
  Event: string
  KpiId: string
  KpiName: string
  Value: number
  Status: 'success' | 'error'
  ErrorMessage: string | null
}

export interface ProjectKpiSyncState {
  ProjectId: string
  CompletionPct: number
  OnTimeRate: number
  DelayCount: number
  LastSyncedAt: string | null
  Mappings: KpiSyncMapping[]
  Log: KpiSyncLogEntry[]
}

export interface GanttTaskRow {
  TaskId: string
  Name: string
  OwnerId: string
  OwnerName: string
  PlannedStart: string
  PlannedEnd: string
  ActualStart: string | null
  ActualEnd: string | null
  ProgressPct: number
  IsOverdue: boolean
  PrerequisiteTaskIds: string[]
}

export interface ExecutorTodoBadge {
  UserId: string
  Count: number
}

const IN_PROGRESS_PROJECT_ID = '40000000-0000-0000-0000-000000000001'
const PENDING_APPROVAL_PROJECT_ID = '40000000-0000-0000-0000-000000000002'
const TASK_A_ID = '41000000-0000-0000-0000-000000000001'
const TASK_B_ID = '41000000-0000-0000-0000-000000000002'
const TASK_C_ID = '41000000-0000-0000-0000-000000000003'

const projects: ProjectRecord[] = [
  {
    Id: IN_PROGRESS_PROJECT_ID,
    Code: 'PRJ-2026-001',
    Name: 'Q2 Yield Improvement Program',
    BusinessType: 'KPI Initiative',
    PlannedStart: '2026-04-01',
    PlannedEnd: '2026-09-30',
    LeaderId: MOCK_LEADER_USER_ID,
    TeamMemberIds: [MOCK_LEADER_USER_ID, MOCK_EXECUTOR_USER_ID, MOCK_ADMIN_USER_ID],
    BudgetAmount: 250000,
    BoundKpiIds: [
      '30000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000002',
    ],
    ClientInfo: 'Internal operations excellence initiative',
    Status: 'in_progress',
    SubmittedAt: '2026-03-15T08:00:00.000Z',
    GanttSketch: 'Phase 1: Baseline audit (Apr)\nPhase 2: Process optimization (May–Jul)\nPhase 3: Validation (Aug–Sep)',
    RejectionOpinion: null,
    ApprovalOpinion: 'Approved — aligned with annual KPI targets',
    AcceptanceApplication: null,
    AcceptanceReview: null,
    ...auditFields(),
  },
  {
    Id: PENDING_APPROVAL_PROJECT_ID,
    Code: 'PRJ-2026-002',
    Name: 'OTD Excellence Program',
    BusinessType: 'KPI Initiative',
    PlannedStart: '2026-05-01',
    PlannedEnd: '2026-11-30',
    LeaderId: MOCK_LEADER_USER_ID,
    TeamMemberIds: [MOCK_LEADER_USER_ID, MOCK_EXECUTOR_USER_ID],
    BudgetAmount: 180000,
    BoundKpiIds: ['30000000-0000-0000-0000-000000000002'],
    ClientInfo: null,
    Status: 'pending_approval',
    SubmittedAt: nowIso(),
    GanttSketch: 'Milestone 1: Route mapping\nMilestone 2: Carrier SLA review',
    RejectionOpinion: null,
    ApprovalOpinion: null,
    AcceptanceApplication: null,
    AcceptanceReview: null,
    ...auditFields(),
  },
  {
    Id: '40000000-0000-0000-0000-000000000003',
    Code: '',
    Name: 'Scrap Reduction Pilot (Draft)',
    BusinessType: 'Capacity Project',
    PlannedStart: '2026-06-01',
    PlannedEnd: '2026-12-31',
    LeaderId: MOCK_LEADER_USER_ID,
    TeamMemberIds: [MOCK_LEADER_USER_ID],
    BudgetAmount: 95000,
    BoundKpiIds: ['30000000-0000-0000-0000-000000000003'],
    ClientInfo: null,
    Status: 'draft',
    SubmittedAt: null,
    GanttSketch: null,
    RejectionOpinion: null,
    ApprovalOpinion: null,
    AcceptanceApplication: null,
    AcceptanceReview: null,
    ...auditFields(),
  },
]

const subTasks: SubTaskRecord[] = [
  {
    Id: TASK_A_ID,
    ProjectId: IN_PROGRESS_PROJECT_ID,
    Name: 'Baseline yield audit',
    OwnerId: MOCK_EXECUTOR_USER_ID,
    OwnerName: 'Siti Nurhaliza',
    PlannedStart: '2026-04-01',
    PlannedEnd: '2026-04-30',
    Workload: 80,
    AcceptanceCriteria: 'Complete audit report with variance analysis across all lines',
    UpdateCycle: 'weekly',
    PrerequisiteTaskIds: [],
    Status: 'completed',
    ProgressPct: 100,
    IsAtRisk: false,
    ActualStart: '2026-04-01',
    ActualEnd: '2026-04-28',
    LastProgressAt: '2026-04-28T10:00:00.000Z',
    OrganizationId: MOCK_ORGANIZATION_ID,
  },
  {
    Id: TASK_B_ID,
    ProjectId: IN_PROGRESS_PROJECT_ID,
    Name: 'Cutting line optimization',
    OwnerId: MOCK_ADMIN_USER_ID,
    OwnerName: 'System Administrator',
    PlannedStart: '2026-05-01',
    PlannedEnd: '2026-07-31',
    Workload: 160,
    AcceptanceCriteria: 'Demonstrate ≥2% yield improvement vs baseline on pilot line',
    UpdateCycle: 'weekly',
    PrerequisiteTaskIds: [TASK_A_ID],
    Status: 'in_progress',
    ProgressPct: 65,
    IsAtRisk: true,
    ActualStart: '2026-05-03',
    ActualEnd: null,
    LastProgressAt: '2026-06-10T14:30:00.000Z',
    OrganizationId: MOCK_ORGANIZATION_ID,
  },
  {
    Id: TASK_C_ID,
    ProjectId: IN_PROGRESS_PROJECT_ID,
    Name: 'Validation and sign-off',
    OwnerId: MOCK_LEADER_USER_ID,
    OwnerName: 'Ahmad Rahman',
    PlannedStart: '2026-08-01',
    PlannedEnd: '2026-09-15',
    Workload: 40,
    AcceptanceCriteria: 'Signed validation report from plant manager',
    UpdateCycle: 'weekly',
    PrerequisiteTaskIds: [TASK_B_ID],
    Status: 'not_started',
    ProgressPct: 0,
    IsAtRisk: false,
    ActualStart: null,
    ActualEnd: null,
    LastProgressAt: null,
    OrganizationId: MOCK_ORGANIZATION_ID,
  },
]

const progressUpdates: TaskProgressUpdate[] = [
  {
    TaskId: TASK_A_ID,
    ProgressPct: 100,
    ActualDate: '2026-04-28',
    Description: 'Audit completed across all cutting lines with documented findings.',
    Issues: null,
    Attachments: ['audit-report-v1.pdf'],
    UpdatedBy: MOCK_EXECUTOR_USER_ID,
    UpdatedAt: '2026-04-28T10:00:00.000Z',
    IsOverdue: false,
  },
  {
    TaskId: TASK_B_ID,
    ProgressPct: 65,
    ActualDate: '2026-06-10',
    Description: 'Pilot line adjustments deployed; monitoring yield metrics.',
    Issues: 'Material variance on supplier batch B-442',
    Attachments: [],
    UpdatedBy: MOCK_ADMIN_USER_ID,
    UpdatedAt: '2026-06-10T14:30:00.000Z',
    IsOverdue: false,
  },
]

const issues: IssueRecord[] = [
  {
    Id: '42000000-0000-0000-0000-000000000001',
    ProjectId: IN_PROGRESS_PROJECT_ID,
    TaskId: TASK_B_ID,
    TaskName: 'Cutting line optimization',
    Description: 'Material variance on supplier batch B-442 causing yield drop on Line 3',
    ResourceType: 'material',
    Status: 'open',
    ReportedAt: '2026-06-10T14:30:00.000Z',
    ReportedBy: MOCK_ADMIN_USER_ID,
    HandlerId: null,
    Deadline: null,
    ResolutionMeasures: null,
    DisposalResult: null,
    DisposalLog: [
      {
        At: '2026-06-10T14:30:00.000Z',
        Action: 'reported',
        ActorId: MOCK_ADMIN_USER_ID,
        Note: 'Issue reported during progress update',
      },
    ],
  },
]

const durationRequests: DurationChangeRequest[] = []

const executorTodoBadges: ExecutorTodoBadge[] = [
  { UserId: MOCK_ADMIN_USER_ID, Count: 1 },
]

let codeSequence = 3

function getAccountName(id: string): string {
  return pmsStore.getAccounts().find((a) => a.Id === id)?.EmployeeName ?? id
}

function computeProjectMetrics(projectId: string) {
  const tasks = subTasks.filter((t) => t.ProjectId === projectId)
  if (tasks.length === 0) {
    return { completionPct: 0, onTimeRate: 0, delayCount: 0 }
  }
  const completionPct = Math.round(
    tasks.reduce((sum, t) => sum + t.ProgressPct, 0) / tasks.length,
  )
  const completed = tasks.filter((t) => t.Status === 'completed')
  const onTime =
    completed.length === 0
      ? 100
      : Math.round(
          (completed.filter((t) => t.ActualEnd && t.ActualEnd <= t.PlannedEnd).length /
            completed.length) *
            100,
        )
  const delayCount = tasks.filter((t) => t.Status === 'overdue' || t.IsAtRisk).length
  return { completionPct, onTimeRate: onTime, delayCount }
}

function buildKpiSyncState(projectId: string): ProjectKpiSyncState {
  const project = projects.find((p) => p.Id === projectId)
  const metrics = computeProjectMetrics(projectId)
  const tasks = subTasks.filter((t) => t.ProjectId === projectId)
  const mappings: KpiSyncMapping[] =
    project?.BoundKpiIds.map((kpiId) => {
      const kpi = kpiStore.getIndicatorById(kpiId)
      return {
        KpiId: kpiId,
        KpiCode: kpi?.Code ?? kpiId,
        KpiName: kpi?.Name ?? 'Unknown KPI',
        SyncedValue: metrics.completionPct,
        TargetValue: kpi?.TargetValue ?? 0,
        SourceFlag: 'project_auto_sync' as const,
        LastSyncedAt: progressUpdates.at(-1)?.UpdatedAt ?? null,
        TaskIds: tasks.map((t) => t.Id),
      }
    }) ?? []

  const log: KpiSyncLogEntry[] = progressUpdates
    .filter((u) => tasks.some((t) => t.Id === u.TaskId))
    .map((u) => {
      const task = tasks.find((t) => t.Id === u.TaskId)!
      const kpi = project?.BoundKpiIds[0]
        ? kpiStore.getIndicatorById(project.BoundKpiIds[0])
        : null
      return {
        Id: newId(),
        At: u.UpdatedAt,
        TaskId: u.TaskId,
        TaskName: task.Name,
        Event: 'progress_update',
        KpiId: project?.BoundKpiIds[0] ?? '',
        KpiName: kpi?.Name ?? 'Project KPI',
        Value: u.ProgressPct,
        Status: 'success' as const,
        ErrorMessage: null,
      }
    })

  return {
    ProjectId: projectId,
    CompletionPct: metrics.completionPct,
    OnTimeRate: metrics.onTimeRate,
    DelayCount: metrics.delayCount,
    LastSyncedAt: log.at(-1)?.At ?? null,
    Mappings: mappings,
    Log: log,
  }
}

function hasCycle(
  taskId: string,
  prerequisiteIds: string[],
  projectId: string,
): boolean {
  const graph = new Map<string, string[]>()
  subTasks
    .filter((t) => t.ProjectId === projectId)
    .forEach((t) => {
      graph.set(t.Id, t.Id === taskId ? prerequisiteIds : t.PrerequisiteTaskIds)
    })

  const visited = new Set<string>()
  const stack = [...prerequisiteIds]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === taskId) return true
    if (visited.has(current)) continue
    visited.add(current)
    const deps = graph.get(current) ?? []
    stack.push(...deps)
  }
  return false
}

function generateProjectCode(): string {
  codeSequence += 1
  return `PRJ-2026-${String(codeSequence).padStart(3, '0')}`
}

function isTaskOverdue(task: SubTaskRecord): boolean {
  if (task.Status === 'completed') return false
  if (task.UpdateCycle === 'daily') {
    const last = task.LastProgressAt ? new Date(task.LastProgressAt) : null
    if (!last) return new Date(task.PlannedStart) < new Date()
    const days = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
    return days > 1
  }
  const last = task.LastProgressAt ? new Date(task.LastProgressAt) : null
  if (!last) return new Date(task.PlannedStart) < new Date()
  const days = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
  return days > 7
}

function refreshOverdueFlags() {
  subTasks.forEach((task, i) => {
    if (task.Status === 'in_progress' && isTaskOverdue(task)) {
      subTasks[i] = { ...task, Status: 'overdue' }
    }
  })
}

export const projectStore = {
  getProjects(): ProjectRecord[] {
    return projects.map((p) => ({ ...p }))
  },

  getProjectById(id: string): ProjectRecord | undefined {
    return projects.find((p) => p.Id === id)
  },

  isProjectNameUnique(name: string, excludeId?: string): boolean {
    const active = projects.filter(
      (p) => p.Status !== 'archived' && p.Id !== excludeId,
    )
    return !active.some((p) => p.Name.toLowerCase() === name.trim().toLowerCase())
  },

  createProject(
    input: Omit<
      ProjectRecord,
      | 'Id'
      | 'Code'
      | 'Status'
      | 'SubmittedAt'
      | 'RejectionOpinion'
      | 'ApprovalOpinion'
      | 'AcceptanceApplication'
      | 'AcceptanceReview'
      | 'OrganizationId'
      | 'CreatedBy'
      | 'CreatedDatetime'
      | 'ModifiedBy'
      | 'ModifiedDatetime'
    >,
    asDraft: boolean,
  ): ProjectRecord {
    if (!projectStore.isProjectNameUnique(input.Name)) {
      throw new Error('Project name already exists among active projects')
    }
    const project: ProjectRecord = {
      Id: newId(),
      Code: asDraft ? '' : generateProjectCode(),
      ...input,
      Status: asDraft ? 'draft' : 'pending_approval',
      SubmittedAt: asDraft ? null : nowIso(),
      RejectionOpinion: null,
      ApprovalOpinion: null,
      AcceptanceApplication: null,
      AcceptanceReview: null,
      ...auditFields(),
    }
    projects.push(project)
    return { ...project }
  },

  updateProject(id: string, input: Partial<ProjectRecord>): ProjectRecord {
    const index = projects.findIndex((p) => p.Id === id)
    if (index === -1) throw new Error('Project not found')
    if (input.Name && !projectStore.isProjectNameUnique(input.Name, id)) {
      throw new Error('Project name already exists among active projects')
    }
    projects[index] = {
      ...projects[index],
      ...input,
      Id: id,
      ModifiedBy: MOCK_ADMIN_USER_ID,
      ModifiedDatetime: nowIso(),
    }
    return { ...projects[index] }
  },

  submitProject(id: string): ProjectRecord {
    const index = projects.findIndex((p) => p.Id === id)
    if (index === -1) throw new Error('Project not found')
    const current = projects[index]
    if (!current.Code) {
      projects[index] = {
        ...current,
        Code: generateProjectCode(),
        Status: 'pending_approval',
        SubmittedAt: nowIso(),
        ModifiedDatetime: nowIso(),
      }
    } else {
      projects[index] = {
        ...current,
        Status: 'pending_approval',
        SubmittedAt: nowIso(),
        RejectionOpinion: null,
        ModifiedDatetime: nowIso(),
      }
    }
    return { ...projects[index] }
  },

  reviewInitiation(
    projectId: string,
    decision: 'approve' | 'reject',
    opinion: string,
  ): ProjectRecord {
    const index = projects.findIndex((p) => p.Id === projectId)
    if (index === -1) throw new Error('Project not found')
    const current = projects[index]
    if (current.Status !== 'pending_approval') {
      throw new Error('Project already reviewed')
    }
    if (decision === 'reject' && !opinion.trim()) {
      throw new Error('Rejection opinion is required')
    }
    projects[index] = {
      ...current,
      Status: decision === 'approve' ? 'in_progress' : 'returned',
      ApprovalOpinion: decision === 'approve' ? opinion : null,
      RejectionOpinion: decision === 'reject' ? opinion : null,
      ModifiedDatetime: nowIso(),
    }
    return { ...projects[index] }
  },

  getPendingApprovals(): ProjectRecord[] {
    return projects.filter((p) => p.Status === 'pending_approval')
  },

  getPendingAcceptanceReviews(): ProjectRecord[] {
    return projects.filter((p) => p.Status === 'pending_acceptance')
  },

  getTasksByProject(projectId: string): SubTaskRecord[] {
    refreshOverdueFlags()
    return subTasks.filter((t) => t.ProjectId === projectId).map((t) => ({ ...t }))
  },

  getTaskById(taskId: string): SubTaskRecord | undefined {
    return subTasks.find((t) => t.Id === taskId)
  },

  getMyTasks(userId: string): SubTaskRecord[] {
    refreshOverdueFlags()
    return subTasks
      .filter(
        (t) =>
          t.OwnerId === userId &&
          (t.Status === 'in_progress' || t.Status === 'overdue'),
      )
      .map((t) => ({ ...t }))
  },

  createTask(
    input: Omit<
      SubTaskRecord,
      | 'Id'
      | 'Status'
      | 'ProgressPct'
      | 'IsAtRisk'
      | 'ActualStart'
      | 'ActualEnd'
      | 'LastProgressAt'
      | 'OrganizationId'
      | 'OwnerName'
    >,
  ): SubTaskRecord {
    const project = projects.find((p) => p.Id === input.ProjectId)
    if (!project) throw new Error('Project not found')
    if (project.Status !== 'in_progress') {
      throw new Error('Tasks can only be created for in-progress projects')
    }
    if (input.PlannedEnd > project.PlannedEnd || input.PlannedStart < project.PlannedStart) {
      throw new Error('Task dates must fall within project planned span')
    }
    if (hasCycle('', input.PrerequisiteTaskIds, input.ProjectId)) {
      throw new Error('Circular dependency detected')
    }
    const task: SubTaskRecord = {
      Id: newId(),
      ...input,
      OwnerName: getAccountName(input.OwnerId),
      Status: 'not_started',
      ProgressPct: 0,
      IsAtRisk: false,
      ActualStart: null,
      ActualEnd: null,
      LastProgressAt: null,
      OrganizationId: MOCK_ORGANIZATION_ID,
    }
    subTasks.push(task)
    const badge = executorTodoBadges.find((b) => b.UserId === input.OwnerId)
    if (badge) badge.Count += 1
    else executorTodoBadges.push({ UserId: input.OwnerId, Count: 1 })
    return { ...task }
  },

  updateTask(taskId: string, input: Partial<SubTaskRecord>): SubTaskRecord {
    const index = subTasks.findIndex((t) => t.Id === taskId)
    if (index === -1) throw new Error('Task not found')
    const current = subTasks[index]
    if (input.PrerequisiteTaskIds && hasCycle(taskId, input.PrerequisiteTaskIds, current.ProjectId)) {
      throw new Error('Circular dependency detected')
    }
    const project = projects.find((p) => p.Id === current.ProjectId)
    const plannedStart = input.PlannedStart ?? current.PlannedStart
    const plannedEnd = input.PlannedEnd ?? current.PlannedEnd
    if (project && (plannedEnd > project.PlannedEnd || plannedStart < project.PlannedStart)) {
      throw new Error('Task dates must fall within project planned span')
    }
    subTasks[index] = {
      ...current,
      ...input,
      Id: taskId,
      OwnerName: input.OwnerId ? getAccountName(input.OwnerId) : current.OwnerName,
    }
    return { ...subTasks[index] }
  },

  deleteTask(taskId: string): void {
    const index = subTasks.findIndex((t) => t.Id === taskId)
    if (index === -1) throw new Error('Task not found')
    const task = subTasks[index]
    if (task.Status !== 'not_started') {
      throw new Error('Only not-started tasks can be deleted')
    }
    const dependents = subTasks.filter((t) => t.PrerequisiteTaskIds.includes(taskId))
    if (dependents.length > 0) {
      throw new Error(`Cannot delete — required by: ${dependents.map((d) => d.Name).join(', ')}`)
    }
    subTasks.splice(index, 1)
  },

  getDependents(taskId: string): SubTaskRecord[] {
    return subTasks.filter((t) => t.PrerequisiteTaskIds.includes(taskId))
  },

  submitProgressUpdate(
    taskId: string,
    update: Omit<TaskProgressUpdate, 'TaskId' | 'UpdatedAt' | 'UpdatedBy' | 'IsOverdue'>,
    issue?: {
      Description: string
      ResourceType: ProjectIssue['ResourceType']
      FlagAtRisk: boolean
    },
  ): { task: SubTaskRecord; issue?: IssueRecord } {
    const index = subTasks.findIndex((t) => t.Id === taskId)
    if (index === -1) throw new Error('Task not found')
    const task = subTasks[index]
    if (task.Status !== 'in_progress' && task.Status !== 'overdue') {
      throw new Error('Task is not in progress')
    }
    if (update.ActualDate < task.PlannedStart) {
      throw new Error('Actual date cannot be before planned start')
    }
    if (update.ProgressPct === 100 && update.Attachments.length === 0) {
      throw new Error('Attachments required when progress is 100%')
    }

    const record: TaskProgressUpdate = {
      ...update,
      TaskId: taskId,
      UpdatedBy: task.OwnerId,
      UpdatedAt: nowIso(),
      IsOverdue: false,
    }
    progressUpdates.push(record)

    const nextStatus =
      update.ProgressPct === 100
        ? 'completed'
        : update.ProgressPct > 0
          ? 'in_progress'
          : task.Status

    subTasks[index] = {
      ...task,
      ProgressPct: update.ProgressPct,
      Status: nextStatus,
      IsAtRisk: issue?.FlagAtRisk ?? task.IsAtRisk,
      LastProgressAt: nowIso(),
      ActualStart: task.ActualStart ?? update.ActualDate,
      ActualEnd: update.ProgressPct === 100 ? update.ActualDate : null,
    }

    let createdIssue: IssueRecord | undefined
    if (issue?.Description) {
      createdIssue = {
        Id: newId(),
        ProjectId: task.ProjectId,
        TaskId: taskId,
        TaskName: task.Name,
        Description: issue.Description,
        ResourceType: issue.ResourceType,
        Status: 'open',
        ReportedAt: nowIso(),
        ReportedBy: task.OwnerId,
        HandlerId: null,
        Deadline: null,
        ResolutionMeasures: null,
        DisposalResult: null,
        DisposalLog: [
          {
            At: nowIso(),
            Action: 'reported',
            ActorId: task.OwnerId,
            Note: issue.Description,
          },
        ],
      }
      issues.push(createdIssue)
      if (issue.FlagAtRisk) {
        subTasks[index].IsAtRisk = true
      }
    }

    return { task: { ...subTasks[index] }, issue: createdIssue }
  },

  getProgressHistory(taskId: string): TaskProgressUpdate[] {
    return progressUpdates.filter((u) => u.TaskId === taskId)
  },

  getIssuesByProject(projectId: string): IssueRecord[] {
    return issues.filter((i) => i.ProjectId === projectId).map((i) => ({ ...i }))
  },

  assignIssues(
    issueIds: string[],
    handlerId: string,
    deadline: string,
    measures: string | null,
  ): void {
    issueIds.forEach((issueId) => {
      const index = issues.findIndex((i) => i.Id === issueId)
      if (index === -1) return
      issues[index] = {
        ...issues[index],
        Status: 'assigned',
        HandlerId: handlerId,
        Deadline: deadline,
        ResolutionMeasures: measures,
        DisposalLog: [
          ...issues[index].DisposalLog,
          {
            At: nowIso(),
            Action: 'assigned',
            ActorId: MOCK_LEADER_USER_ID,
            Note: measures ?? 'Assigned for resolution',
          },
        ],
      }
    })
  },

  submitIssueDisposal(issueId: string, result: string, evidence: string[]): void {
    const index = issues.findIndex((i) => i.Id === issueId)
    if (index === -1) throw new Error('Issue not found')
    issues[index] = {
      ...issues[index],
      Status: 'resolved',
      DisposalResult: result,
      DisposalLog: [
        ...issues[index].DisposalLog,
        {
          At: nowIso(),
          Action: 'resolved',
          ActorId: issues[index].HandlerId ?? MOCK_EXECUTOR_USER_ID,
          Note: result,
        },
      ],
    }
    if (evidence.length > 0) {
      issues[index].DisposalLog.push({
        At: nowIso(),
        Action: 'evidence_uploaded',
        ActorId: issues[index].HandlerId ?? MOCK_EXECUTOR_USER_ID,
        Note: evidence.join(', '),
      })
    }
  },

  verifyIssue(issueId: string, decision: 'close' | 'return', comment: string): void {
    const index = issues.findIndex((i) => i.Id === issueId)
    if (index === -1) throw new Error('Issue not found')
    if (decision === 'close') {
      issues[index] = {
        ...issues[index],
        Status: 'closed',
        DisposalLog: [
          ...issues[index].DisposalLog,
          { At: nowIso(), Action: 'closed', ActorId: MOCK_LEADER_USER_ID, Note: comment },
        ],
      }
      const taskIndex = subTasks.findIndex((t) => t.Id === issues[index].TaskId)
      if (taskIndex >= 0) {
        const openForTask = issues.filter(
          (i) => i.TaskId === issues[index].TaskId && i.Status !== 'closed',
        )
        if (openForTask.length === 0) {
          subTasks[taskIndex] = { ...subTasks[taskIndex], IsAtRisk: false }
        }
      }
    } else {
      issues[index] = {
        ...issues[index],
        Status: 'assigned',
        DisposalLog: [
          ...issues[index].DisposalLog,
          { At: nowIso(), Action: 'returned', ActorId: MOCK_LEADER_USER_ID, Note: comment },
        ],
      }
    }
  },

  createDurationRequest(
    taskId: string,
    proposedStart: string,
    proposedEnd: string,
    reason: string,
    submittedBy: string,
  ): DurationChangeRequest {
    const task = subTasks.find((t) => t.Id === taskId)
    if (!task) throw new Error('Task not found')
    if (task.Status === 'completed') throw new Error('Cannot request change for completed task')
    if (durationRequests.some((r) => r.TaskId === taskId && r.Status === 'pending')) {
      throw new Error('A pending duration request already exists for this task')
    }
    if (proposedEnd < proposedStart) throw new Error('Proposed end must be on or after start')
    if (proposedStart < todayDate() || proposedEnd < todayDate()) {
      throw new Error('Proposed dates cannot be before today')
    }
    const request: DurationChangeRequest = {
      Id: newId(),
      TaskId: taskId,
      ProjectId: task.ProjectId,
      TaskName: task.Name,
      ExecutorName: task.OwnerName,
      OriginalStart: task.PlannedStart,
      OriginalEnd: task.PlannedEnd,
      ProposedStart: proposedStart,
      ProposedEnd: proposedEnd,
      Reason: reason,
      Status: 'pending',
      SubmittedBy: submittedBy,
      SubmittedAt: nowIso(),
      ReviewOpinion: null,
      ReviewedAt: null,
    }
    durationRequests.push(request)
    return { ...request }
  },

  getDurationRequests(projectId: string): DurationChangeRequest[] {
    return durationRequests.filter((r) => r.ProjectId === projectId)
  },

  getPendingDurationRequests(projectId: string): DurationChangeRequest[] {
    return durationRequests.filter(
      (r) => r.ProjectId === projectId && r.Status === 'pending',
    )
  },

  reviewDurationRequest(
    requestId: string,
    decision: 'approved' | 'rejected',
    opinion: string,
  ): DurationChangeRequest {
    const index = durationRequests.findIndex((r) => r.Id === requestId)
    if (index === -1) throw new Error('Request not found')
    if (durationRequests[index].Status !== 'pending') {
      throw new Error('Request already reviewed')
    }
    durationRequests[index] = {
      ...durationRequests[index],
      Status: decision,
      ReviewOpinion: opinion,
      ReviewedAt: nowIso(),
    }
    if (decision === 'approved') {
      const req = durationRequests[index]
      const taskIndex = subTasks.findIndex((t) => t.Id === req.TaskId)
      if (taskIndex >= 0) {
        subTasks[taskIndex] = {
          ...subTasks[taskIndex],
          PlannedStart: req.ProposedStart,
          PlannedEnd: req.ProposedEnd,
        }
      }
    }
    return { ...durationRequests[index] }
  },

  getKpiSync(projectId: string): ProjectKpiSyncState {
    return buildKpiSyncState(projectId)
  },

  getGanttTasks(projectId: string): GanttTaskRow[] {
    refreshOverdueFlags()
    return subTasks
      .filter((t) => t.ProjectId === projectId)
      .map((t) => ({
        TaskId: t.Id,
        Name: t.Name,
        OwnerId: t.OwnerId,
        OwnerName: t.OwnerName,
        PlannedStart: t.PlannedStart,
        PlannedEnd: t.PlannedEnd,
        ActualStart: t.ActualStart,
        ActualEnd: t.ActualEnd,
        ProgressPct: t.ProgressPct,
        IsOverdue: t.Status === 'overdue' || t.IsAtRisk,
        PrerequisiteTaskIds: t.PrerequisiteTaskIds,
      }))
  },

  submitAcceptanceApplication(
    projectId: string,
    application: Omit<ProjectAcceptanceApplication, 'ProjectId' | 'Status' | 'SubmittedAt' | 'SubmittedBy'>,
    submittedBy: string,
  ): ProjectRecord {
    const index = projects.findIndex((p) => p.Id === projectId)
    if (index === -1) throw new Error('Project not found')
    const tasks = subTasks.filter((t) => t.ProjectId === projectId)
    const allAccepted = tasks.length > 0 && tasks.every((t) => t.Status === 'completed')
    if (!allAccepted) throw new Error('All sub-tasks must be completed before acceptance')
    projects[index] = {
      ...projects[index],
      Status: 'pending_acceptance',
      AcceptanceApplication: {
        ProjectId: projectId,
        ...application,
        AllTasksAccepted: true,
        Status: 'pending_acceptance',
        SubmittedAt: nowIso(),
        SubmittedBy: submittedBy,
      },
      ModifiedDatetime: nowIso(),
    }
    return { ...projects[index] }
  },

  reviewAcceptance(
    projectId: string,
    review: Omit<ProjectAcceptanceReview, 'ProjectId' | 'ReviewedAt'>,
  ): ProjectRecord {
    const index = projects.findIndex((p) => p.Id === projectId)
    if (index === -1) throw new Error('Project not found')
    if (projects[index].Status !== 'pending_acceptance') {
      throw new Error('Project is not pending acceptance')
    }
    if (review.Decision === 'fail' && !review.RectificationRequirements?.trim()) {
      throw new Error('Rectification requirements required on fail')
    }
    projects[index] = {
      ...projects[index],
      Status: review.Decision === 'pass' ? 'archived' : 'in_progress',
      AcceptanceReview: {
        ProjectId: projectId,
        ...review,
        ReviewedAt: nowIso(),
      },
      ModifiedDatetime: nowIso(),
    }
    return { ...projects[index] }
  },

  getExecutorTodoCount(userId: string): number {
    return executorTodoBadges.find((b) => b.UserId === userId)?.Count ?? 0
  },

  getNavBadges() {
    return {
      pendingApprovals: projects.filter((p) => p.Status === 'pending_approval').length,
      pendingAcceptance: projects.filter((p) => p.Status === 'pending_acceptance').length,
      myTasks: projectStore.getMyTasks(MOCK_ADMIN_USER_ID).length,
    }
  },

  validateImportRows(
    projectId: string,
    rows: { TaskName: string; ProgressPct: number; ActualDate: string; Description: string }[],
  ) {
    const tasks = subTasks.filter((t) => t.ProjectId === projectId)
    return rows.map((row, i) => {
      const task = tasks.find(
        (t) => t.Name.toLowerCase() === row.TaskName.trim().toLowerCase(),
      )
      const errors: string[] = []
      if (!task) errors.push('Task not found')
      else if (task.Status !== 'in_progress' && task.Status !== 'overdue') {
        errors.push('Task is not in progress')
      }
      if (!Number.isInteger(row.ProgressPct) || row.ProgressPct < 0 || row.ProgressPct > 100) {
        errors.push('Progress must be an integer 0–100')
      }
      if (!row.Description.trim()) errors.push('Description required')
      return { Row: i + 1, TaskName: row.TaskName, Status: errors.length ? 'failed' as const : 'success' as const, Errors: errors }
    })
  },
}
