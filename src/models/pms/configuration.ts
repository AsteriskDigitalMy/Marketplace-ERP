import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'
import { TrafficLightColorSchema } from '../common/enums'

export const DictionaryItemSchema = z.object({
  Code: NonEmptyStringSchema.max(50),
  DisplayName: NonEmptyStringSchema.max(200),
  SortOrder: z.number().int().min(0),
  IsEnabled: z.boolean(),
})

export const DictionaryCategorySchema = z
  .object({
    Code: NonEmptyStringSchema.max(50),
    Name: NonEmptyStringSchema.max(200),
    IsBuiltin: z.boolean(),
    Items: z.array(DictionaryItemSchema),
  })
  .merge(TenantScopeSchema)
  .superRefine((data, ctx) => {
    const codes = new Set<string>()
    const names = new Set<string>()
    data.Items.forEach((item, index) => {
      if (codes.has(item.Code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dictionary code must be unique within category',
          path: ['Items', index, 'Code'],
        })
      }
      codes.add(item.Code)
      if (names.has(item.DisplayName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Display name must be unique within category',
          path: ['Items', index, 'DisplayName'],
        })
      }
      names.add(item.DisplayName)
    })
  })

export const OperationLogSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  OperatorAccount: NonEmptyStringSchema,
  OperatedAt: DateTimeSchema,
  BusinessType: NonEmptyStringSchema.max(100),
  TargetLabel: NonEmptyStringSchema.max(200),
  Action: NonEmptyStringSchema.max(100),
  LoginIp: z.string().min(7).max(45),
  BeforeData: z.record(z.string(), z.unknown()).nullable(),
  AfterData: z.record(z.string(), z.unknown()).nullable(),
})

export const SystemParameterSchema = z
  .object({
    Code: NonEmptyStringSchema.max(100),
    Name: NonEmptyStringSchema.max(200),
    Category: NonEmptyStringSchema.max(100),
    DataType: z.enum(['string', 'number', 'boolean', 'date']),
    Value: z.union([z.string(), z.number(), z.boolean()]),
    EffectiveAt: DateTimeSchema,
    IsCore: z.boolean(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const TrafficLightBandSchema = z.object({
  Color: TrafficLightColorSchema,
  Min: z.number(),
  Max: z.number(),
})

export const TrafficLightRuleSchema = z
  .object({
    Id: UuidSchema,
    Category: z.enum(['progress', 'delay', 'performance']),
    MetricScope: z.array(NonEmptyStringSchema),
    Bands: z.array(TrafficLightBandSchema).length(3),
    UpdatedAt: DateTimeSchema,
    UpdatedBy: UuidSchema,
  })
  .merge(TenantScopeSchema)
  .superRefine((data, ctx) => {
    const sorted = [...data.Bands].sort((a, b) => a.Min - b.Min)
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].Min <= sorted[i - 1].Max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Traffic light bands must not overlap',
          path: ['Bands'],
        })
        break
      }
    }
  })

export type DictionaryCategory = z.infer<typeof DictionaryCategorySchema>
export type OperationLog = z.infer<typeof OperationLogSchema>
export type SystemParameter = z.infer<typeof SystemParameterSchema>
export type TrafficLightRule = z.infer<typeof TrafficLightRuleSchema>
