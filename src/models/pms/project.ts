import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  PercentIntSchema,
  PositiveMoneySchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'
import { PerformanceGradeSchema, ProjectStatusSchema, TaskStatusSchema } from '../common/enums'

export const ProjectSchema = z
  .object({
    Id: UuidSchema,
    Code: NonEmptyStringSchema.max(32),
    Name: NonEmptyStringSchema.max(200),
    BusinessType: NonEmptyStringSchema.max(100),
    PlannedStart: DateSchema,
    PlannedEnd: DateSchema,
    LeaderId: UuidSchema,
    TeamMemberIds: z.array(UuidSchema).min(1),
    BudgetAmount: PositiveMoneySchema,
    BoundKpiIds: z.array(UuidSchema).min(1),
    ClientInfo: z.string().max(1000).nullable(),
    Status: ProjectStatusSchema,
    SubmittedAt: DateTimeSchema.nullable(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)
  .superRefine((data, ctx) => {
    if (data.PlannedEnd <= data.PlannedStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Planned end date must be after start date',
        path: ['PlannedEnd'],
      })
    }
  })

export const ProjectSubTaskSchema = z
  .object({
    Id: UuidSchema,
    ProjectId: UuidSchema,
    Name: NonEmptyStringSchema.max(200),
    OwnerId: UuidSchema,
    OwnerName: NonEmptyStringSchema,
    PlannedStart: DateSchema,
    PlannedEnd: DateSchema,
    Workload: z.number().positive().nullable(),
    AcceptanceCriteria: NonEmptyStringSchema.max(2000),
    UpdateCycle: z.enum(['daily', 'weekly']),
    PrerequisiteTaskIds: z.array(UuidSchema),
    Status: TaskStatusSchema,
    ProgressPct: PercentIntSchema,
  })
  .merge(TenantScopeSchema)
  .superRefine((data, ctx) => {
    if (data.PlannedEnd < data.PlannedStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Task end date must be on or after start date',
        path: ['PlannedEnd'],
      })
    }
  })

export const TaskProgressUpdateSchema = z
  .object({
    TaskId: UuidSchema,
    ProgressPct: PercentIntSchema,
    ActualDate: DateSchema,
    Description: NonEmptyStringSchema.max(4000),
    Issues: z.string().max(4000).nullable(),
    Attachments: z.array(z.string()),
    UpdatedBy: UuidSchema,
    UpdatedAt: DateTimeSchema,
    IsOverdue: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.ProgressPct === 100 && data.Attachments.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Attachments required when progress is 100%',
        path: ['Attachments'],
      })
    }
  })

export const ProjectIssueSchema = z.object({
  Id: UuidSchema,
  ProjectId: UuidSchema,
  TaskId: UuidSchema,
  TaskName: NonEmptyStringSchema,
  Description: NonEmptyStringSchema.max(4000),
  ResourceType: z.enum(['personnel', 'equipment', 'material', 'budget', 'other']),
  Status: z.enum(['open', 'assigned', 'resolved', 'closed']),
  ReportedAt: DateTimeSchema,
  ReportedBy: UuidSchema,
  HandlerId: UuidSchema.nullable(),
  Deadline: DateTimeSchema.nullable(),
  ResolutionMeasures: z.string().max(4000).nullable(),
  DisposalResult: z.string().max(4000).nullable(),
})

export const ProjectAcceptanceApplicationSchema = z.object({
  ProjectId: UuidSchema,
  CompletionSummary: NonEmptyStringSchema.max(8000),
  TargetAchievement: z.enum(['met', 'partial', 'not_met']),
  Attachments: z.array(z.string()).min(1),
  AllTasksAccepted: z.boolean(),
  Status: z.literal('pending_acceptance'),
  SubmittedAt: DateTimeSchema,
  SubmittedBy: UuidSchema,
})

export const ProjectAcceptanceReviewSchema = z.object({
  ProjectId: UuidSchema,
  Opinion: NonEmptyStringSchema.max(4000),
  EvaluationGrade: PerformanceGradeSchema,
  Decision: z.enum(['pass', 'fail']),
  RectificationRequirements: z.string().max(4000).nullable(),
  ReviewedAt: DateTimeSchema,
})

export type Project = z.infer<typeof ProjectSchema>
export type ProjectSubTask = z.infer<typeof ProjectSubTaskSchema>
export type TaskProgressUpdate = z.infer<typeof TaskProgressUpdateSchema>
export type ProjectIssue = z.infer<typeof ProjectIssueSchema>
export type ProjectAcceptanceApplication = z.infer<typeof ProjectAcceptanceApplicationSchema>
export type ProjectAcceptanceReview = z.infer<typeof ProjectAcceptanceReviewSchema>
