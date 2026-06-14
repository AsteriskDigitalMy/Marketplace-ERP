import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'
import { OrgTierTypeSchema } from '../common/enums'

export const OrgUnitSchema = z
  .object({
    Id: UuidSchema,
    ParentId: UuidSchema.nullable(),
    Code: NonEmptyStringSchema.max(32),
    Name: NonEmptyStringSchema.max(200),
    TierType: OrgTierTypeSchema,
    ProcessTag: z.string().max(100).nullable(),
    SortOrder: z.number().int().min(0),
    IsDisabled: z.boolean().default(false),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)
  .superRefine((data, ctx) => {
    if (data.TierType === 'process' && !data.ProcessTag) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Process-type organizations must bind a production process tag',
        path: ['ProcessTag'],
      })
    }
    if (data.TierType !== 'process' && data.ProcessTag) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Process tag is only allowed for process-tier organizations',
        path: ['ProcessTag'],
      })
    }
  })

export const OrgUnitCreateRequestSchema = OrgUnitSchema.pick({
  OrganizationId: true,
  ParentId: true,
  Name: true,
  TierType: true,
  ProcessTag: true,
  SortOrder: true,
  CreatedBy: true,
  CreatedDatetime: true,
})

export const OrgVersionSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  OrgUnitId: UuidSchema,
  Version: z.number().int().positive(),
  SnapshotAt: DateTimeSchema,
  ActorId: UuidSchema,
  Summary: NonEmptyStringSchema.max(500),
  TreeSnapshot: z.array(OrgUnitSchema),
})

export type OrgUnit = z.infer<typeof OrgUnitSchema>
export type OrgUnitCreateRequest = z.infer<typeof OrgUnitCreateRequestSchema>
export type OrgVersion = z.infer<typeof OrgVersionSchema>
