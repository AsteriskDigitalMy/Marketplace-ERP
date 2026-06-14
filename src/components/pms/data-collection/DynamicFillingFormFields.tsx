import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DataFillingForm } from '@/models/pms/data-collection'

type Field = DataFillingForm['Fields'][number]

interface DynamicFillingFormFieldsProps {
  fields: Field[]
  readOnly?: boolean
  errors?: Record<string, string>
  onChange: (key: string, value: string | number | null) => void
  thresholdHint?: { TargetValue: number; AlertThreshold: number | null } | null
}

export function DynamicFillingFormFields({
  fields,
  readOnly = false,
  errors = {},
  onChange,
  thresholdHint,
}: DynamicFillingFormFieldsProps) {
  return (
    <div className="space-y-4">
      {thresholdHint ? (
        <p className="text-sm text-muted-foreground">
          KPI target: {thresholdHint.TargetValue}
          {thresholdHint.AlertThreshold !== null
            ? ` · Alert threshold: ${thresholdHint.AlertThreshold}`
            : null}
        </p>
      ) : null}
      {fields.map((field) => (
        <div key={field.Key} className="space-y-2">
          <Label htmlFor={field.Key}>
            {field.Label}
            {field.Required ? <span className="text-destructive"> *</span> : null}
          </Label>
          {field.Type === 'number' ? (
            <Input
              id={field.Key}
              type="number"
              min={field.Min ?? undefined}
              max={field.Max ?? undefined}
              disabled={readOnly}
              value={field.Value ?? ''}
              onChange={(e) =>
                onChange(
                  field.Key,
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
            />
          ) : field.Type === 'text' ? (
            <Textarea
              id={field.Key}
              disabled={readOnly}
              value={String(field.Value ?? '')}
              onChange={(e) => onChange(field.Key, e.target.value)}
              rows={3}
            />
          ) : field.Type === 'date' ? (
            <Input
              id={field.Key}
              type="date"
              disabled={readOnly}
              value={String(field.Value ?? '')}
              onChange={(e) => onChange(field.Key, e.target.value)}
            />
          ) : (
            <Select
              disabled={readOnly || !field.Options?.length}
              value={String(field.Value ?? '')}
              onValueChange={(v) => onChange(field.Key, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.Options?.length ? 'Select…' : 'Options unavailable'} />
              </SelectTrigger>
              <SelectContent>
                {field.Options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.Min !== null || field.Max !== null ? (
            <p className="text-xs text-muted-foreground">
              {field.Min !== null ? `Min: ${field.Min}` : ''}
              {field.Min !== null && field.Max !== null ? ' · ' : ''}
              {field.Max !== null ? `Max: ${field.Max}` : ''}
            </p>
          ) : null}
          {errors[field.Key] ? (
            <p className="text-sm text-destructive">{errors[field.Key]}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
