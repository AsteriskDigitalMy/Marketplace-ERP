import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchDataReview,
  fetchKpiThresholds,
  sendReviewMessage,
  submitDataReviewDecision,
} from '@/services/pms/data-collection/data-collection-service'
import type { DataReviewRecord } from '@/services/pms/data-collection/data-collection-service'

export default function DataReviewDetailPage() {
  const { recordId = '' } = useParams()
  const { hasPermission, displayName } = usePmsAuth()
  const [review, setReview] = useState<DataReviewRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decision, setDecision] = useState<'pass' | 'reject'>('pass')
  const [opinion, setOpinion] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [threshold, setThreshold] = useState<{
    TargetValue: number
    AlertThreshold: number | null
  } | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetchDataReview(recordId)
      setReview(r)
      setThreshold(await fetchKpiThresholds(r.IndicatorId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [recordId])

  const submitDecision = async () => {
    setSubmitting(true)
    try {
      const updated = await submitDataReviewDecision(recordId, decision, opinion, displayName)
      setReview(updated)
      if (decision === 'reject') {
        toast.error('Rejected — filler notified (mock)')
      } else if (updated.ReviewLevel === 'department' && updated.Status === 'pending_review') {
        toast.success('Team approval recorded — forwarded to department queue')
      } else {
        toast.success('Approved — locked for KPI calculation')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Decision failed')
    } finally {
      setSubmitting(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    const updated = await sendReviewMessage(recordId, displayName, message)
    setReview(updated)
    setMessage('')
    toast.success('Message sent')
  }

  const finalized = review?.Status === 'approved' || review?.Status === 'rejected'

  return (
    <PermissionGate allowed={hasPermission('data.review')}>
      <AsyncState loading={loading} error={error} onRetry={load}>
        {review ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <PageHeader
                title={review.IndicatorName}
                description={`${review.SubmitterName} · ${review.PeriodLabel} · ${review.ReviewLevel} level`}
                actions={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/pms/data-collection/reviews">Back to queue</Link>
                  </Button>
                }
              />

              {review.Status === 'approved' ? (
                <Badge className="gap-1">
                  <Lock className="size-3" />
                  Locked for KPI calculation
                </Badge>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Filled data</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(review.FilledData).map(([key, value]) => (
                      <div key={key} className="rounded border p-2 text-sm">
                        <dt className="text-muted-foreground">{key}</dt>
                        <dd className="font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Validation vs KPI thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {threshold ? (
                    <p className="text-muted-foreground">
                      Target: {threshold.TargetValue}
                      {threshold.AlertThreshold !== null
                        ? ` · Alert: ${threshold.AlertThreshold}`
                        : ''}
                    </p>
                  ) : null}
                  {Object.entries(review.FilledData).map(([key, value]) => {
                    const ok =
                      typeof value === 'number' && threshold
                        ? value <= (threshold.AlertThreshold ?? threshold.TargetValue * 1.1)
                        : true
                    return (
                      <div key={key} className="flex items-center gap-2">
                        {ok ? (
                          <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-destructive" />
                        )}
                        <span>
                          {key}: {String(value)}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-48 rounded border p-3">
                    <div className="space-y-3">
                      {review.Messages.map((m, i) => (
                        <div key={i} className="text-sm">
                          <p className="font-medium">
                            {m.Author}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                              {new Date(m.At).toLocaleString()}
                            </span>
                          </p>
                          <p>{m.Text}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {!finalized ? (
                    <div className="flex gap-2">
                      <Textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask a question or add a note…"
                      />
                      <Button type="button" onClick={() => void sendMessage()}>
                        Send
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div>
              {!finalized ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-base">Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {review.PriorReviewer ? (
                      <p className="text-sm text-muted-foreground">
                        Prior: {review.PriorReviewer} — {review.PriorOpinion}
                      </p>
                    ) : null}
                    <RadioGroup
                      value={decision}
                      onValueChange={(v) => setDecision(v as 'pass' | 'reject')}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="pass" id="pass" />
                        <Label htmlFor="pass">Pass</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="reject" id="reject" />
                        <Label htmlFor="reject">Reject</Label>
                      </div>
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label>
                        Opinion {decision === 'reject' ? '(required)' : '(optional)'}
                      </Label>
                      <Textarea rows={4} value={opinion} onChange={(e) => setOpinion(e.target.value)} />
                    </div>
                    <Button disabled={submitting} onClick={() => void submitDecision()}>
                      {submitting ? <SubmitSpinner /> : null}
                      Submit decision
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-sm">
                    <p className="font-medium capitalize">{review.Status.replace(/_/g, ' ')}</p>
                    {review.Opinion ? <p className="mt-2 text-muted-foreground">{review.Opinion}</p> : null}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
