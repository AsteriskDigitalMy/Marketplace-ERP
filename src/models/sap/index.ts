import { z } from 'zod'
import { DateTimeSchema, NonEmptyStringSchema, UuidSchema } from '../common/primitives'
import { SyncStatusSchema } from '../common/enums'

export const IntegrationConfigSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  SapEndpoint: z.string().url(),
  ClientId: NonEmptyStringSchema,
  IsEnabled: z.boolean(),
  LastHealthCheckAt: DateTimeSchema.nullable(),
  LastHealthStatus: z.enum(['healthy', 'degraded', 'down']).nullable(),
})

export const SyncLogEntrySchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  DocumentType: z.enum(['p2p', 'o2c', 'production_cost', 'inventory_valuation', 'master_data']),
  DocumentId: UuidSchema,
  Direction: z.enum(['erp_to_sap', 'sap_to_erp']),
  Status: SyncStatusSchema,
  AttemptedAt: DateTimeSchema,
  CompletedAt: DateTimeSchema.nullable(),
  ErrorMessage: z.string().nullable(),
  PayloadHash: z.string().length(64),
})

export const P2pSyncDocumentSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  PurchaseOrderId: UuidSchema,
  SapDocumentNumber: z.string().nullable(),
  SyncStatus: SyncStatusSchema,
  LastSyncedAt: DateTimeSchema.nullable(),
})

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>
export type SyncLogEntry = z.infer<typeof SyncLogEntrySchema>
export type P2pSyncDocument = z.infer<typeof P2pSyncDocumentSchema>
