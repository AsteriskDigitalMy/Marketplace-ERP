import type { DataFillingForm, DataFillingTask, DataReview } from '@/models/pms/data-collection'
import {
  MOCK_ADMIN_USER_ID,
  MOCK_LEADER_USER_ID,
  MOCK_ORGANIZATION_ID,
} from '@/lib/pms/constants'
import { kpiStore } from '@/mocks/pms/kpi-store'

function nowIso(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export interface FormTemplate {
  Id: string
  Name: string
  Description: string
  Fields: DataFillingForm['Fields']
}

export interface FillingRule {
  Id: string
  IndicatorId: string
  IndicatorName: string
  Cycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  TargetPositionIds: string[]
  TargetPositionNames: string[]
  TemplateId: string
  TemplateName: string
  DueOffsetDays: number
  IsActive: boolean
  LastTriggeredAt: string | null
  OrganizationId: string
}

export interface FillingTaskRecord extends DataFillingTask {
  AssigneeName: string
  RejectionOpinion: string | null
  AlertRecordId: string | null
}

export interface FillingFormRecord extends DataFillingForm {
  IndicatorId: string
  IndicatorName: string
  PeriodLabel: string
  DueAt: string
  RejectionOpinion: string | null
  SubmitterId: string
}

export interface DataReviewRecord extends DataReview {
  SubmitterId: string
  IndicatorId: string
  SubmittedAt: string
  PriorReviewer: string | null
  PriorOpinion: string | null
}

export interface OverdueAlertRecord {
  Id: string
  TaskId: string
  IndicatorName: string
  AssigneeName: string
  CreatedAt: string
  Resolved: boolean
}

const TASK_PENDING_ID = '50000000-0000-0000-0000-000000000001'
const TASK_OVERDUE_ID = '50000000-0000-0000-0000-000000000002'
const TASK_SUBMITTED_ID = '50000000-0000-0000-0000-000000000003'
const REVIEW_PENDING_ID = '51000000-0000-0000-0000-000000000001'
const RULE_OTD_ID = '52000000-0000-0000-0000-000000000001'

const templates: FormTemplate[] = [
  {
    Id: '53000000-0000-0000-0000-000000000001',
    Name: 'OTD Weekly Capture',
    Description: 'On-time delivery counts for the reporting week',
    Fields: [
      {
        Key: 'TOTAL_ORDERS',
        Label: 'Total orders shipped',
        Type: 'number',
        Required: true,
        Min: 1,
        Max: 100000,
        Options: null,
        Value: null,
      },
      {
        Key: 'ON_TIME_COUNT',
        Label: 'Orders delivered on time',
        Type: 'number',
        Required: true,
        Min: 0,
        Max: 100000,
        Options: null,
        Value: null,
      },
      {
        Key: 'REPORTING_WEEK',
        Label: 'Reporting week end',
        Type: 'date',
        Required: true,
        Min: null,
        Max: null,
        Options: null,
        Value: null,
      },
      {
        Key: 'REMARKS',
        Label: 'Remarks',
        Type: 'text',
        Required: false,
        Min: null,
        Max: null,
        Options: null,
        Value: null,
      },
    ],
  },
  {
    Id: '53000000-0000-0000-0000-000000000002',
    Name: 'Scrap Rate Daily',
    Description: 'Daily scrap quantity capture',
    Fields: [
      {
        Key: 'TOTAL_QTY',
        Label: 'Total production quantity',
        Type: 'number',
        Required: true,
        Min: 1,
        Max: 50000,
        Options: null,
        Value: null,
      },
      {
        Key: 'SCRAP_QTY',
        Label: 'Scrapped quantity',
        Type: 'number',
        Required: true,
        Min: 0,
        Max: 50000,
        Options: null,
        Value: null,
      },
      {
        Key: 'SHIFT',
        Label: 'Shift',
        Type: 'select',
        Required: true,
        Min: null,
        Max: null,
        Options: ['Day', 'Night'],
        Value: null,
      },
    ],
  },
]

const fillingRules: FillingRule[] = [
  {
    Id: RULE_OTD_ID,
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    IndicatorName: 'On-Time Delivery Rate',
    Cycle: 'weekly',
    TargetPositionIds: ['POS-PROD-SPEC', 'POS-PROJ-LEAD'],
    TargetPositionNames: ['Production Specialist', 'Project Leader'],
    TemplateId: templates[0].Id,
    TemplateName: templates[0].Name,
    DueOffsetDays: 2,
    IsActive: true,
    LastTriggeredAt: daysAgo(7),
    OrganizationId: MOCK_ORGANIZATION_ID,
  },
  {
    Id: '52000000-0000-0000-0000-000000000002',
    IndicatorId: '30000000-0000-0000-0000-000000000003',
    IndicatorName: 'Scrap Rate',
    Cycle: 'daily',
    TargetPositionIds: ['POS-PROD-SPEC'],
    TargetPositionNames: ['Production Specialist'],
    TemplateId: templates[1].Id,
    TemplateName: templates[1].Name,
    DueOffsetDays: 1,
    IsActive: false,
    LastTriggeredAt: daysAgo(30),
    OrganizationId: MOCK_ORGANIZATION_ID,
  },
]

const fillingTasks: FillingTaskRecord[] = [
  {
    Id: TASK_PENDING_ID,
    OrganizationId: MOCK_ORGANIZATION_ID,
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    IndicatorName: 'On-Time Delivery Rate',
    PeriodLabel: '2026-W24',
    DueAt: daysFromNow(3),
    Status: 'pending',
    AssigneeId: MOCK_ADMIN_USER_ID,
    AssigneeName: 'System Administrator',
    TemplateId: templates[0].Id,
    RejectionOpinion: null,
    AlertRecordId: null,
  },
  {
    Id: TASK_OVERDUE_ID,
    OrganizationId: MOCK_ORGANIZATION_ID,
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    IndicatorName: 'On-Time Delivery Rate',
    PeriodLabel: '2026-W23',
    DueAt: daysAgo(2),
    Status: 'overdue',
    AssigneeId: MOCK_ADMIN_USER_ID,
    AssigneeName: 'System Administrator',
    TemplateId: templates[0].Id,
    RejectionOpinion: null,
    AlertRecordId: '54000000-0000-0000-0000-000000000001',
  },
  {
    Id: TASK_SUBMITTED_ID,
    OrganizationId: MOCK_ORGANIZATION_ID,
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    IndicatorName: 'On-Time Delivery Rate',
    PeriodLabel: '2026-W22',
    DueAt: daysAgo(14),
    Status: 'submitted',
    AssigneeId: MOCK_LEADER_USER_ID,
    AssigneeName: 'Ahmad Rahman',
    TemplateId: templates[0].Id,
    RejectionOpinion: null,
    AlertRecordId: null,
  },
]

const forms: FillingFormRecord[] = [
  {
    TaskId: TASK_PENDING_ID,
    TemplateId: templates[0].Id,
    Fields: templates[0].Fields.map((f) => ({ ...f })),
    Status: 'draft',
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    IndicatorName: 'On-Time Delivery Rate',
    PeriodLabel: '2026-W24',
    DueAt: daysFromNow(3),
    RejectionOpinion: null,
    SubmitterId: MOCK_ADMIN_USER_ID,
  },
  {
    TaskId: TASK_OVERDUE_ID,
    TemplateId: templates[0].Id,
    Fields: templates[0].Fields.map((f) => ({ ...f, Value: null })),
    Status: 'draft',
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    IndicatorName: 'On-Time Delivery Rate',
    PeriodLabel: '2026-W23',
    DueAt: daysAgo(2),
    RejectionOpinion: null,
    SubmitterId: MOCK_ADMIN_USER_ID,
  },
  {
    TaskId: TASK_SUBMITTED_ID,
    TemplateId: templates[0].Id,
    Fields: templates[0].Fields.map((f) => {
      if (f.Key === 'TOTAL_ORDERS') return { ...f, Value: 420 }
      if (f.Key === 'ON_TIME_COUNT') return { ...f, Value: 388 }
      if (f.Key === 'REPORTING_WEEK') return { ...f, Value: '2026-05-30' }
      if (f.Key === 'REMARKS') return { ...f, Value: 'Carrier delay on 3 lanes' }
      return { ...f }
    }),
    Status: 'pending_review',
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    IndicatorName: 'On-Time Delivery Rate',
    PeriodLabel: '2026-W22',
    DueAt: daysAgo(14),
    RejectionOpinion: null,
    SubmitterId: MOCK_LEADER_USER_ID,
  },
]

const reviews: DataReviewRecord[] = [
  {
    RecordId: REVIEW_PENDING_ID,
    TaskId: TASK_SUBMITTED_ID,
    IndicatorName: 'On-Time Delivery Rate',
    SubmitterName: 'Ahmad Rahman',
    SubmitterId: MOCK_LEADER_USER_ID,
    IndicatorId: '30000000-0000-0000-0000-000000000002',
    PeriodLabel: '2026-W22',
    ReviewLevel: 'team',
    FilledData: {
      TOTAL_ORDERS: 420,
      ON_TIME_COUNT: 388,
      REPORTING_WEEK: '2026-05-30',
      REMARKS: 'Carrier delay on 3 lanes',
    },
    Status: 'pending_review',
    Opinion: null,
    SubmittedAt: daysAgo(10),
    PriorReviewer: null,
    PriorOpinion: null,
    Messages: [
      {
        At: daysAgo(9),
        Author: 'Ahmad Rahman',
        Text: 'Submitted weekly OTD figures — please confirm carrier exclusions.',
      },
    ],
  },
]

const overdueAlerts: OverdueAlertRecord[] = [
  {
    Id: '54000000-0000-0000-0000-000000000001',
    TaskId: TASK_OVERDUE_ID,
    IndicatorName: 'On-Time Delivery Rate',
    AssigneeName: 'System Administrator',
    CreatedAt: daysAgo(1),
    Resolved: false,
  },
]

function refreshOverdueStatuses() {
  const now = Date.now()
  fillingTasks.forEach((task, i) => {
    if (
      (task.Status === 'pending' || task.Status === 'overdue') &&
      new Date(task.DueAt).getTime() < now
    ) {
      if (task.Status !== 'overdue') {
        fillingTasks[i] = { ...task, Status: 'overdue' }
        if (!task.AlertRecordId) {
          const alertId = newId()
          overdueAlerts.push({
            Id: alertId,
            TaskId: task.Id,
            IndicatorName: task.IndicatorName,
            AssigneeName: task.AssigneeName,
            CreatedAt: nowIso(),
            Resolved: false,
          })
          fillingTasks[i].AlertRecordId = alertId
        }
      }
    }
  })
}

function getTemplateById(id: string): FormTemplate | undefined {
  return templates.find((t) => t.Id === id)
}

function fieldsToRecord(fields: DataFillingForm['Fields']): Record<string, string | number> {
  const record: Record<string, string | number> = {}
  fields.forEach((f) => {
    if (f.Value !== null && f.Value !== '') {
      record[f.Key] = f.Value
    }
  })
  return record
}

export const dataCollectionStore = {
  getRules(): FillingRule[] {
    return fillingRules.map((r) => ({ ...r }))
  },

  getRuleById(id: string): FillingRule | undefined {
    return fillingRules.find((r) => r.Id === id)
  },

  getTemplates(): FormTemplate[] {
    return templates.map((t) => ({ ...t, Fields: t.Fields.map((f) => ({ ...f })) }))
  },

  getManualFillIndicators(): { Id: string; Code: string; Name: string }[] {
    return kpiStore
      .getIndicators()
      .filter((i) => i.DataSource === 'manual' || i.DataSource === 'mixed')
      .map((i) => ({ Id: i.Id, Code: i.Code, Name: i.Name }))
  },

  getPositionOptions(): { Id: string; Name: string }[] {
    return [
      { Id: 'POS-PROD-SPEC', Name: 'Production Specialist' },
      { Id: 'POS-PROJ-LEAD', Name: 'Project Leader' },
      { Id: 'POS-IT-ADMIN', Name: 'IT Administrator' },
    ]
  },

  saveRule(
    input: Omit<FillingRule, 'Id' | 'OrganizationId' | 'LastTriggeredAt' | 'IndicatorName' | 'TemplateName' | 'TargetPositionNames'> & {
      Id?: string
      IndicatorName?: string
      TemplateName?: string
      TargetPositionNames?: string[]
    },
  ): FillingRule {
    const indicator = kpiStore.getIndicatorById(input.IndicatorId)
    const template = getTemplateById(input.TemplateId)
    const positions = dataCollectionStore.getPositionOptions()
    const positionNames = input.TargetPositionIds.map(
      (id) => positions.find((p) => p.Id === id)?.Name ?? id,
    )

    if (input.TargetPositionIds.length === 0) {
      throw new Error('At least one target position is required')
    }

    const payload: FillingRule = {
      Id: input.Id ?? newId(),
      IndicatorId: input.IndicatorId,
      IndicatorName: indicator?.Name ?? input.IndicatorName ?? 'Unknown',
      Cycle: input.Cycle,
      TargetPositionIds: input.TargetPositionIds,
      TargetPositionNames: positionNames,
      TemplateId: input.TemplateId,
      TemplateName: template?.Name ?? input.TemplateName ?? 'Unknown',
      DueOffsetDays: input.DueOffsetDays,
      IsActive: input.IsActive,
      LastTriggeredAt: input.Id
        ? fillingRules.find((r) => r.Id === input.Id)?.LastTriggeredAt ?? null
        : null,
      OrganizationId: MOCK_ORGANIZATION_ID,
    }

    const index = fillingRules.findIndex((r) => r.Id === payload.Id)
    if (index >= 0) {
      fillingRules[index] = payload
    } else {
      fillingRules.push(payload)
    }
    return { ...payload }
  },

  deleteRule(id: string): void {
    const index = fillingRules.findIndex((r) => r.Id === id)
    if (index === -1) throw new Error('Rule not found')
    fillingRules.splice(index, 1)
  },

  setRuleActive(id: string, active: boolean): FillingRule {
    const index = fillingRules.findIndex((r) => r.Id === id)
    if (index === -1) throw new Error('Rule not found')
    fillingRules[index] = { ...fillingRules[index], IsActive: active }
    return { ...fillingRules[index] }
  },

  getAllTasks(): FillingTaskRecord[] {
    refreshOverdueStatuses()
    return fillingTasks.map((t) => ({ ...t }))
  },

  getTasksByAssignee(userId: string): FillingTaskRecord[] {
    refreshOverdueStatuses()
    return fillingTasks.filter((t) => t.AssigneeId === userId).map((t) => ({ ...t }))
  },

  getDueTasksForUser(userId: string): FillingTaskRecord[] {
    return dataCollectionStore
      .getTasksByAssignee(userId)
      .filter((t) => t.Status === 'pending' || t.Status === 'overdue')
  },

  getTaskById(id: string): FillingTaskRecord | undefined {
    refreshOverdueStatuses()
    return fillingTasks.find((t) => t.Id === id)
  },

  getTaskSummary() {
    refreshOverdueStatuses()
    const all = fillingTasks
    return {
      pending: all.filter((t) => t.Status === 'pending').length,
      submitted: all.filter((t) => t.Status === 'submitted' || t.Status === 'approved').length,
      overdue: all.filter((t) => t.Status === 'overdue').length,
    }
  },

  getFormByTaskId(taskId: string): FillingFormRecord {
    const task = dataCollectionStore.getTaskById(taskId)
    if (!task) throw new Error('Task not found')

    let form = forms.find((f) => f.TaskId === taskId)
    if (!form) {
      const template = getTemplateById(task.TemplateId)
      if (!template) throw new Error('Template not found')
      form = {
        TaskId: taskId,
        TemplateId: task.TemplateId,
        Fields: template.Fields.map((f) => ({ ...f })),
        Status: 'draft',
        IndicatorId: task.IndicatorId,
        IndicatorName: task.IndicatorName,
        PeriodLabel: task.PeriodLabel,
        DueAt: task.DueAt,
        RejectionOpinion: task.RejectionOpinion,
        SubmitterId: task.AssigneeId,
      }
      forms.push(form)
    }
    return { ...form, Fields: form.Fields.map((f) => ({ ...f })) }
  },

  saveFormDraft(taskId: string, fields: DataFillingForm['Fields']): FillingFormRecord {
    const index = forms.findIndex((f) => f.TaskId === taskId)
    const task = dataCollectionStore.getTaskById(taskId)
    if (!task) throw new Error('Task not found')
    if (index === -1) throw new Error('Form not found')

    forms[index] = {
      ...forms[index],
      Fields: fields,
      Status: 'draft',
    }
    return { ...forms[index], Fields: forms[index].Fields.map((f) => ({ ...f })) }
  },

  submitForm(taskId: string, fields: DataFillingForm['Fields']): FillingFormRecord {
    const taskIndex = fillingTasks.findIndex((t) => t.Id === taskId)
    const formIndex = forms.findIndex((f) => f.TaskId === taskId)
    if (taskIndex === -1 || formIndex === -1) throw new Error('Task not found')

    fields.forEach((field) => {
      if (field.Required && (field.Value === null || field.Value === '')) {
        throw new Error(`${field.Label} is required`)
      }
      if (field.Type === 'number' && typeof field.Value === 'number') {
        if (field.Min !== null && field.Value < field.Min) {
          throw new Error(`${field.Label} below minimum ${field.Min}`)
        }
        if (field.Max !== null && field.Value > field.Max) {
          throw new Error(`${field.Label} above maximum ${field.Max}`)
        }
      }
    })

    forms[formIndex] = {
      ...forms[formIndex],
      Fields: fields,
      Status: 'pending_review',
    }
    fillingTasks[taskIndex] = {
      ...fillingTasks[taskIndex],
      Status: 'submitted',
      RejectionOpinion: null,
    }

    if (fillingTasks[taskIndex].AlertRecordId) {
      const alert = overdueAlerts.find((a) => a.Id === fillingTasks[taskIndex].AlertRecordId)
      if (alert) alert.Resolved = true
    }

    const reviewId = newId()
    reviews.push({
      RecordId: reviewId,
      TaskId: taskId,
      IndicatorName: fillingTasks[taskIndex].IndicatorName,
      SubmitterName: fillingTasks[taskIndex].AssigneeName,
      SubmitterId: fillingTasks[taskIndex].AssigneeId,
      IndicatorId: fillingTasks[taskIndex].IndicatorId,
      PeriodLabel: fillingTasks[taskIndex].PeriodLabel,
      ReviewLevel: 'team',
      FilledData: fieldsToRecord(fields),
      Status: 'pending_review',
      Opinion: null,
      SubmittedAt: nowIso(),
      PriorReviewer: null,
      PriorOpinion: null,
      Messages: [],
    })

    return { ...forms[formIndex], Fields: forms[formIndex].Fields.map((f) => ({ ...f })) }
  },

  getReviews(filters?: {
    level?: DataReview['ReviewLevel']
    status?: DataReview['Status']
    search?: string
  }): DataReviewRecord[] {
    let list = reviews.map((r) => ({ ...r }))
    if (filters?.level) {
      list = list.filter((r) => r.ReviewLevel === filters.level)
    }
    if (filters?.status) {
      list = list.filter((r) => r.Status === filters.status)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (r) =>
          r.SubmitterName.toLowerCase().includes(q) ||
          r.IndicatorName.toLowerCase().includes(q),
      )
    }
    return list.sort((a, b) => b.SubmittedAt.localeCompare(a.SubmittedAt))
  },

  getReviewById(recordId: string): DataReviewRecord | undefined {
    return reviews.find((r) => r.RecordId === recordId)
  },

  submitReviewDecision(
    recordId: string,
    decision: 'pass' | 'reject',
    opinion: string,
    reviewerName: string,
  ): DataReviewRecord {
    const index = reviews.findIndex((r) => r.RecordId === recordId)
    if (index === -1) throw new Error('Review record not found')
    const current = reviews[index]
    if (current.Status !== 'pending_review') {
      throw new Error('Record already processed')
    }
    if (decision === 'reject' && !opinion.trim()) {
      throw new Error('Opinion is required when rejecting')
    }

    if (decision === 'pass') {
      if (current.ReviewLevel === 'team') {
        reviews[index] = {
          ...current,
          ReviewLevel: 'department',
          PriorReviewer: reviewerName,
          PriorOpinion: opinion || 'Team level approved',
          Messages: [
            ...current.Messages,
            {
              At: nowIso(),
              Author: reviewerName,
              Text: opinion || 'Approved at team level — forwarded to department review.',
            },
          ],
        }
        return { ...reviews[index] }
      }

      reviews[index] = {
        ...current,
        Status: 'approved',
        Opinion: opinion || 'Approved',
        Messages: [
          ...current.Messages,
          { At: nowIso(), Author: reviewerName, Text: opinion || 'Final approval — locked for KPI calculation.' },
        ],
      }
      const formIndex = forms.findIndex((f) => f.TaskId === current.TaskId)
      if (formIndex >= 0) {
        forms[formIndex] = { ...forms[formIndex], Status: 'approved' }
      }
      const taskIndex = fillingTasks.findIndex((t) => t.Id === current.TaskId)
      if (taskIndex >= 0) {
        fillingTasks[taskIndex] = { ...fillingTasks[taskIndex], Status: 'approved' }
      }
      return { ...reviews[index] }
    }

    reviews[index] = {
      ...current,
      Status: 'rejected',
      Opinion: opinion,
      Messages: [
        ...current.Messages,
        { At: nowIso(), Author: reviewerName, Text: `Rejected: ${opinion}` },
      ],
    }
    const formIndex = forms.findIndex((f) => f.TaskId === current.TaskId)
    if (formIndex >= 0) {
      forms[formIndex] = {
        ...forms[formIndex],
        Status: 'rejected',
        RejectionOpinion: opinion,
      }
    }
    const taskIndex = fillingTasks.findIndex((t) => t.Id === current.TaskId)
    if (taskIndex >= 0) {
      fillingTasks[taskIndex] = {
        ...fillingTasks[taskIndex],
        Status: 'pending',
        RejectionOpinion: opinion,
      }
    }
    return { ...reviews[index] }
  },

  addReviewMessage(recordId: string, author: string, text: string): DataReviewRecord {
    const index = reviews.findIndex((r) => r.RecordId === recordId)
    if (index === -1) throw new Error('Review record not found')
    reviews[index] = {
      ...reviews[index],
      Messages: [...reviews[index].Messages, { At: nowIso(), Author: author, Text: text }],
    }
    return { ...reviews[index] }
  },

  getKpiThresholds(indicatorId: string): { TargetValue: number; AlertThreshold: number | null } | null {
    const kpi = kpiStore.getIndicatorById(indicatorId)
    if (!kpi) return null
    return { TargetValue: kpi.TargetValue, AlertThreshold: kpi.AlertThreshold }
  },

  getNavBadges(userId: string) {
    return {
      myDueTasks: dataCollectionStore.getDueTasksForUser(userId).length,
      pendingReviews: reviews.filter((r) => r.Status === 'pending_review').length,
    }
  },

  getOverdueAlerts(): OverdueAlertRecord[] {
    return overdueAlerts.map((a) => ({ ...a }))
  },
}
