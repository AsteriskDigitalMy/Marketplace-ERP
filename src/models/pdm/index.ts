import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'

export const ProductProjectSchema = z
  .object({
    Id: UuidSchema,
    ProjectCode: NonEmptyStringSchema.max(32),
    ProductName: NonEmptyStringSchema.max(200),
    Category: NonEmptyStringSchema.max(100),
    CustomerName: NonEmptyStringSchema.max(200),
    Status: z.enum(['Draft', 'In Review', 'Approved', 'Archived', 'Rejected']),
    DevelopmentLeadId: UuidSchema,
    CurrentVersion: z.string().regex(/^v\d+\.\d+$/, 'Version format v{n}.{n}'),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const ProductStyleSchema = z
  .object({
    Id: UuidSchema,
    OrganizationId: UuidSchema,
    StyleNumber: NonEmptyStringSchema.max(50),
    StyleName: NonEmptyStringSchema.max(200),
    Category: NonEmptyStringSchema.max(100),
    Version: z.string(),
    Status: z.enum(['Draft', 'In Review', 'Approved', 'Archived']),
    ProjectId: UuidSchema.nullable(),
  })
  .merge(AuditFieldsSchema)

export const DesignDocumentSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StyleId: UuidSchema,
  DocumentName: NonEmptyStringSchema.max(200),
  DocumentType: z.enum(['sketch', 'tech_pack', 'spec_sheet', 'photo']),
  Version: z.string(),
  Status: z.enum(['Draft', 'In Review', 'Approved']),
  UploadedAt: DateTimeSchema,
})

export const SamplingTaskSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StyleId: UuidSchema,
  SampleType: z.enum(['proto', 'fit', 'pp', 'top']),
  Status: z.enum(['pending', 'in_progress', 'passed', 'failed']),
  DueDate: z.string().date(),
  AssignedToId: UuidSchema,
})

export const FinalizationRecordSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StyleId: UuidSchema,
  StyleNumber: NonEmptyStringSchema,
  Status: z.enum(['pending', 'approved', 'archived']),
  ApprovedAt: DateTimeSchema.nullable(),
  MassProductionAuthorized: z.boolean(),
})

export const ProcessDefinitionSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  ProcessCode: NonEmptyStringSchema.max(32),
  ProcessName: NonEmptyStringSchema.max(200),
  Category: NonEmptyStringSchema.max(100),
  StandardMinutes: z.number().positive(),
  Status: z.enum(['active', 'inactive']),
})

export const WorkingHoursStandardSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  ProcessId: UuidSchema,
  ProcessName: NonEmptyStringSchema,
  StyleCategory: NonEmptyStringSchema,
  StandardMinutes: z.number().positive(),
  EffectiveDate: z.string().date(),
})

export const ProcessRouteSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StyleId: UuidSchema,
  StyleNumber: NonEmptyStringSchema,
  Version: z.string(),
  Status: z.enum(['Draft', 'In Review', 'Approved']),
  OperationCount: z.number().int().positive(),
})

export const BomLineSchema = z.object({
  LineNumber: z.number().int().positive(),
  MaterialId: UuidSchema,
  MaterialCode: NonEmptyStringSchema,
  Quantity: z.number().positive(),
  Unit: NonEmptyStringSchema.max(20),
  ScrapPct: z.number().min(0).max(100).nullable(),
})

export const BomHeaderSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StyleNumber: NonEmptyStringSchema,
  StyleId: UuidSchema,
  Version: z.string(),
  Status: z.enum(['Draft', 'In Review', 'Approved', 'Archived']),
  Lines: z.array(BomLineSchema).min(1),
})

export const CostPricingRecordSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StyleId: UuidSchema,
  StyleNumber: NonEmptyStringSchema,
  MaterialCost: z.number().min(0),
  LaborCost: z.number().min(0),
  OverheadCost: z.number().min(0),
  QuotedPrice: z.number().positive(),
  MarginPct: z.number(),
  Status: z.enum(['draft', 'approved']),
})

export const ChangeRequestSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  EntityType: z.enum(['product', 'style', 'bom', 'routing', 'process']),
  EntityId: UuidSchema,
  Reason: NonEmptyStringSchema.max(4000),
  Status: z.enum(['Draft', 'In Review', 'Approved', 'Rejected']),
  VersionFrom: z.string(),
  VersionTo: z.string(),
  SubmittedAt: DateTimeSchema.nullable(),
})

export type ProductProject = z.infer<typeof ProductProjectSchema>
export type ProductStyle = z.infer<typeof ProductStyleSchema>
export type DesignDocument = z.infer<typeof DesignDocumentSchema>
export type SamplingTask = z.infer<typeof SamplingTaskSchema>
export type FinalizationRecord = z.infer<typeof FinalizationRecordSchema>
export type ProcessDefinition = z.infer<typeof ProcessDefinitionSchema>
export type WorkingHoursStandard = z.infer<typeof WorkingHoursStandardSchema>
export type ProcessRoute = z.infer<typeof ProcessRouteSchema>
export type BomHeader = z.infer<typeof BomHeaderSchema>
export type CostPricingRecord = z.infer<typeof CostPricingRecordSchema>
export type ChangeRequest = z.infer<typeof ChangeRequestSchema>
