import { z } from 'zod'

/** UUID v4 string — primary key for all tenant-scoped entities. */
export const UuidSchema = z.string().uuid({ message: 'Must be a valid UUID' })

/** ISO-8601 datetime with offset. */
export const DateTimeSchema = z.string().datetime({ offset: true, message: 'Must be ISO-8601 datetime' })

/** Calendar date (YYYY-MM-DD). */
export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')

/** Non-empty trimmed string. */
export const NonEmptyStringSchema = z.string().trim().min(1, 'Required')

/** Percentage 0–100 inclusive. */
export const PercentSchema = z
  .number()
  .min(0, 'Minimum 0')
  .max(100, 'Maximum 100')

/** Integer percentage 0–100. */
export const PercentIntSchema = z
  .number()
  .int('Must be an integer')
  .min(0)
  .max(100)

/** Positive monetary amount (> 0). */
export const PositiveMoneySchema = z
  .number()
  .positive('Must be greater than 0')
  .multipleOf(0.01, 'Maximum 2 decimal places')

/** Non-negative monetary amount (>= 0). */
export const MoneySchema = z
  .number()
  .min(0)
  .multipleOf(0.01, 'Maximum 2 decimal places')

/** Standard audit columns on mutable entities. */
export const AuditFieldsSchema = z.object({
  CreatedBy: UuidSchema,
  CreatedDatetime: DateTimeSchema,
  ModifiedBy: UuidSchema.nullable(),
  ModifiedDatetime: DateTimeSchema.nullable(),
})

export type AuditFields = z.infer<typeof AuditFieldsSchema>

/** Soft-delete / active flag used across master data. */
export const IsActiveSchema = z.boolean().default(true)

/** Tenant organization scope — all ERP rows are partitioned by org. */
export const TenantScopeSchema = z.object({
  OrganizationId: UuidSchema,
})

export type TenantScope = z.infer<typeof TenantScopeSchema>
