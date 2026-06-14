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
  .superRefine((data, ctx) => {
    if (data.CompletedQty + data.ScrapQty > data.PlannedQty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Completed + scrap cannot exceed planned quantity',
        path: ['CompletedQty'],
      })
    }
  })

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
}).superRefine((data, ctx) => {
  if (data.UnqualifiedQty > 0 && !data.NonConformanceReason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Non-conformance reason required when unqualified qty > 0',
      path: ['NonConformanceReason'],
    })
  }
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

export const EquipmentSchema = z
  .object({
    Id: UuidSchema,
    EquipmentNumber: NonEmptyStringSchema.max(50),
    EquipmentName: NonEmptyStringSchema.max(200),
    LineId: UuidSchema,
    Status: z.enum(['running', 'idle', 'maintenance', 'fault', 'offline']),
    OeeTargetPct: PercentSchema,
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export type WorkOrder = z.infer<typeof WorkOrderSchema>
export type BaoGongReport = z.infer<typeof BaoGongReportSchema>
export type IpqcInspection = z.infer<typeof IpqcInspectionSchema>
export type Equipment = z.infer<typeof EquipmentSchema>
