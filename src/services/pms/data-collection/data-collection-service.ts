import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { DataFillingForm, DataReview } from '@/models/pms/data-collection'
import {
  dataCollectionStore,
  type DataReviewRecord,
  type FillingFormRecord,
  type FillingRule,
  type FillingTaskRecord,
  type FormTemplate,
  type OverdueAlertRecord,
} from '@/mocks/pms/data-collection-store'

export type {
  DataReviewRecord,
  FillingFormRecord,
  FillingRule,
  FillingTaskRecord,
  FormTemplate,
  OverdueAlertRecord,
}

export async function fetchFillingRules(): Promise<FillingRule[]> {
  await randomDelay()
  return dataCollectionStore.getRules()
}

export async function saveFillingRule(
  input: Parameters<typeof dataCollectionStore.saveRule>[0],
): Promise<FillingRule> {
  await randomDelay()
  try {
    return dataCollectionStore.saveRule(input)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Save failed', 400)
  }
}

export async function deleteFillingRule(id: string): Promise<void> {
  await randomDelay()
  try {
    dataCollectionStore.deleteRule(id)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Delete failed', 400)
  }
}

export async function setFillingRuleActive(id: string, active: boolean): Promise<FillingRule> {
  await randomDelay()
  try {
    return dataCollectionStore.setRuleActive(id, active)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Update failed', 400)
  }
}

export async function fetchFormTemplates(): Promise<FormTemplate[]> {
  await randomDelay(150, 300)
  return dataCollectionStore.getTemplates()
}

export async function fetchManualFillIndicators(): Promise<
  { Id: string; Code: string; Name: string }[]
> {
  await randomDelay(150, 300)
  return dataCollectionStore.getManualFillIndicators()
}

export async function fetchPositionOptions(): Promise<{ Id: string; Name: string }[]> {
  await randomDelay(150, 300)
  return dataCollectionStore.getPositionOptions()
}

export async function fetchAllFillingTasks(): Promise<FillingTaskRecord[]> {
  await randomDelay()
  return dataCollectionStore.getAllTasks()
}

export async function fetchMyFillingTasks(userId: string): Promise<FillingTaskRecord[]> {
  await randomDelay()
  return dataCollectionStore.getTasksByAssignee(userId)
}

export async function fetchDueFillingTasks(userId: string): Promise<FillingTaskRecord[]> {
  await randomDelay(200, 400)
  return dataCollectionStore.getDueTasksForUser(userId)
}

export async function fetchFillingTaskSummary() {
  await randomDelay(150, 300)
  return dataCollectionStore.getTaskSummary()
}

export async function fetchFillingForm(taskId: string): Promise<FillingFormRecord> {
  await randomDelay()
  try {
    return dataCollectionStore.getFormByTaskId(taskId)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Form not found', 404)
  }
}

export async function saveFillingDraft(
  taskId: string,
  fields: DataFillingForm['Fields'],
): Promise<FillingFormRecord> {
  await randomDelay()
  try {
    return dataCollectionStore.saveFormDraft(taskId, fields)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Save failed', 400)
  }
}

export async function submitFillingForm(
  taskId: string,
  fields: DataFillingForm['Fields'],
): Promise<FillingFormRecord> {
  await randomDelay()
  try {
    return dataCollectionStore.submitForm(taskId, fields)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Submit failed', 400)
  }
}

export async function fetchDataReviews(filters?: {
  level?: DataReview['ReviewLevel']
  status?: DataReview['Status']
  search?: string
}): Promise<DataReviewRecord[]> {
  await randomDelay()
  return dataCollectionStore.getReviews(filters)
}

export async function fetchDataReview(recordId: string): Promise<DataReviewRecord> {
  await randomDelay()
  const record = dataCollectionStore.getReviewById(recordId)
  if (!record) throw new ApiError('Review record not found', 404)
  return record
}

export async function submitDataReviewDecision(
  recordId: string,
  decision: 'pass' | 'reject',
  opinion: string,
  reviewerName: string,
): Promise<DataReviewRecord> {
  await randomDelay()
  try {
    return dataCollectionStore.submitReviewDecision(recordId, decision, opinion, reviewerName)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Decision failed', 400)
  }
}

export async function sendReviewMessage(
  recordId: string,
  author: string,
  text: string,
): Promise<DataReviewRecord> {
  await randomDelay(200, 400)
  try {
    return dataCollectionStore.addReviewMessage(recordId, author, text)
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Send failed', 400)
  }
}

export async function fetchKpiThresholds(indicatorId: string) {
  await randomDelay(100, 200)
  return dataCollectionStore.getKpiThresholds(indicatorId)
}

export async function fetchDataCollectionNavBadges(userId: string) {
  await randomDelay(100, 200)
  return dataCollectionStore.getNavBadges(userId)
}

export async function fetchOverdueAlerts(): Promise<OverdueAlertRecord[]> {
  await randomDelay(150, 300)
  return dataCollectionStore.getOverdueAlerts()
}

export function getDueCountdownLabel(dueAt: string): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  const due = new Date(dueAt)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: 'Overdue', variant: 'destructive' }
  if (diffDays === 0) return { label: 'Due today', variant: 'destructive' }
  if (diffDays === 1) return { label: '1 day left', variant: 'secondary' }
  return { label: `${diffDays} days left`, variant: 'secondary' }
}
