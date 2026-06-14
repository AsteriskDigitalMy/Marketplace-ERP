import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  PercentSchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'
import { WorkOrderStatusSchema } from '../common/enums'

export const WorkOrderSchema = z
  .object({
    Id: UuidSchema,
    WorkOrderNumber: NonEmptyStringSchema.max(32),
    ProductCode: NonEmptyStringSchema,
    SalesOrderId: UuidSchema.nullable(),
    SalesOrderNumber: NonEmptyStringSchema.nullable(),
    PlannedQty: z.number().int().positive(),
    CompletedQty: z.number().int().min(0),
    ScrapQty: z.number().int().min(0),
    Status: WorkOrderStatusSchema,
    PlannedStart: DateTimeSchema,
    PlannedEnd: DateTimeSchema,
    LineId: UuidSchema,
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const BaoGongReportSchema = z.object({
  Id: UuidSchema,
  WorkOrderId: UuidSchema,
  ProcessId: UuidSchema,
  ProcessName: NonEmptyStringSchema,
  OperatorId: UuidSchema,
  EquipmentNumber: NonEmptyStringSchema,
  StartTime: DateTimeSchema,
  CompleteTime: DateTimeSchema.nullable(),
  QualifiedQty: z.number().int().min(0),
  UnqualifiedQty: z.number().int().min(0),
  NonConformanceReason: z.string().max(2000).nullable(),
  RemainingReportableQty: z.number().int().min(0),
})

export const IpqcInspectionSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  WorkOrderId: UuidSchema,
  ProcessName: NonEmptyStringSchema,
  SampleSize: z.number().int().positive(),
  DefectCount: z.number().int().min(0),
  Result: z.enum(['pass', 'fail', 'conditional']),
  InspectedAt: DateTimeSchema,
  InspectorId: UuidSchema,
})

export const OqcInspectionSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  WorkOrderId: UuidSchema,
  BatchNumber: NonEmptyStringSchema,
  SampleSize: z.number().int().positive(),
  DefectCount: z.number().int().min(0),
  Result: z.enum(['pass', 'fail', 'hold']),
  InspectedAt: DateTimeSchema,
})

export const ReworkOrderSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  WorkOrderId: UuidSchema,
  ReworkNumber: NonEmptyStringSchema.max(32),
  DefectType: NonEmptyStringSchema,
  Quantity: z.number().int().positive(),
  Status: z.enum(['open', 'in_progress', 'completed']),
})

export const EquipmentSchema = z
  .object({
    Id: UuidSchema,
    EquipmentNumber: NonEmptyStringSchema.max(50),
    EquipmentName: NonEmptyStringSchema.max(200),
    LineId: UuidSchema,
    Status: z.enum(['running', 'idle', 'maintenance', 'fault', 'offline']),
    OeeTargetPct: PercentSchema,
    OeeActualPct: PercentSchema,
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const ToolingRecordSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  ToolCode: NonEmptyStringSchema.max(32),
  ToolName: NonEmptyStringSchema.max(200),
  Status: z.enum(['available', 'in_use', 'maintenance', 'retired']),
  LocationId: UuidSchema.nullable(),
})

export const TeamSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  TeamCode: NonEmptyStringSchema.max(32),
  TeamName: NonEmptyStringSchema.max(200),
  LineId: UuidSchema,
  MemberCount: z.number().int().positive(),
})

export const WageLineSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  OperatorId: UuidSchema,
  OperatorName: NonEmptyStringSchema,
  WorkOrderId: UuidSchema,
  ProcessName: NonEmptyStringSchema,
  PieceCount: z.number().int().min(0),
  Rate: z.number().positive(),
  Amount: z.number().min(0),
  Period: z.string(),
})

export const WorkOrderCostSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  WorkOrderId: UuidSchema,
  MaterialCost: z.number().min(0),
  LaborCost: z.number().min(0),
  OverheadCost: z.number().min(0),
  TotalCost: z.number().min(0),
})

export type WorkOrder = z.infer<typeof WorkOrderSchema>
export type BaoGongReport = z.infer<typeof BaoGongReportSchema>
export type IpqcInspection = z.infer<typeof IpqcInspectionSchema>
export type OqcInspection = z.infer<typeof OqcInspectionSchema>
export type ReworkOrder = z.infer<typeof ReworkOrderSchema>
export type Equipment = z.infer<typeof EquipmentSchema>
export type ToolingRecord = z.infer<typeof ToolingRecordSchema>
export type Team = z.infer<typeof TeamSchema>
export type WageLine = z.infer<typeof WageLineSchema>
export type WorkOrderCost = z.infer<typeof WorkOrderCostSchema>
