import type { ZodSchema } from 'zod'
import { z } from 'zod'

export class ModelValidationError extends Error {
  readonly issues: z.ZodIssue[]

  constructor(issues: z.ZodIssue[]) {
    super(issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '))
    this.name = 'ModelValidationError'
    this.issues = issues
  }
}

/** Strict parse — throws ModelValidationError on failure. */
export function parseModel<T>(schema: ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new ModelValidationError(result.error.issues)
  }
  return result.data
}

/** Safe parse — returns discriminated union. */
export function safeParseModel<T>(schema: ZodSchema<T>, input: unknown) {
  return schema.safeParse(input)
}

/** Parse array of items; collects all failures. */
export function parseModelArray<T>(schema: ZodSchema<T>, input: unknown): T[] {
  const arr = z.array(z.unknown()).parse(input)
  const failures: z.ZodIssue[] = []
  const parsed: T[] = []

  arr.forEach((item, index) => {
    const result = schema.safeParse(item)
    if (result.success) {
      parsed.push(result.data)
    } else {
      result.error.issues.forEach((issue) => {
        failures.push({ ...issue, path: [index, ...issue.path] })
      })
    }
  })

  if (failures.length > 0) {
    throw new ModelValidationError(failures)
  }
  return parsed
}
