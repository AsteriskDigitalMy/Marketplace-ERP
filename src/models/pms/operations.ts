import { z } from 'zod'
import {
  DateTimeSchema,
  NonEmptyStringSchema,
  PercentSchema,
  UuidSchema,
} from '../common/primitives'
import {
  AlertChannelSchema,
  AlertLevelSchema,
  PerformanceGradeSchema,
  TrafficLightColorSchema,
} from '../common/enums'

export const AlertRuleSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  Name: NonEmptyStringSchema.max(200),
  Type: z.enum(['kpi', 'project', 'filing']),
  MonitoredObjectId: UuidSchema,
  MonitoredObjectLabel: NonEmptyStringSchema,
  Condition: z.object({
    Field: NonEmptyStringSchema,
    Operator: z.enum(['>', '<', '=', '>=', '<=']),
    Value: z.union([z.number(), z.string()]),
  }),
  Level: AlertLevelSchema,
  Channels: z.array(AlertChannelSchema).min(1),
  IsEnabled: z.boolean(),
  LastTriggeredAt: DateTimeSchema.nullable(),
})

export const AlertRecordSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  RuleId: UuidSchema,
  Type: z.enum(['kpi', 'project', 'filing']),
  Level: AlertLevelSchema,
  TriggeredAt: DateTimeSchema,
  DeadlineAt: DateTimeSchema,
  IsOverdue: z.boolean(),
  Status: z.enum(['open', 'investigating', 'rectifying', 'pending_verification', 'closed']),
  OwnerId: UuidSchema,
  Cause: z.string().max(4000).nullable(),
  RectificationMeasures: z.string().max(4000).nullable(),
  PlannedCompletionDate: DateTimeSchema.nullable(),
  CompletionResult: z.string().max(4000).nullable(),
  VerificationOpinion: z.string().max(4000).nullable(),
})

export const AppraisalSchemeSchema = z
  .object({
    Id: UuidSchema,
    OrganizationId: UuidSchema,
    Name: NonEmptyStringSchema.max(200),
    Departments: z.array(UuidSchema).min(1),
    Roles: z.array(UuidSchema).min(1),
    ProjectTypes: z.array(z.string()),
    Cycle: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']),
    Indicators: z.array(
      z.object({
        KpiId: UuidSchema,
        KpiName: NonEmptyStringSchema,
        WeightPct: PercentSchema,
      }),
    ),
    GradeRules: z.array(
      z.object({
        Grade: PerformanceGradeSchema,
        MinScore: z.number().min(0).max(100),
        MaxScore: z.number().min(0).max(100),
      }),
    ),
    Status: z.enum(['draft', 'active', 'archived']),
  })
  .superRefine((data, ctx) => {
    const totalWeight = data.Indicators.reduce((sum, i) => sum + i.WeightPct, 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indicator weights must sum to 100%',
        path: ['Indicators'],
      })
    }
  })

export const PdcaProposalSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  Title: NonEmptyStringSchema.max(200),
  Category: z.enum(['production', 'cost', 'efficiency', 'management']),
  ProblemStatus: z.string().min(50).max(8000),
  ImprovementScheme: NonEmptyStringSchema.max(8000),
  ExpectedResults: NonEmptyStringSchema.max(4000),
  Attachments: z.array(z.string()),
  SubmitterId: UuidSchema,
  SubmitterName: NonEmptyStringSchema,
  Status: z.enum(['pending_evaluation', 'approved', 'rejected', 'in_execution', 'completed']),
  SubmittedAt: DateTimeSchema,
  SourceHrRectificationId: UuidSchema.nullable(),
  AuditorComments: z.string().max(4000).nullable(),
})

export const RoleCockpitCardSchema = z.object({
  Id: UuidSchema,
  Label: NonEmptyStringSchema,
  Value: z.number(),
  Unit: z.string(),
  StatusColor: TrafficLightColorSchema,
  TrendPct: z.number().nullable(),
})

export const RoleCockpitSchema = z.object({
  Role: NonEmptyStringSchema,
  CockpitTitle: NonEmptyStringSchema,
  LastRefreshedAt: DateTimeSchema,
  RefreshIntervalSec: z.number().int().positive(),
  Cards: z.array(RoleCockpitCardSchema),
})

export type AlertRule = z.infer<typeof AlertRuleSchema>
export type AlertRecord = z.infer<typeof AlertRecordSchema>
export type AppraisalScheme = z.infer<typeof AppraisalSchemeSchema>
export type PdcaProposal = z.infer<typeof PdcaProposalSchema>
export type RoleCockpit = z.infer<typeof RoleCockpitSchema>
