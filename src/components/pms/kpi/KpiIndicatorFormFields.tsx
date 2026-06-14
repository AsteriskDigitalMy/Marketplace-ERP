import { useEffect, useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { UseFormReturn } from 'react-hook-form'
import type { KpiIndicator } from '@/models/pms/kpi'

export interface KpiIndicatorFormValues {
  Code: string
  Name: string
  Category: string
  StatisticalScope: string
  Formula: string
  TargetValue: number
  ChallengeValue: number | null
  BaselineValue: number | null
  Cycle: KpiIndicator['Cycle']
  EvaluationObject: KpiIndicator['EvaluationObject']
  DataSource: KpiIndicator['DataSource']
  WeightPct: number | null
  AlertThreshold: number | null
}

interface KpiIndicatorFormFieldsProps {
  form: UseFormReturn<KpiIndicatorFormValues>
  categories: string[]
  codeCheckState?: 'idle' | 'checking' | 'unique' | 'duplicate' | 'error'
  isCoreLocked?: boolean
  readOnly?: boolean
  onOpenFormulaEditor?: () => void
}

export function KpiIndicatorFormFields({
  form,
  categories,
  codeCheckState = 'idle',
  isCoreLocked = false,
  readOnly = false,
  onOpenFormulaEditor,
}: KpiIndicatorFormFieldsProps) {
  const dataSource = form.watch('DataSource')
  const codeLocked = isCoreLocked || readOnly

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2 lg:col-span-1">
        <Label htmlFor="code" className="flex items-center gap-1">
          Indicator code
          {isCoreLocked ? <Lock className="size-3 text-muted-foreground" /> : null}
        </Label>
        <div className="relative">
          <Input
            id="code"
            disabled={codeLocked}
            maxLength={32}
            placeholder="LEATHER_YIELD_RATE"
            {...form.register('Code', {
              onChange: (e) => {
                form.setValue('Code', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
              },
            })}
          />
          {codeCheckState === 'checking' ? (
            <Loader2 className="absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        {form.formState.errors.Code ? (
          <p className="text-sm text-destructive">{form.formState.errors.Code.message}</p>
        ) : codeCheckState === 'duplicate' ? (
          <p className="text-sm text-destructive">Indicator code already exists</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Indicator name</Label>
        <Input id="name" disabled={readOnly} maxLength={128} {...form.register('Name')} />
        {form.formState.errors.Name ? (
          <p className="text-sm text-destructive">{form.formState.errors.Name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          Business category
          {isCoreLocked ? (
            <Tooltip>
              <TooltipTrigger>
                <Lock className="size-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Core industry KPI — field locked</TooltipContent>
            </Tooltip>
          ) : null}
        </Label>
        <Select
          disabled={isCoreLocked || readOnly}
          value={form.watch('Category')}
          onValueChange={(v) => form.setValue('Category', v, { shouldDirty: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="scope">Statistical scope / method</Label>
        <Textarea
          id="scope"
          disabled={readOnly}
          maxLength={500}
          rows={3}
          {...form.register('StatisticalScope')}
        />
      </div>

      <div className="space-y-2 lg:col-span-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1">
            Calculation formula
            {isCoreLocked ? <Lock className="size-3 text-muted-foreground" /> : null}
          </Label>
          {!readOnly && onOpenFormulaEditor ? (
            <Button type="button" variant="link" size="sm" onClick={onOpenFormulaEditor}>
              Open formula editor
            </Button>
          ) : null}
        </div>
        <Textarea
          disabled={isCoreLocked || readOnly}
          className="font-mono text-sm"
          rows={4}
          {...form.register('Formula')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target">Target value</Label>
        <Input
          id="target"
          type="number"
          step="0.01"
          disabled={readOnly}
          {...form.register('TargetValue', { valueAsNumber: true })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="challenge">Challenge value</Label>
        <Input
          id="challenge"
          type="number"
          step="0.01"
          disabled={readOnly}
          {...form.register('ChallengeValue', {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="baseline">Baseline value</Label>
        <Input
          id="baseline"
          type="number"
          step="0.01"
          disabled={readOnly}
          {...form.register('BaselineValue', {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
        />
      </div>

      <div className="space-y-2">
        <Label>Statistical cycle</Label>
        <Select
          disabled={readOnly}
          value={form.watch('Cycle')}
          onValueChange={(v) => form.setValue('Cycle', v as KpiIndicator['Cycle'])}
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
        <Label>Evaluation object</Label>
        <RadioGroup
          disabled={readOnly}
          value={form.watch('EvaluationObject')}
          onValueChange={(v) =>
            form.setValue('EvaluationObject', v as KpiIndicator['EvaluationObject'])
          }
          className="flex flex-wrap gap-4"
        >
          {(['department', 'individual', 'project'] as const).map((obj) => (
            <div key={obj} className="flex items-center gap-2">
              <RadioGroupItem value={obj} id={`obj-${obj}`} />
              <Label htmlFor={`obj-${obj}`} className="font-normal capitalize">
                {obj}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Data source</Label>
        <Select
          disabled={readOnly}
          value={form.watch('DataSource')}
          onValueChange={(v) => form.setValue('DataSource', v as KpiIndicator['DataSource'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Automatic</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
        {dataSource === 'manual' || dataSource === 'mixed' ? (
          <Alert>
            <AlertDescription>
              Manual or mixed sources will generate periodic filling tasks for data collection staff.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Evaluation weight %</Label>
        <Input
          id="weight"
          type="number"
          min={0}
          max={100}
          disabled={readOnly}
          {...form.register('WeightPct', {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="threshold">Anomaly alert threshold</Label>
        <Input
          id="threshold"
          type="number"
          step="0.01"
          disabled={readOnly}
          {...form.register('AlertThreshold', {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
        />
      </div>
    </div>
  )
}

export function useDebouncedCodeCheck(
  code: string,
  excludeId: string | undefined,
  checkFn: (code: string, excludeId?: string) => Promise<boolean>,
): 'idle' | 'checking' | 'unique' | 'duplicate' | 'error' {
  const [state, setState] = useState<'idle' | 'checking' | 'unique' | 'duplicate' | 'error'>('idle')

  useEffect(() => {
    if (!code || code.length < 3) {
      setState('idle')
      return
    }
    if (!/^[A-Z0-9_]{3,32}$/.test(code)) {
      setState('idle')
      return
    }
    setState('checking')
    const timer = window.setTimeout(() => {
      checkFn(code, excludeId)
        .then((unique) => setState(unique ? 'unique' : 'duplicate'))
        .catch(() => setState('error'))
    }, 400)
    return () => window.clearTimeout(timer)
  }, [code, excludeId, checkFn])

  return state
}
