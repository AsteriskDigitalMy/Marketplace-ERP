import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { FillingRule } from '@/services/pms/data-collection/data-collection-service'

const schema = z.object({
  IndicatorId: z.string().uuid(),
  Cycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual']),
  TargetPositionIds: z.array(z.string()).min(1),
  TemplateId: z.string().uuid(),
  DueOffsetDays: z.number().int().min(0),
  IsActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface FillingRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: FillingRule | null
  indicators: { Id: string; Code: string; Name: string }[]
  templates: { Id: string; Name: string }[]
  positions: { Id: string; Name: string }[]
  onSave: (values: FormValues & { Id?: string }) => Promise<void>
}

export function FillingRuleDialog({
  open,
  onOpenChange,
  initial,
  indicators,
  templates,
  positions,
  onSave,
}: FillingRuleDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      IndicatorId: '',
      Cycle: 'weekly',
      TargetPositionIds: [],
      TemplateId: '',
      DueOffsetDays: 2,
      IsActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        initial
          ? {
              IndicatorId: initial.IndicatorId,
              Cycle: initial.Cycle,
              TargetPositionIds: initial.TargetPositionIds,
              TemplateId: initial.TemplateId,
              DueOffsetDays: initial.DueOffsetDays,
              IsActive: initial.IsActive,
            }
          : {
              IndicatorId: indicators[0]?.Id ?? '',
              Cycle: 'weekly',
              TargetPositionIds: positions[0] ? [positions[0].Id] : [],
              TemplateId: templates[0]?.Id ?? '',
              DueOffsetDays: 2,
              IsActive: true,
            },
      )
    }
  }, [open, initial, indicators, templates, positions, form])

  const selectedPositions = form.watch('TargetPositionIds')

  const togglePosition = (id: string) => {
    const current = form.getValues('TargetPositionIds')
    form.setValue(
      'TargetPositionIds',
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      { shouldValidate: true },
    )
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave({ ...values, Id: initial?.Id })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit filling rule' : 'Add filling rule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Indicator (manual / mixed only)</Label>
            <Select
              value={form.watch('IndicatorId')}
              onValueChange={(v) => form.setValue('IndicatorId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select indicator" />
              </SelectTrigger>
              <SelectContent>
                {indicators.map((i) => (
                  <SelectItem key={i.Id} value={i.Id}>
                    {i.Code} — {i.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cycle</Label>
            <Select
              value={form.watch('Cycle')}
              onValueChange={(v) =>
                form.setValue('Cycle', v as FormValues['Cycle'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['daily', 'weekly', 'monthly', 'quarterly', 'annual'] as const).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Target positions</Label>
            <div className="space-y-2 rounded-md border p-3">
              {positions.map((p) => (
                <label key={p.Id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedPositions.includes(p.Id)}
                    onCheckedChange={() => togglePosition(p.Id)}
                  />
                  {p.Name}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Form template</Label>
            <Select
              value={form.watch('TemplateId')}
              onValueChange={(v) => form.setValue('TemplateId', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.Id} value={t.Id}>
                    {t.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Due offset (days after period start)</Label>
            <Input
              type="number"
              min={0}
              {...form.register('DueOffsetDays', { valueAsNumber: true })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch('IsActive')}
              onCheckedChange={(v) => form.setValue('IsActive', v)}
            />
            <Label>Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="light" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save rule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
