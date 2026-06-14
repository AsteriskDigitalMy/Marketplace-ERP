import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  PercentSchema,
  PositiveMoneySchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'
import {
  KpiCycleSchema,
  KpiDataSourceSchema,
  KpiEvaluationObjectSchema,
  KpiIndicatorStatusSchema,
} from '../common/enums'

export const KpiIndicatorSchema = z
  .object({
    Id: UuidSchema,
    Code: NonEmptyStringSchema.max(50).regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric'),
    Name: NonEmptyStringSchema.max(200),
    Category: NonEmptyStringSchema.max(100),
    StatisticalScope: NonEmptyStringSchema.max(500),
    Formula: NonEmptyStringSchema.max(4000),
    TargetValue: PositiveMoneySchema,
    ChallengeValue: z.number().positive().nullable(),
    BaselineValue: z.number().nullable(),
    Cycle: KpiCycleSchema,
    EvaluationObject: KpiEvaluationObjectSchema,
    DataSource: KpiDataSourceSchema,
    WeightPct: PercentSchema.nullable(),
    AlertThreshold: z.number().nullable(),
    Version: z.string().regex(/^V\d+\.\d+$/, 'Version format V{n}.{n}'),
    Status: KpiIndicatorStatusSchema,
    IsCoreLocked: z.boolean().default(false),
    HasCalculationHistory: z.boolean().default(false),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const KpiIndicatorVersionSchema = z.object({
  IndicatorId: UuidSchema,
  Version: z.string(),
  ChangedAt: DateTimeSchema,
  ChangedBy: UuidSchema,
  Summary: NonEmptyStringSchema.max(500),
  HasCalculationHistory: z.boolean(),
  Snapshot: KpiIndicatorSchema.partial(),
})

export const FormulaValidationResultSchema = z.object({
  IsValid: z.boolean(),
  Errors: z.array(z.string()),
  SimulatedResult: z.number().nullable(),
  ReferencedIndicators: z.array(
    z.object({
      Code: NonEmptyStringSchema,
      Name: NonEmptyStringSchema,
      IsEnabled: z.boolean(),
    }),
  ),
})

export const KpiCalculationJobSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  Cycle: KpiCycleSchema,
  ScheduledAt: DateTimeSchema,
  CompletedAt: DateTimeSchema.nullable(),
  Status: z.enum(['running', 'success', 'partial', 'failed']),
  Results: z.array(
    z.object({
      IndicatorId: UuidSchema,
      IndicatorName: NonEmptyStringSchema,
      Value: z.number().nullable(),
      TargetValue: PositiveMoneySchema,
      Status: z.enum(['ok', 'anomaly', 'error']),
      ErrorMessage: z.string().nullable(),
    }),
  ),
})

export const RecalculationRequestSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  Scope: z.enum(['all', 'indicator', 'cycle']),
  IndicatorId: UuidSchema.nullable(),
  CycleLabel: z.string().nullable(),
  Status: z.enum(['queued', 'running', 'completed', 'failed']),
  ProgressPct: PercentSchema,
  StartedBy: UuidSchema,
  StartedAt: DateTimeSchema,
  CompletedAt: DateTimeSchema.nullable(),
  OverwrittenCount: z.number().int().min(0),
  HistoryRetained: z.boolean(),
})

export type KpiIndicator = z.infer<typeof KpiIndicatorSchema>
export type KpiIndicatorVersion = z.infer<typeof KpiIndicatorVersionSchema>
export type FormulaValidationResult = z.infer<typeof FormulaValidationResultSchema>
export type KpiCalculationJob = z.infer<typeof KpiCalculationJobSchema>
export type RecalculationRequest = z.infer<typeof RecalculationRequestSchema>
