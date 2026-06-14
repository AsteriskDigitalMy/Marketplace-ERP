import { z } from 'zod'
import {
  DateTimeSchema,
  NonEmptyStringSchema,
  UuidSchema,
} from '../common/primitives'

export const DataFillingTaskSchema = z.object({
  Id: UuidSchema,
  OrganizationId: UuidSchema,
  IndicatorId: UuidSchema,
  IndicatorName: NonEmptyStringSchema,
  PeriodLabel: NonEmptyStringSchema,
  DueAt: DateTimeSchema,
  Status: z.enum(['pending', 'submitted', 'overdue', 'approved', 'rejected']),
  AssigneeId: UuidSchema,
  TemplateId: UuidSchema,
})

export const DataFillingFieldSchema = z.object({
  Key: NonEmptyStringSchema,
  Label: NonEmptyStringSchema,
  Type: z.enum(['number', 'text', 'date', 'select']),
  Required: z.boolean(),
  Min: z.number().nullable(),
  Max: z.number().nullable(),
  Options: z.array(z.string()).nullable(),
  Value: z.union([z.string(), z.number()]).nullable(),
})

export const DataFillingFormSchema = z
  .object({
    TaskId: UuidSchema,
    TemplateId: UuidSchema,
    Fields: z.array(DataFillingFieldSchema).min(1),
    Status: z.enum(['draft', 'pending_review', 'approved', 'rejected']),
  })
  .superRefine((data, ctx) => {
    data.Fields.forEach((field, index) => {
      if (!field.Required || field.Value === null) return
      if (field.Type === 'number' && typeof field.Value === 'number') {
        if (field.Min !== null && field.Value < field.Min) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Value below minimum ${field.Min}`,
            path: ['Fields', index, 'Value'],
          })
        }
        if (field.Max !== null && field.Value > field.Max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Value above maximum ${field.Max}`,
            path: ['Fields', index, 'Value'],
          })
        }
      }
      if (field.Required && (field.Value === null || field.Value === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required field cannot be empty',
          path: ['Fields', index, 'Value'],
        })
      }
    })
  })

export const DataReviewSchema = z.object({
  RecordId: UuidSchema,
  TaskId: UuidSchema,
  IndicatorName: NonEmptyStringSchema,
  SubmitterName: NonEmptyStringSchema,
  PeriodLabel: NonEmptyStringSchema,
  ReviewLevel: z.enum(['team', 'department']),
  FilledData: z.record(z.string(), z.union([z.string(), z.number()])),
  Status: z.enum(['pending_review', 'approved', 'rejected']),
  Opinion: z.string().max(4000).nullable(),
  Messages: z.array(
    z.object({
      At: DateTimeSchema,
      Author: NonEmptyStringSchema,
      Text: NonEmptyStringSchema.max(2000),
    }),
  ),
})

export type DataFillingTask = z.infer<typeof DataFillingTaskSchema>
export type DataFillingForm = z.infer<typeof DataFillingFormSchema>
export type DataReview = z.infer<typeof DataReviewSchema>
