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
  CockpitChartTypeSchema,
  CockpitRoleSchema,
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
  RuleName: NonEmptyStringSchema,
  Type: z.enum(['kpi', 'project', 'filing']),
  MonitoredObjectLabel: NonEmptyStringSchema,
  Level: AlertLevelSchema,
  EffectiveLevel: AlertLevelSchema.optional(),
  TriggeredAt: DateTimeSchema,
  DeadlineAt: DateTimeSchema,
  IsOverdue: z.boolean(),
  EscalationHistory: z.array(
    z.object({
      At: DateTimeSchema,
      FromLevel: AlertLevelSchema,
      ToLevel: AlertLevelSchema,
      Reason: NonEmptyStringSchema,
    }),
  ),
  Status: z.enum(['open', 'investigating', 'rectifying', 'pending_verification', 'closed']),
  OwnerId: UuidSchema,
  Cause: z.string().max(4000).nullable(),
  ImpactScope: z.string().max(4000).nullable(),
  RectificationMeasures: z.string().max(4000).nullable(),
  PlannedCompletionDate: DateTimeSchema.nullable(),
  CompletionResult: z.string().max(4000).nullable(),
  VerificationOpinion: z.string().max(4000).nullable(),
  Attachments: z.array(z.string()),
  DisposalLog: z.array(
    z.object({
      At: DateTimeSchema,
      Actor: NonEmptyStringSchema,
      Action: NonEmptyStringSchema,
      Detail: z.string(),
    }),
  ),
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
  Category: z.enum(['progress', 'delay', 'performance']).optional(),
})

export const RoleCockpitChartSchema = z.object({
  Id: UuidSchema,
  Title: NonEmptyStringSchema,
  Type: CockpitChartTypeSchema,
  Category: z.enum(['progress', 'delay', 'performance']).default('progress'),
  Series: z.array(
    z.object({
      Label: NonEmptyStringSchema,
      Value: z.number(),
    }),
  ),
})

export const RoleCockpitTableSchema = z.object({
  Columns: z.array(NonEmptyStringSchema),
  Rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
})

export const RoleCockpitSchema = z.object({
  Role: CockpitRoleSchema,
  CockpitTitle: NonEmptyStringSchema,
  LastRefreshedAt: DateTimeSchema,
  RefreshIntervalSec: z.number().int().positive(),
  Cards: z.array(RoleCockpitCardSchema),
  Charts: z.array(RoleCockpitChartSchema),
  Table: RoleCockpitTableSchema,
})

export const DrillDownMetricSchema = z.object({
  Name: NonEmptyStringSchema,
  Value: z.number(),
  Unit: z.string(),
  StatusColor: TrafficLightColorSchema,
})

export const DrillDownNodeSchema: z.ZodType<DrillDownNode> = z.lazy(() =>
  z.object({
    Id: UuidSchema,
    Label: NonEmptyStringSchema,
    Level: z.enum(['department', 'team', 'individual']),
    ParentId: UuidSchema.nullable(),
    Metrics: z.array(DrillDownMetricSchema),
    EmployeeId: z.string().optional(),
    EmployeeEmail: z.string().optional(),
    EmployeeTitle: z.string().optional(),
    Children: z.array(DrillDownNodeSchema).optional(),
  }),
)

export interface DrillDownNode {
  Id: string
  Label: string
  Level: 'department' | 'team' | 'individual'
  ParentId: string | null
  Metrics: {
    Name: string
    Value: number
    Unit: string
    StatusColor: 'green' | 'yellow' | 'red'
  }[]
  EmployeeId?: string
  EmployeeEmail?: string
  EmployeeTitle?: string
  Children?: DrillDownNode[]
}

export const DrillDownRequestSchema = z.object({
  SourceWidgetId: UuidSchema,
  DataPointId: z.string(),
  Level: z.number().int().min(1).max(3),
  ParentId: UuidSchema.nullable().optional(),
})

export type AlertRule = z.infer<typeof AlertRuleSchema>
export type AlertRecord = z.infer<typeof AlertRecordSchema>
export type AppraisalScheme = z.infer<typeof AppraisalSchemeSchema>
export type PdcaProposal = z.infer<typeof PdcaProposalSchema>
export type RoleCockpit = z.infer<typeof RoleCockpitSchema>
export type DrillDownRequest = z.infer<typeof DrillDownRequestSchema>
