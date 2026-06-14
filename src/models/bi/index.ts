import { z } from 'zod'
import { DateTimeSchema, NonEmptyStringSchema, UuidSchema } from '../common/primitives'
import { TrafficLightColorSchema } from '../common/enums'

export const BiKpiCardSchema = z.object({
  Id: UuidSchema,
  Label: NonEmptyStringSchema,
  Value: z.number(),
  Unit: z.string(),
  StatusColor: TrafficLightColorSchema,
  TrendPct: z.number().nullable(),
})

export const BiChartSeriesSchema = z.object({
  Label: NonEmptyStringSchema,
  Value: z.number(),
})

export const BiDashboardPayloadSchema = z.object({
  DashboardId: UuidSchema,
  Title: NonEmptyStringSchema,
  LastRefreshedAt: DateTimeSchema,
  Filters: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  KpiCards: z.array(BiKpiCardSchema),
  Charts: z.array(
    z.object({
      Id: UuidSchema,
      Title: NonEmptyStringSchema,
      Type: z.enum(['bar', 'line', 'donut', 'bullet', 'treemap', 'box']),
      Series: z.array(BiChartSeriesSchema),
    }),
  ),
})

export type BiDashboardPayload = z.infer<typeof BiDashboardPayloadSchema>
export type BiKpiCard = z.infer<typeof BiKpiCardSchema>
