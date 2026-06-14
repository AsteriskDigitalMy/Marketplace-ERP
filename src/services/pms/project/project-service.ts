import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type {
  Project,
  ProjectAcceptanceApplication,
  ProjectAcceptanceReview,
  ProjectIssue,
  TaskProgressUpdate,
} from '@/models/pms/project'
import {
  projectStore,
  type DurationChangeRequest,
  type GanttTaskRow,
  type IssueRecord,
  type ProjectKpiSyncState,
  type ProjectRecord,
  type SubTaskRecord,
} from '@/mocks/pms/project-store'
import { pmsStore } from '@/mocks/pms/store'
import { kpiStore } from '@/mocks/pms/kpi-store'

export type { DurationChangeRequest, GanttTaskRow, IssueRecord, ProjectKpiSyncState, ProjectRecord, SubTaskRecord }

export async function fetchProjects(filters?: {
  search?: string
  status?: Project['Status']
}): Promise<ProjectRecord[]> {
  await randomDelay()
  let list = projectStore.getProjects()
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (p) => p.Code.toLowerCase().includes(q) || p.Name.toLowerCase().includes(q),
    )
  }
  if (filters?.status) {
    list = list.filter((p) => p.Status === filters.status)
  }
  return list
}

export async function fetchProject(id: string): Promise<ProjectRecord> {
  await randomDelay()
  const project = projectStore.getProjectById(id)
  if (!project) throw new ApiError('Project not found', 404)
  return project
}

export async function checkProjectNameUnique(name: string, excludeId?: string): Promise<boolean> {
  await randomDelay(150, 350)
  return projectStore.isProjectNameUnique(name, excludeId)
}

export async function fetchProjectUsers(): Promise<{ Id: string; Name: string }[]> {
  await randomDelay(150, 300)
  return pmsStore
    .getAccounts()
    .filter((a) => a.Status === 'active')
    .map((a) => ({ Id: a.Id, Name: a.EmployeeName }))
}

export async function fetchBusinessTypes(): Promise<string[]> {
  await randomDelay(150, 300)
  const dict = pmsStore.getDictionaries().find((d) => d.Code === 'project_type')
  if (dict) {
    return dict.Items.filter((i) => i.IsEnabled).map((i) => i.DisplayName)
  }
  return ['KPI Initiative', 'Capacity Project']
}

export async function fetchEnabledKpis(): Promise<
  { Id: string; Code: string; Name: string; Category: string; TargetValue: number }[]
> {
  await randomDelay()
  return kpiStore
    .getIndicators()
    .filter((i) => i.Status === 'enabled')
    .map((i) => ({
      Id: i.Id,
      Code: i.Code,
      Name: i.Name,
      Category: i.Category,
      TargetValue: i.TargetValue,
    }))
}

export async function createProject(
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
): Promise<ProjectRecord> {
  await randomDelay()
  try {
    return projectStore.createProject(input, asDraft)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Create failed', 400)
  }
}

export async function updateProject(
  id: string,
  input: Partial<ProjectRecord>,
): Promise<ProjectRecord> {
  await randomDelay()
  try {
    return projectStore.updateProject(id, input)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Update failed', 400)
  }
}

export async function submitProject(id: string): Promise<ProjectRecord> {
  await randomDelay()
  try {
    return projectStore.submitProject(id)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Submit failed', 400)
  }
}

export async function fetchPendingApprovals(): Promise<ProjectRecord[]> {
  await randomDelay()
  return projectStore.getPendingApprovals()
}

export async function reviewProjectInitiation(
  projectId: string,
  decision: 'approve' | 'reject',
  opinion: string,
): Promise<ProjectRecord> {
  await randomDelay()
  try {
    return projectStore.reviewInitiation(projectId, decision, opinion)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Review failed', 400)
  }
}

export async function fetchProjectTasks(projectId: string): Promise<SubTaskRecord[]> {
  await randomDelay()
  return projectStore.getTasksByProject(projectId)
}

export async function fetchTask(taskId: string): Promise<SubTaskRecord> {
  await randomDelay()
  const task = projectStore.getTaskById(taskId)
  if (!task) throw new ApiError('Task not found', 404)
  return task
}

export async function fetchMyTasks(userId: string): Promise<SubTaskRecord[]> {
  await randomDelay()
  return projectStore.getMyTasks(userId)
}

export async function createSubTask(
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
): Promise<SubTaskRecord> {
  await randomDelay()
  try {
    return projectStore.createTask(input)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Create task failed', 400)
  }
}

export async function updateSubTask(
  taskId: string,
  input: Partial<SubTaskRecord>,
): Promise<SubTaskRecord> {
  await randomDelay()
  try {
    return projectStore.updateTask(taskId, input)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Update task failed', 400)
  }
}

export async function deleteSubTask(taskId: string): Promise<void> {
  await randomDelay()
  try {
    projectStore.deleteTask(taskId)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Delete task failed', 400)
  }
}

