import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AlertDeadlineBadge } from '@/components/pms/alerts/AlertDeadlineBadge'
import { AlertLevelBadge } from '@/components/pms/alerts/AlertLevelBadge'
import { AlertStatusStepper } from '@/components/pms/alerts/AlertStatusStepper'
import { DisposalLogPanel } from '@/components/pms/alerts/DisposalLogPanel'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { alertTypeLabel } from '@/lib/pms/alert-helpers'
import type { AlertRecord } from '@/models/pms/operations'
import {
  canVerifyAlert,
  effectiveLevel,
  fetchAlertRecord,
  isAlertOwner,
  saveRootCauseDraft,
  submitRectification,
  submitRootCause,
  submitVerification,
} from '@/services/pms/alerts/alert-record-service'

export default function AlertDisposalPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userId, hasPermission } = usePmsAuth()
  const [record, setRecord] = useState<AlertRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [cause, setCause] = useState('')
  const [impactScope, setImpactScope] = useState('')
  const [measures, setMeasures] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [newFile, setNewFile] = useState('')
  const [verifyPass, setVerifyPass] = useState<boolean | null>(null)
  const [verifyOpinion, setVerifyOpinion] = useState('')

  const load = async () => {
    if (!id) return
    setError(null)
    try {
      const data = await fetchAlertRecord(id)
      setRecord(data)
      setCause(data.Cause ?? '')
      setImpactScope(data.ImpactScope ?? '')
      setMeasures(data.RectificationMeasures ?? '')
      setPlannedDate(
        data.PlannedCompletionDate
          ? new Date(data.PlannedCompletionDate).toISOString().slice(0, 10)
          : '',
      )
      setAttachments(data.Attachments)
      setVerifyOpinion(data.VerificationOpinion ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load alert')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const isOwner = record ? isAlertOwner(record, userId) : false
  const canVerify = canVerifyAlert(userId, hasPermission('alerts.manage'))
  const isClosed = record?.Status === 'closed'

  const showStep1 =
    record &&
    (isClosed ||
      isOwner ||
      record.Cause) &&
    ['open', 'investigating', 'rectifying', 'pending_verification', 'closed'].includes(record.Status)
  const step1Editable = record && isOwner && ['open', 'investigating'].includes(record.Status)

  const showStep2 =
    record &&
    ['rectifying', 'pending_verification', 'closed'].includes(record.Status)
  const step2Editable = record && isOwner && record.Status === 'rectifying'

  const showStep3 = record && canVerify && record.Status === 'pending_verification'
  const waitingVerification =
    record && isOwner && record.Status === 'pending_verification' && !canVerify

  const addMockFile = () => {
    if (!newFile.trim()) return
    setAttachments((prev) => [...prev, newFile.trim()])
    setNewFile('')
  }

  return (
    <PermissionGate allowed={hasPermission('alerts.view')} backHref="/pms/alerts" backLabel="Back to inbox">
      <PageHeader
        title="Alert disposal"
        description="Root cause, rectification, and management verification workflow."
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()}>
        {record ? (
          <div className="space-y-6">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="type-card-title">{record.MonitoredObjectLabel}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {alertTypeLabel(record.Type)} ·{' '}
                      <Link
                        to={`/pms/alerts/rules/${record.RuleId}/edit`}
                        className="text-primary hover:underline"
                      >
                        {record.RuleName}
                      </Link>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertLevelBadge level={effectiveLevel(record)} />
                    <AlertDeadlineBadge
                      deadlineAt={record.DeadlineAt}
                      isClosed={isClosed}
                    />
                  </div>
                </div>
                <AlertStatusStepper status={record.Status} />
              </CardHeader>
              {record.EscalationHistory.length > 0 ? (
                <CardContent className="border-t pt-4">
                  {record.EscalationHistory.map((e, i) => (
                    <Alert key={i} variant="default" className="mb-2 border-amber-500/40 bg-amber-500/5">
                      <AlertTitle>Auto-escalated to {e.ToLevel}</AlertTitle>
                      <AlertDescription>
                        {new Date(e.At).toLocaleString()} — {e.Reason}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              ) : null}
            </Card>

            {isClosed ? (
              <Alert className="border-emerald-500/40 bg-emerald-500/5">
                <AlertTitle>Alert closed</AlertTitle>
                <AlertDescription>
                  This disposal workflow is complete. All steps are read-only.
                </AlertDescription>
              </Alert>
            ) : null}

            {waitingVerification ? (
              <Alert>
                <AlertTitle>Awaiting manager verification</AlertTitle>
                <AlertDescription>
                  Your rectification plan has been submitted. A manager will review shortly.
                </AlertDescription>
              </Alert>
            ) : null}

            {showStep1 ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="type-section-title">Step 1 — Root cause</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cause">Problem cause</Label>
                    <Textarea
                      id="cause"
                      value={cause}
                      disabled={!step1Editable}
                      onChange={(e) => setCause(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="impact">Impact scope (optional)</Label>
                    <Textarea
                      id="impact"
                      value={impactScope}
                      disabled={!step1Editable}
                      onChange={(e) => setImpactScope(e.target.value)}
                    />
                  </div>
                  {step1Editable ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="light"
                        disabled={submitting}
                        onClick={() => {
                          if (!id) return
                          setSubmitting(true)
                          void saveRootCauseDraft(id, cause, impactScope)
                            .then(() => {
                              toast.success('Draft saved')
                              void load()
                            })
                            .catch((e) => toast.error(e.message))
                            .finally(() => setSubmitting(false))
                        }}
                      >
                        Save draft
                      </Button>
                      <Button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          if (!id) return
                          setSubmitting(true)
                          void submitRootCause(id, cause, impactScope)
                            .then(() => {
                              toast.success('Root cause submitted')
                              void load()
                            })
                            .catch((e) => toast.error(e.message))
                            .finally(() => setSubmitting(false))
                        }}
                      >
                        Submit
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {showStep2 ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="type-section-title">Step 2 — Rectification plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="measures">Disposal / rectification measures</Label>
                    <Textarea
                      id="measures"
                      value={measures}
                      disabled={!step2Editable}
                      onChange={(e) => setMeasures(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planned">Planned completion date</Label>
                    <Input
                      id="planned"
                      type="date"
                      value={plannedDate}
                      disabled={!step2Editable}
                      onChange={(e) => setPlannedDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attachments (mock)</Label>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {attachments.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    {step2Editable ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="file-name.pdf"
                          value={newFile}
                          onChange={(e) => setNewFile(e.target.value)}
                        />
                        <Button type="button" variant="light" onClick={addMockFile}>
                          Add file
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  {step2Editable ? (
                    <Button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        if (!id) return
                        setSubmitting(true)
                        void submitRectification(id, measures, plannedDate, attachments)
                          .then(() => {
                            toast.success('Submitted for verification')
                            void load()
                          })
                          .catch((e) => toast.error(e.message))
                          .finally(() => setSubmitting(false))
                      }}
                    >
                      Submit for confirmation
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {showStep3 ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="type-section-title">Step 3 — Management verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="verify"
                        checked={verifyPass === true}
                        onChange={() => setVerifyPass(true)}
                      />
                      Pass
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="verify"
                        checked={verifyPass === false}
                        onChange={() => setVerifyPass(false)}
                      />
                      Fail
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opinion">Verification opinion</Label>
                    <Textarea
                      id="opinion"
                      value={verifyOpinion}
                      onChange={(e) => setVerifyOpinion(e.target.value)}
                      placeholder={verifyPass === false ? 'Required when failing' : 'Optional'}
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={submitting || verifyPass === null}
                    onClick={() => {
                      if (!id || verifyPass === null) return
                      setSubmitting(true)
                      void submitVerification(id, verifyPass, verifyOpinion)
                        .then(() => {
                          toast.success(verifyPass ? 'Alert closed' : 'Returned to owner')
                          void load()
                        })
                        .catch((e) => toast.error(e.message))
                        .finally(() => setSubmitting(false))
                    }}
                  >
                    Submit verification
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">Disposal log</CardTitle>
              </CardHeader>
              <CardContent>
                <DisposalLogPanel entries={record.DisposalLog} />
              </CardContent>
            </Card>

            <Button variant="light" onClick={() => navigate('/pms/alerts')}>
              Back to inbox
            </Button>
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
