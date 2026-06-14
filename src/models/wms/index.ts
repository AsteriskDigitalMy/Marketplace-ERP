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
    DefaultLocationId: UuidSchema.nullable(),
    MinStock: z.number().min(0),
    MaxStock: z.number().positive(),
    ShelfLifeDays: z.number().int().positive().nullable(),
    BatchControlled: z.boolean(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)
  .superRefine((data, ctx) => {
    if (data.MaxStock < data.MinStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max stock must be >= min stock',
        path: ['MaxStock'],
      })
    }
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

export type MaterialWarehouseProfile = z.infer<typeof MaterialWarehouseProfileSchema>
export type InventoryTransfer = z.infer<typeof InventoryTransferSchema>
export type WarehouseAlert = z.infer<typeof WarehouseAlertSchema>