export async function submitTaskProgress(
  taskId: string,
  update: Omit<TaskProgressUpdate, 'TaskId' | 'UpdatedAt' | 'UpdatedBy' | 'IsOverdue'>,
  issue?: {
    Description: string
    ResourceType: ProjectIssue['ResourceType']
    FlagAtRisk: boolean
  },
): Promise<{ task: SubTaskRecord; issue?: IssueRecord }> {
  await randomDelay()
  try {
    return projectStore.submitProgressUpdate(taskId, update, issue)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Progress update failed', 400)
  }
}

export async function fetchProgressHistory(taskId: string): Promise<TaskProgressUpdate[]> {
  await randomDelay()
  return projectStore.getProgressHistory(taskId)
}

export async function batchUpdateProgress(
  taskIds: string[],
  progressPct: number,
  description: string,
): Promise<void> {
  await randomDelay()
  for (const taskId of taskIds) {
    const task = projectStore.getTaskById(taskId)
    if (!task) continue
    projectStore.submitProgressUpdate(taskId, {
      ProgressPct: progressPct,
      ActualDate: new Date().toISOString().slice(0, 10),
      Description: description,
      Issues: null,
      Attachments: progressPct === 100 ? ['batch-completion.pdf'] : [],
    })
  }
}

export async function validateProgressImport(
  projectId: string,
  rows: { TaskName: string; ProgressPct: number; ActualDate: string; Description: string }[],
) {
  await randomDelay(400, 800)
  return projectStore.validateImportRows(projectId, rows)
}

export async function fetchProjectIssues(projectId: string): Promise<IssueRecord[]> {
  await randomDelay()
  return projectStore.getIssuesByProject(projectId)
}

export async function assignProjectIssues(
  issueIds: string[],
  handlerId: string,
  deadline: string,
  measures: string | null,
): Promise<void> {
  await randomDelay()
  projectStore.assignIssues(issueIds, handlerId, deadline, measures)
}

export async function submitIssueDisposal(
  issueId: string,
  result: string,
  evidence: string[],
): Promise<void> {
  await randomDelay()
  projectStore.submitIssueDisposal(issueId, result, evidence)
}

export async function verifyProjectIssue(
  issueId: string,
  decision: 'close' | 'return',
  comment: string,
): Promise<void> {
  await randomDelay()
  projectStore.verifyIssue(issueId, decision, comment)
}

export async function createDurationChangeRequest(
  taskId: string,
  proposedStart: string,
  proposedEnd: string,
  reason: string,
  submittedBy: string,
): Promise<DurationChangeRequest> {
  await randomDelay()
  try {
    return projectStore.createDurationRequest(taskId, proposedStart, proposedEnd, reason, submittedBy)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Request failed', 400)
  }
}

export async function fetchDurationRequests(projectId: string): Promise<DurationChangeRequest[]> {
  await randomDelay()
  return projectStore.getDurationRequests(projectId)
}

export async function reviewDurationRequest(
  requestId: string,
  decision: 'approved' | 'rejected',
  opinion: string,
): Promise<DurationChangeRequest> {
  await randomDelay()
  try {
    return projectStore.reviewDurationRequest(requestId, decision, opinion)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Review failed', 400)
  }
}

export async function fetchProjectKpiSync(projectId: string): Promise<ProjectKpiSyncState> {
  await randomDelay()
  return projectStore.getKpiSync(projectId)
}

export async function fetchGanttTasks(projectId: string): Promise<GanttTaskRow[]> {
  await randomDelay()
  return projectStore.getGanttTasks(projectId)
}

export async function fetchPendingAcceptanceReviews(): Promise<ProjectRecord[]> {
  await randomDelay()
  return projectStore.getPendingAcceptanceReviews()
}

export async function submitAcceptanceApplication(
  projectId: string,
  application: Omit<
    ProjectAcceptanceApplication,
    'ProjectId' | 'Status' | 'SubmittedAt' | 'SubmittedBy' | 'AllTasksAccepted'
  >,
  submittedBy: string,
): Promise<ProjectRecord> {
  await randomDelay()
  try {
    return projectStore.submitAcceptanceApplication(
      projectId,
      { ...application, AllTasksAccepted: true },
      submittedBy,
    )
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Submit failed', 400)
  }
}

export async function reviewProjectAcceptance(
  projectId: string,
  review: Omit<ProjectAcceptanceReview, 'ProjectId' | 'ReviewedAt'>,
): Promise<ProjectRecord> {
  await randomDelay()
  try {
    return projectStore.reviewAcceptance(projectId, review)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Review failed', 400)
  }
}

export async function fetchProjectNavBadges() {
  await randomDelay(100, 200)
  return projectStore.getNavBadges()
}

export async function getLeaderName(leaderId: string): Promise<string> {
  await randomDelay(50, 100)
  const account = pmsStore.getAccounts().find((a) => a.Id === leaderId)
  return account?.EmployeeName ?? 'Unknown'
}
