import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'

export const WarehouseTreeNodeSchema: z.ZodType<WarehouseTreeNode> = z.lazy(() =>
  z.object({
    Id: UuidSchema,
    ParentId: UuidSchema.nullable(),
    Code: NonEmptyStringSchema.max(32),
    Name: NonEmptyStringSchema.max(200),
    NodeType: z.enum(['warehouse', 'zone', 'location']),
    IsActive: z.boolean(),
    Children: z.array(WarehouseTreeNodeSchema).optional(),
  }),
)

export interface WarehouseTreeNode {
  Id: string
  ParentId: string | null
  Code: string
  Name: string
  NodeType: 'warehouse' | 'zone' | 'location'
  IsActive: boolean
  Children?: WarehouseTreeNode[]
}

export const MaterialWarehouseProfileSchema = z
  .object({
    Id: UuidSchema,
    MaterialId: UuidSchema,
    MaterialCode: NonEmptyStringSchema,
    MaterialName: NonEmptyStringSchema,
    DefaultLocationId: UuidSchema.nullable(),
    MinStock: z.number().min(0),
    MaxStock: z.number().positive(),
    OnHandQty: z.number().min(0),
    ShelfLifeDays: z.number().int().positive().nullable(),
    BatchControlled: z.boolean(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const WarehouseStrategySchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  StrategyCode: NonEmptyStringSchema.max(32),
  StrategyName: NonEmptyStringSchema.max(200),
  StrategyType: z.enum(['fifo', 'fefo', 'fixed_location', 'random']),
  IsActive: z.boolean(),
})

export const InboundTaskSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  TaskNumber: NonEmptyStringSchema.max(32),
  TaskType: z.enum(['purchase', 'production', 'misc']),
  SourceDocumentId: UuidSchema.nullable(),
  MaterialCode: NonEmptyStringSchema,
  ExpectedQty: z.number().positive(),
  ReceivedQty: z.number().min(0),
  Status: z.enum(['open', 'receiving', 'putaway', 'completed', 'cancelled']),
  CreatedAt: DateTimeSchema,
})

export const OutboundTaskSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  TaskNumber: NonEmptyStringSchema.max(32),
  TaskType: z.enum(['production_pick', 'sales_ship', 'misc']),
  SourceDocumentId: UuidSchema.nullable(),
  MaterialCode: NonEmptyStringSchema,
  RequiredQty: z.number().positive(),
  PickedQty: z.number().min(0),
  Status: z.enum(['open', 'picking', 'shipped', 'completed', 'cancelled']),
  CreatedAt: DateTimeSchema,
})

export const InventoryTransferSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  TransferNumber: NonEmptyStringSchema.max(32),
  FromLocationId: UuidSchema,
  ToLocationId: UuidSchema,
  MaterialId: UuidSchema,
  Quantity: z.number().positive(),
  BatchNumber: z.string().nullable(),
  Status: z.enum(['draft', 'in_transit', 'completed', 'cancelled']),
  CreatedAt: DateTimeSchema,
})

export const WarehouseAlertSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  MaterialId: UuidSchema,
  MaterialCode: NonEmptyStringSchema,
  LocationId: UuidSchema,
  AlertType: z.enum(['low_stock', 'overstock', 'expiry', 'quality_hold']),
  CurrentQty: z.number().min(0),
  ThresholdQty: z.number().min(0),
  TriggeredAt: DateTimeSchema,
  IsAcknowledged: z.boolean(),
})

export const BatchRecordSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  MaterialCode: NonEmptyStringSchema,
  BatchNumber: NonEmptyStringSchema,
  Quantity: z.number().min(0),
  ExpiryDate: z.string().date().nullable(),
  LocationId: UuidSchema,
  Status: z.enum(['available', 'hold', 'expired']),
})

export const ReservationSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  MaterialCode: NonEmptyStringSchema,
  ReservedQty: z.number().positive(),
  SourceDocumentType: z.enum(['sales_order', 'work_order', 'transfer']),
  SourceDocumentId: UuidSchema,
  Status: z.enum(['active', 'released', 'consumed']),
})

export const StockTakeSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  CountNumber: NonEmptyStringSchema.max(32),
  WarehouseId: UuidSchema,
  Status: z.enum(['planned', 'in_progress', 'variance_review', 'completed']),
  PlannedDate: z.string().date(),
  VarianceCount: z.number().int().min(0),
})

export const TraceabilityRecordSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  MaterialCode: NonEmptyStringSchema,
  BatchNumber: NonEmptyStringSchema,
  Direction: z.enum(['inbound', 'outbound', 'transfer']),
  DocumentNumber: NonEmptyStringSchema,
  Quantity: z.number().positive(),
  Timestamp: DateTimeSchema,
})

export type MaterialWarehouseProfile = z.infer<typeof MaterialWarehouseProfileSchema>
export type WarehouseStrategy = z.infer<typeof WarehouseStrategySchema>
export type InboundTask = z.infer<typeof InboundTaskSchema>
export type OutboundTask = z.infer<typeof OutboundTaskSchema>
export type InventoryTransfer = z.infer<typeof InventoryTransferSchema>
export type WarehouseAlert = z.infer<typeof WarehouseAlertSchema>
export type BatchRecord = z.infer<typeof BatchRecordSchema>
export type Reservation = z.infer<typeof ReservationSchema>
export type StockTake = z.infer<typeof StockTakeSchema>
export type TraceabilityRecord = z.infer<typeof TraceabilityRecordSchema>
