import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { DynamicFillingFormFields } from '@/components/pms/data-collection/DynamicFillingFormFields'
import {
  fetchFillingForm,
  fetchKpiThresholds,
  getDueCountdownLabel,
  saveFillingDraft,
  submitFillingForm,
} from '@/services/pms/data-collection/data-collection-service'
import type { FillingFormRecord } from '@/services/pms/data-collection/data-collection-service'
import type { DataFillingForm } from '@/models/pms/data-collection'

export default function DataFillPage() {
  const { taskId = '' } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<FillingFormRecord | null>(null)
  const [fields, setFields] = useState<DataFillingForm['Fields']>([])
  const [threshold, setThreshold] = useState<{
    TargetValue: number
    AlertThreshold: number | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const f = await fetchFillingForm(taskId)
      setForm(f)
      setFields(f.Fields.map((x) => ({ ...x })))
      setThreshold(await fetchKpiThresholds(f.IndicatorId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [taskId])

  const canEdit = form?.Status === 'draft' || form?.Status === 'rejected'

  const updateField = (key: string, value: string | number | null) => {
    setFields((prev) => prev.map((f) => (f.Key === key ? { ...f, Value: value } : f)))
    setDirty(true)
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validateFields = () => {
    const errors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.Required && (field.Value === null || field.Value === '')) {
        errors[field.Key] = 'Required'
      }
      if (field.Type === 'number' && typeof field.Value === 'number') {
        if (field.Min !== null && field.Value < field.Min) {
          errors[field.Key] = `Minimum ${field.Min}`
        }
        if (field.Max !== null && field.Value > field.Max) {
          errors[field.Key] = `Maximum ${field.Max}`
        }
      }
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveDraft = async () => {
    setSubmitting(true)
    try {
      const saved = await saveFillingDraft(taskId, fields)
      setForm(saved)
      setDirty(false)
      toast.success('Draft saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const submit = async () => {
    if (!validateFields()) {
      toast.error('Fix validation errors before submitting')
      return
    }
    setSubmitting(true)
    try {
      const saved = await submitFillingForm(taskId, fields)
      setForm(saved)
      setDirty(false)
      toast.success('Submitted for review — supervisor queue updated (mock)')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const countdown = form ? getDueCountdownLabel(form.DueAt) : null

  return (
    <AsyncState loading={loading} error={error} onRetry={load}>
      {form ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link to="/pms/data-collection/my-tasks" className="hover:underline">
              My filling tasks
            </Link>{' '}
            → {form.IndicatorName}
          </p>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{form.IndicatorName}</CardTitle>
                <Badge variant="outline">{form.PeriodLabel}</Badge>
                {countdown ? <Badge variant={countdown.variant}>{countdown.label}</Badge> : null}
                <Badge>{form.Status.replace(/_/g, ' ')}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {form.Status === 'rejected' && form.RejectionOpinion ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Returned for correction</AlertTitle>
                  <AlertDescription>{form.RejectionOpinion}</AlertDescription>
                </Alert>
              ) : null}

              {form.Status === 'approved' ? (
                <Alert className="mb-4">
                  <AlertDescription>Approved — locked for KPI calculation.</AlertDescription>
                </Alert>
              ) : null}

              {Object.keys(fieldErrors).length > 0 ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Please correct highlighted fields before submitting.
                  </AlertDescription>
                </Alert>
              ) : null}

              <DynamicFillingFormFields
                fields={fields}
                readOnly={!canEdit}
                errors={fieldErrors}
                onChange={updateField}
                thresholdHint={threshold}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              type="button"
              variant="light"
              onClick={() => {
                if (dirty) setDiscardOpen(true)
                else navigate('/pms/data-collection/my-tasks')
              }}
            >
              Back to my tasks
            </Button>
            {canEdit ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting}
                  onClick={() => void saveDraft()}
                >
                  {submitting ? <SubmitSpinner /> : null}
                  Save draft
                </Button>
                <Button type="button" disabled={submitting} onClick={() => void submit()}>
                  Submit for review
                </Button>
              </>
            ) : null}
          </div>

          <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                <AlertDialogDescription>Your draft changes will be lost.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate('/pms/data-collection/my-tasks')}>
                  Discard
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
    </AsyncState>
  )
}
