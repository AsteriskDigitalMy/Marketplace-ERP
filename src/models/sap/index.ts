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
  DocumentNumber: NonEmptyStringSchema,
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
  PoNumber: NonEmptyStringSchema,
  SapDocumentNumber: z.string().nullable(),
  SyncStatus: SyncStatusSchema,
  LastSyncedAt: DateTimeSchema.nullable(),
})

export const O2cSyncDocumentSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  SalesOrderId: UuidSchema,
  OrderNumber: NonEmptyStringSchema,
  SapDocumentNumber: z.string().nullable(),
  SyncStatus: SyncStatusSchema,
  LastSyncedAt: DateTimeSchema.nullable(),
})

export const ProductionCostSyncSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  WorkOrderId: UuidSchema,
  WorkOrderNumber: NonEmptyStringSchema,
  TotalCost: z.number().min(0),
  SyncStatus: SyncStatusSchema,
  LastSyncedAt: DateTimeSchema.nullable(),
})

export const InventoryValuationSyncSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  MaterialCode: NonEmptyStringSchema,
  ValuationAmount: z.number().min(0),
  SyncStatus: SyncStatusSchema,
  LastSyncedAt: DateTimeSchema.nullable(),
})

export const MasterDataSyncRecordSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  EntityType: z.enum(['customer', 'supplier', 'material', 'product']),
  EntityId: UuidSchema,
  EntityCode: NonEmptyStringSchema,
  SyncStatus: SyncStatusSchema,
  LastSyncedAt: DateTimeSchema.nullable(),
})

export const IntegrationExceptionSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  DocumentType: NonEmptyStringSchema,
  DocumentNumber: NonEmptyStringSchema,
  ErrorCode: NonEmptyStringSchema,
  ErrorMessage: NonEmptyStringSchema,
  Status: z.enum(['open', 'retrying', 'resolved', 'locked']),
  CreatedAt: DateTimeSchema,
})

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>
export type SyncLogEntry = z.infer<typeof SyncLogEntrySchema>
export type P2pSyncDocument = z.infer<typeof P2pSyncDocumentSchema>
export type O2cSyncDocument = z.infer<typeof O2cSyncDocumentSchema>
export type ProductionCostSync = z.infer<typeof ProductionCostSyncSchema>
export type InventoryValuationSync = z.infer<typeof InventoryValuationSyncSchema>
export type MasterDataSyncRecord = z.infer<typeof MasterDataSyncRecordSchema>
export type IntegrationException = z.infer<typeof IntegrationExceptionSchema>
