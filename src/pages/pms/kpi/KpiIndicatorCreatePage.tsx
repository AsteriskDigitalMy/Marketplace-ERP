import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  KpiIndicatorFormFields,
  useDebouncedCodeCheck,
  type KpiIndicatorFormValues,
} from '@/components/pms/kpi/KpiIndicatorFormFields'
import { FormulaEditor } from '@/components/pms/kpi/FormulaEditor'
import {
  checkKpiCodeUnique,
  createKpiIndicator,
  fetchKpiCategories,
  validateKpiFormula,
} from '@/services/pms/kpi/kpi-service'
import { ApiError } from '@/lib/api/errors'
import {
  KpiCycleSchema,
  KpiDataSourceSchema,
  KpiEvaluationObjectSchema,
} from '@/models/common/enums'

const schema = z
  .object({
    Code: z
      .string()
      .regex(/^[A-Z0-9_]{3,32}$/, 'Code must be 3–32 uppercase letters, numbers, or underscores'),
    Name: z.string().trim().min(1, 'Name is required').max(128),
    Category: z.string().min(1, 'Category is required'),
    StatisticalScope: z.string().trim().min(1, 'Statistical scope is required').max(500),
    Formula: z.string().trim().min(1, 'Formula is required'),
    TargetValue: z.number().positive('Target must be > 0'),
    ChallengeValue: z.number().positive().nullable(),
    BaselineValue: z.number().nullable(),
    Cycle: KpiCycleSchema,
    EvaluationObject: KpiEvaluationObjectSchema,
    DataSource: KpiDataSourceSchema,
    WeightPct: z.number().min(0).max(100).nullable(),
    AlertThreshold: z.number().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.ChallengeValue !== null && data.ChallengeValue <= data.TargetValue) {
      ctx.addIssue({
        code: 'custom',
        message: 'Challenge value must be greater than target',
        path: ['ChallengeValue'],
      })
    }
  })

export default function KpiIndicatorCreatePage() {
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [categories, setCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formulaSheetOpen, setFormulaSheetOpen] = useState(false)
  const [formulaValidated, setFormulaValidated] = useState(false)
  const [validatingFormula, setValidatingFormula] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [pendingNavigate, setPendingNavigate] = useState<string | null>(null)

  const form = useForm<KpiIndicatorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      Code: '',
      Name: '',
      Category: '',
      StatisticalScope: '',
      Formula: '',
      TargetValue: 0,
      ChallengeValue: null,
      BaselineValue: null,
      Cycle: 'monthly',
      EvaluationObject: 'department',
      DataSource: 'auto',
      WeightPct: null,
      AlertThreshold: null,
    },
  })

  const code = form.watch('Code')
  const codeCheckState = useDebouncedCodeCheck(code, undefined, checkKpiCodeUnique)

  useEffect(() => {
    void fetchKpiCategories()
      .then((cats) => {
        setCategories(cats)
        if (cats[0]) {
          form.setValue('Category', cats[0])
        }
      })
      .finally(() => setLoadingCategories(false))
  }, [form])

  useEffect(() => {
    setFormulaValidated(false)
  }, [form.watch('Formula')])

  const handleSimulate = async () => {
    const formula = form.getValues('Formula')
    if (!formula.trim()) {
      toast.error('Enter a formula first')
      return
    }
    setValidatingFormula(true)
    try {
      const result = await validateKpiFormula(formula, code)
      if (result.IsValid) {
        setFormulaValidated(true)
        toast.success(`Simulation passed — result: ${result.SimulatedResult}`)
      } else {
        setFormulaValidated(false)
        toast.error(result.Errors[0] ?? 'Formula validation failed')
      }
    } finally {
      setValidatingFormula(false)
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (codeCheckState === 'duplicate') {
      form.setError('Code', { message: 'Indicator code already exists' })
      return
    }
    if (!formulaValidated) {
      toast.error('Run Simulate & Validate before saving')
      return
    }
    setSubmitting(true)
    try {
      const indicator = await createKpiIndicator(values)
      toast.success('Indicator created — Version V1.0')
      navigate(`/pms/kpi/indicators/${indicator.Id}`)
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.Code) {
        form.setError('Code', { message: String(err.fieldErrors.Code) })
      } else {
        toast.error(err instanceof Error ? err.message : 'Create failed')
      }
    } finally {
      setSubmitting(false)
    }
  })

  const handleCancel = () => {
    if (form.formState.isDirty) {
      setPendingNavigate('/pms/kpi/indicators')
      setDiscardOpen(true)
    } else {
      navigate('/pms/kpi/indicators')
    }
  }

  const canSave =
    formulaValidated &&
    codeCheckState !== 'duplicate' &&
    codeCheckState !== 'checking' &&
    !submitting

  return (
    <PermissionGate allowed={hasPermission('kpi.manage')}>
      <PageHeader
        title="New KPI Indicator"
        description="KPI Library → New Indicator"
        actions={
          <Button type="button" variant="light" size="sm" onClick={handleCancel}>
            Back to library
          </Button>
        }
      />

      {loadingCategories ? (
        <p className="text-sm text-muted-foreground">Loading categories…</p>
      ) : categories.length === 0 ? (
        <Alert>
          <AlertDescription>
            No KPI categories configured.{' '}
            <Link to="/pms/admin/dictionaries" className="underline">
              Maintain dictionaries
            </Link>{' '}
            first.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Indicator attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <KpiIndicatorFormFields
                form={form}
                categories={categories}
                codeCheckState={codeCheckState}
                onOpenFormulaEditor={() => setFormulaSheetOpen(true)}
              />

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button type="button" variant="light" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleSimulate()}
                  disabled={validatingFormula || !form.watch('Formula').trim()}
                >
                  {validatingFormula ? <SubmitSpinner /> : null}
                  Simulate &amp; Validate
                </Button>
                <Button type="submit" disabled={!canSave}>
                  {submitting ? <SubmitSpinner /> : null}
                  Save indicator
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      <Sheet open={formulaSheetOpen} onOpenChange={setFormulaSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Formula editor</SheetTitle>
            <SheetDescription>Build and validate the calculation formula.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FormulaEditor
              initialExpression={form.watch('Formula')}
              selfCode={code}
              onApply={(expr) => {
                form.setValue('Formula', expr, { shouldDirty: true })
                setFormulaSheetOpen(false)
                setFormulaValidated(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingNavigate) {
                  navigate(pendingNavigate)
                }
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
