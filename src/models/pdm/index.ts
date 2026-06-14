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

export const ProductStyleSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StyleNumber: NonEmptyStringSchema.max(50),
  StyleName: NonEmptyStringSchema.max(200),
  Category: NonEmptyStringSchema.max(100),
  Version: z.string(),
  Status: z.enum(['Draft', 'In Review', 'Approved', 'Archived']),
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
  Version: z.string(),
  Status: z.enum(['Draft', 'In Review', 'Approved', 'Archived']),
  Lines: z.array(BomLineSchema).min(1),
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
export type BomHeader = z.infer<typeof BomHeaderSchema>
export type ChangeRequest = z.infer<typeof ChangeRequestSchema>
