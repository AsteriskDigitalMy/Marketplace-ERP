import { z } from 'zod'
import {
  AuditFieldsSchema,
  DateTimeSchema,
  NonEmptyStringSchema,
  TenantScopeSchema,
  UuidSchema,
} from '../common/primitives'
import { AccountStatusSchema, ButtonPermissionSchema, DataScopeSchema } from '../common/enums'

export const SystemRoleSchema = z
  .object({
    Id: UuidSchema,
    Name: NonEmptyStringSchema.max(100),
    Remarks: z.string().max(500).nullable(),
    MenuPermissions: z.array(NonEmptyStringSchema).min(1, 'At least one menu permission required'),
    ButtonPermissions: z.record(z.string(), z.array(ButtonPermissionSchema)),
    DataScope: DataScopeSchema,
    CustomFilter: z.string().max(2000).nullable(),
    BoundUserCount: z.number().int().min(0).default(0),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)
  .superRefine((data, ctx) => {
    if (data.DataScope === 'custom' && !data.CustomFilter?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom data scope requires filter conditions',
        path: ['CustomFilter'],
      })
    }
  })

export const UserAccountSchema = z
  .object({
    Id: UuidSchema,
    LoginAccount: NonEmptyStringSchema.max(100),
    EmployeeId: NonEmptyStringSchema.max(50),
    EmployeeName: NonEmptyStringSchema.max(200),
    DepartmentId: UuidSchema,
    Position: NonEmptyStringSchema.max(100),
    Status: AccountStatusSchema,
    RoleIds: z.array(UuidSchema).min(1, 'At least one role must be bound'),
    LastLoginAt: DateTimeSchema.nullable(),
  })
  .merge(TenantScopeSchema)
  .merge(AuditFieldsSchema)

export const UserAccountCreateRequestSchema = z.object({
  OrganizationId: UuidSchema,
  EmployeeName: NonEmptyStringSchema.max(200),
  EmployeeId: NonEmptyStringSchema.max(50),
  DepartmentId: UuidSchema,
  Position: NonEmptyStringSchema.max(100),
  InitialPassword: z.string().min(8, 'Password must be at least 8 characters'),
  RoleIds: z.array(UuidSchema).min(1),
  CreatedBy: UuidSchema,
})

export const UserRoleBindingSchema = z.object({
  UserId: UuidSchema,
  EmployeeName: NonEmptyStringSchema,
  RoleIds: z.array(UuidSchema).min(1),
  RoleNames: z.array(NonEmptyStringSchema),
  ChangedAt: DateTimeSchema,
  ChangedBy: UuidSchema,
})

export type SystemRole = z.infer<typeof SystemRoleSchema>
export type UserAccount = z.infer<typeof UserAccountSchema>
export type UserAccountCreateRequest = z.infer<typeof UserAccountCreateRequestSchema>
export type UserRoleBinding = z.infer<typeof UserRoleBindingSchema>
