import { z } from 'zod'
import {
  AuditFieldsSchema,
  MoneySchema,
  NonEmptyStringSchema,
  PositiveMoneySchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'

export const CustomerSchema = z
  .object({
    Id: UuidSchema,
    CustomerCode: NonEmptyStringSchema.max(32),
    CustomerName: NonEmptyStringSchema.max(200),
    Tier: z.enum(['strategic', 'standard', 'prospect']),
    CreditLimit: MoneySchema,
    PaymentTermsDays: z.number().int().min(0).max(365),
    IsActive: z.boolean(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const SalesOrderLineSchema = z.object({
  LineNumber: z.number().int().positive(),
  StyleNumber: NonEmptyStringSchema,
  ProductStyleId: UuidSchema,
  Quantity: z.number().int().positive(),
  UnitPrice: PositiveMoneySchema,
  RequestedDeliveryDate: z.string().date(),
})

export const SalesOrderSchema = z
  .object({
    Id: UuidSchema,
    OrderNumber: NonEmptyStringSchema.max(32),
    CustomerId: UuidSchema,
    CustomerName: NonEmptyStringSchema,
    Status: z.enum(['draft', 'in_review', 'effective', 'shipped', 'closed', 'cancelled']),
    IsFastTrack: z.boolean(),
    Lines: z.array(SalesOrderLineSchema).min(1),
    TotalAmount: PositiveMoneySchema,
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const SupplierSchema = z
  .object({
    Id: UuidSchema,
    SupplierCode: NonEmptyStringSchema.max(32),
    SupplierName: NonEmptyStringSchema.max(200),
    QualificationStatus: z.enum(['qualified', 'probation', 'suspended']),
    LeadTimeDays: z.number().int().min(0),
    IsActive: z.boolean(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const PurchaseRequisitionSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  ReqNumber: NonEmptyStringSchema.max(32),
  RequestedBy: NonEmptyStringSchema,
  Status: z.enum(['draft', 'submitted', 'approved', 'rejected']),
  MaterialCode: NonEmptyStringSchema,
  Quantity: z.number().positive(),
  NeededBy: z.string().date(),
})

export const PurchaseOrderSchema = z
  .object({
    Id: UuidSchema,
    PoNumber: NonEmptyStringSchema.max(32),
    SupplierId: UuidSchema,
    SupplierName: NonEmptyStringSchema,
    Status: z.enum(['draft', 'approved', 'partial', 'received', 'closed', 'cancelled']),
    TotalAmount: PositiveMoneySchema,
    ExpectedArrivalDate: z.string().date(),
    InboundTaskId: UuidSchema.nullable(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const SchedulePlanSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  PlanNumber: NonEmptyStringSchema.max(32),
  SalesOrderId: UuidSchema,
  OrderNumber: NonEmptyStringSchema,
  Status: z.enum(['draft', 'published', 'in_progress', 'completed']),
  PlannedStart: z.string().date(),
  PlannedEnd: z.string().date(),
  CompletionPct: z.number().min(0).max(100),
})

export const SubcontractOrderSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  OrderNumber: NonEmptyStringSchema.max(32),
  SupplierId: UuidSchema,
  ProcessName: NonEmptyStringSchema,
  Quantity: z.number().int().positive(),
  Status: z.enum(['draft', 'sent', 'in_progress', 'received', 'closed']),
})

export const ImportExportShipmentSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  ShipmentNumber: NonEmptyStringSchema.max(32),
  Direction: z.enum(['import', 'export']),
  Status: z.enum(['draft', 'in_transit', 'cleared', 'delivered']),
  Incoterms: NonEmptyStringSchema,
  Eta: z.string().date(),
})

export type Customer = z.infer<typeof CustomerSchema>
export type SalesOrder = z.infer<typeof SalesOrderSchema>
export type Supplier = z.infer<typeof SupplierSchema>
export type PurchaseRequisition = z.infer<typeof PurchaseRequisitionSchema>
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>
export type SchedulePlan = z.infer<typeof SchedulePlanSchema>
export type SubcontractOrder = z.infer<typeof SubcontractOrderSchema>
export type ImportExportShipment = z.infer<typeof ImportExportShipmentSchema>
