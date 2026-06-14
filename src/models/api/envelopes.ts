import { z } from 'zod'

export const ApiStatusCodeSchema = z.enum(['OK', 'ERROR'])

export const PagedListSchema = <T extends z.ZodTypeAny>(recordSchema: T) =>
  z.object({
    Records: z.array(recordSchema),
    TotalCount: z.number().int().min(0),
  })

export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    StatusCode: ApiStatusCodeSchema,
    ErrorMessage: z.string().nullable(),
    DetailErrorMessage: z.string().nullable(),
    Data: dataSchema.nullable(),
    StackTrace: z.string().nullable(),
  })

export type PagedList<T> = {
  Records: T[]
  TotalCount: number
}

export type APIResponse<T> = {
  StatusCode: 'OK' | 'ERROR'
  ErrorMessage: string | null
  DetailErrorMessage: string | null
  Data: T | null
  StackTrace: string | null
}
