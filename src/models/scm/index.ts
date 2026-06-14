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
  Quantity: z.number().int().positive(),
  UnitPrice: PositiveMoneySchema,
  RequestedDeliveryDate: z.string().date(),
})

export const SalesOrderSchema = z
  .object({
    Id: UuidSchema,
    OrderNumber: NonEmptyStringSchema.max(32),
    CustomerId: UuidSchema,
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

export const PurchaseOrderSchema = z
  .object({
    Id: UuidSchema,
    PoNumber: NonEmptyStringSchema.max(32),
    SupplierId: UuidSchema,
    Status: z.enum(['draft', 'approved', 'partial', 'received', 'closed', 'cancelled']),
    TotalAmount: PositiveMoneySchema,
    ExpectedArrivalDate: z.string().date(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export type Customer = z.infer<typeof CustomerSchema>
export type SalesOrder = z.infer<typeof SalesOrderSchema>
export type Supplier = z.infer<typeof SupplierSchema>
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>
