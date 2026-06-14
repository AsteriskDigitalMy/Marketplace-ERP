import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import { MOCK_ADMIN_USER_ID } from '@/lib/pms/constants'
import type { AlertLevel } from '@/models/common/enums'
import type { AlertRecord } from '@/models/pms/operations'
import { alertRecordsStore } from '@/mocks/pms/alert-records-store'

export interface AlertRecordFilters {
  status?: AlertRecord['Status'] | 'all'
  level?: AlertLevel | 'all'
  type?: AlertRecord['Type'] | 'all'
  overdueOnly?: boolean
  search?: string
}

function effectiveLevel(record: AlertRecord): AlertLevel {
  return record.EffectiveLevel ?? record.Level
}

function refreshOverdue(record: AlertRecord): AlertRecord {
  const overdue = record.Status !== 'closed' && new Date(record.DeadlineAt) < new Date()
  let next = { ...record, IsOverdue: overdue }
  if (
    overdue &&
    next.EscalationHistory.length === 0 &&
    effectiveLevel(next) !== 'urgent'
  ) {
    next = {
      ...next,
      EffectiveLevel: 'urgent',
      EscalationHistory: [
        ...next.EscalationHistory,
        {
          At: new Date().toISOString(),
          FromLevel: next.Level,
          ToLevel: 'urgent',
          Reason: 'Deadline missed without disposal',
        },
      ],
    }
    alertRecordsStore.appendLog(
      next,
      'Auto-escalated',
      'Escalated to Urgent due to missed deadline',
      'System',
    )
  }
  return next
}

export async function fetchAlertRecords(filters?: AlertRecordFilters): Promise<AlertRecord[]> {
  await randomDelay()
  let list = alertRecordsStore.list().map(refreshOverdue)
  for (const r of list) alertRecordsStore.save(r)

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((r) => r.Status === filters.status)
  }
  if (filters?.level && filters.level !== 'all') {
    list = list.filter((r) => effectiveLevel(r) === filters.level)
  }
  if (filters?.type && filters.type !== 'all') {
    list = list.filter((r) => r.Type === filters.type)
  }
  if (filters?.overdueOnly) {
    list = list.filter((r) => r.IsOverdue && r.Status !== 'closed')
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter(
      (r) =>
        r.Id.toLowerCase().includes(q) ||
        r.MonitoredObjectLabel.toLowerCase().includes(q) ||
        r.RuleName.toLowerCase().includes(q),
    )
  }

  return list.sort((a, b) => {
    if (a.Status === 'closed' && b.Status !== 'closed') return 1
    if (b.Status === 'closed' && a.Status !== 'closed') return -1
    return new Date(a.DeadlineAt).getTime() - new Date(b.DeadlineAt).getTime()
  })
}

export async function fetchAlertRecord(id: string): Promise<AlertRecord> {
  await randomDelay()
  const record = alertRecordsStore.getById(id)
  if (!record) throw new ApiError('Alert record not found', 404)
  const refreshed = refreshOverdue(record)
  alertRecordsStore.save(refreshed)
  return refreshed
}

export async function saveRootCauseDraft(
  id: string,
  cause: string,
  impactScope: string,
): Promise<AlertRecord> {
  await randomDelay()
  const record = alertRecordsStore.getById(id)
  if (!record) throw new ApiError('Alert record not found', 404)
  if (record.Status === 'closed') throw new ApiError('Alert is closed', 400)
  const next: AlertRecord = {
    ...record,
    Cause: cause || null,
    ImpactScope: impactScope || null,
    Status: record.Status === 'open' ? 'investigating' : record.Status,
  }
  alertRecordsStore.appendLog(next, 'Draft saved', 'Root cause draft updated')
  return alertRecordsStore.save(next)
}

export async function submitRootCause(
  id: string,
  cause: string,
  impactScope: string,
): Promise<AlertRecord> {
  await randomDelay()
  if (!cause.trim()) throw new ApiError('Problem cause is required', 400)
  const record = alertRecordsStore.getById(id)
  if (!record) throw new ApiError('Alert record not found', 404)
  const next: AlertRecord = {
    ...record,
    Cause: cause.trim(),
    ImpactScope: impactScope.trim() || null,
    Status: 'rectifying',
  }
  alertRecordsStore.appendLog(next, 'Root cause submitted', 'Advanced to rectification')
  return alertRecordsStore.save(next)
}

export async function submitRectification(
  id: string,
  measures: string,
  plannedDate: string,
  attachments: string[],
): Promise<AlertRecord> {
  await randomDelay()
  if (!measures.trim()) throw new ApiError('Rectification measures are required', 400)
  if (!plannedDate) throw new ApiError('Planned completion date is required', 400)
  const record = alertRecordsStore.getById(id)
  if (!record) throw new ApiError('Alert record not found', 404)
  const next: AlertRecord = {
    ...record,
    RectificationMeasures: measures.trim(),
    PlannedCompletionDate: new Date(plannedDate).toISOString(),
    Attachments: attachments,
    Status: 'pending_verification',
  }
  alertRecordsStore.appendLog(next, 'Submitted for verification', 'Manager notified (mock)')
  return alertRecordsStore.save(next)
}

export async function submitVerification(
  id: string,
  pass: boolean,
  opinion: string,
): Promise<AlertRecord> {
  await randomDelay()
  if (!pass && !opinion.trim()) {
    throw new ApiError('Verification opinion is required when failing', 400)
  }
  const record = alertRecordsStore.getById(id)
  if (!record) throw new ApiError('Alert record not found', 404)
  if (record.Status !== 'pending_verification') {
    throw new ApiError('Alert is not pending verification', 400)
  }

  if (pass) {
    const next: AlertRecord = {
      ...record,
      Status: 'closed',
      VerificationOpinion: opinion.trim() || 'Approved',
      IsOverdue: false,
    }
    alertRecordsStore.appendLog(next, 'Verification passed', 'Alert closed')
    return alertRecordsStore.save(next)
  }

  const next: AlertRecord = {
    ...record,
    Status: 'rectifying',
    VerificationOpinion: opinion.trim(),
  }
  alertRecordsStore.appendLog(
    next,
    'Verification failed',
    'Returned to owner for rectification',
  )
  return alertRecordsStore.save(next)
}

export function getAlertSummaryCounts(records: AlertRecord[]) {
  const open = records.filter((r) => r.Status !== 'closed').length
  const overdue = records.filter((r) => r.IsOverdue && r.Status !== 'closed').length
  const urgent = records.filter(
    (r) => r.Status !== 'closed' && effectiveLevel(r) === 'urgent',
  ).length
  return { open, overdue, urgent }
}

export { effectiveLevel }

export function isAlertOwner(record: AlertRecord, userId: string): boolean {
  return record.OwnerId === userId
}

export function canVerifyAlert(userId: string, hasManage: boolean): boolean {
  return hasManage || userId === MOCK_ADMIN_USER_ID
}
