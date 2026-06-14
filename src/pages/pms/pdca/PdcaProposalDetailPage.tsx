import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { PdcaStatusBadge } from '@/components/pms/pdca/PdcaStatusBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { pdcaCategoryLabel } from '@/lib/pms/pdca-helpers'
import type { PdcaProposal } from '@/models/pms/operations'
import { fetchPdcaProposal } from '@/services/pms/pdca/pdca-proposal-service'

const TIMELINE_STEPS: { key: string; label: string; match: PdcaProposal['Status'][] }[] = [
  { key: 'submitted', label: 'Submitted', match: ['pending_evaluation', 'approved', 'rejected', 'in_execution', 'completed'] },
  { key: 'pending', label: 'Pending evaluation', match: ['pending_evaluation', 'approved', 'rejected', 'in_execution', 'completed'] },
  { key: 'decision', label: 'Approved / Rejected', match: ['approved', 'rejected', 'in_execution', 'completed'] },
  { key: 'execution', label: 'In execution', match: ['in_execution', 'completed'] },
  { key: 'completed', label: 'Completed', match: ['completed'] },
]

function stepActive(status: PdcaProposal['Status'], match: PdcaProposal['Status'][]): boolean {
  return match.includes(status)
}

export default function PdcaProposalDetailPage() {
  const { id } = useParams()
  const { userId, hasPermission } = usePmsAuth()
  const [proposal, setProposal] = useState<PdcaProposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!id) return
    setError(null)
    try {
      const data = await fetchPdcaProposal(id)
      if (data.SubmitterId !== userId) {
        setError('You can only view your own proposals')
        setProposal(null)
        return
      }
      setProposal(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load proposal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [id, userId])

  const showExecutionCta =
    proposal && ['approved', 'in_execution', 'completed'].includes(proposal.Status)

  return (
    <PermissionGate allowed={hasPermission('pdca.submit')}>
      <PageHeader
        title={proposal?.Title ?? 'Proposal detail'}
        description="Read-only view with evaluation timeline."
        actions={
          <div className="flex gap-2">
            <Button variant="light" size="sm" onClick={() => void load()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button variant="light" size="sm" asChild>
              <Link to="/pms/pdca/proposals">Back to list</Link>
            </Button>
          </div>
        }
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={!proposal}>
        {proposal ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <PdcaStatusBadge status={proposal.Status} />
              <span className="text-sm text-muted-foreground">
                {pdcaCategoryLabel(proposal.Category)} · Submitted{' '}
                {new Date(proposal.SubmittedAt).toLocaleString()}
              </span>
            </div>

            {proposal.SourceHrRectificationId ? (
              <Alert>
                <AlertDescription>
                  Created from HR rectification.{' '}
                  <Link to="/pms/appraisal/hr" className="font-medium text-primary hover:underline">
                    View HR workspace
                  </Link>
                </AlertDescription>
              </Alert>
            ) : null}

            {showExecutionCta ? (
              <Button asChild>
                <Link to={`/pms/pdca/proposals/${proposal.Id}/execution`}>View execution</Link>
              </Button>
            ) : null}

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">Status timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-wrap gap-4">
                  {TIMELINE_STEPS.map((step) => {
                    const active = stepActive(proposal.Status, step.match)
                    const rejected =
                      step.key === 'decision' && proposal.Status === 'rejected'
                    return (
                      <li
                        key={step.key}
                        className={`flex items-center gap-2 text-sm ${active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                      >
                        <span
                          className={`size-2.5 rounded-full ${active ? (rejected ? 'bg-destructive' : 'bg-primary') : 'bg-border'}`}
                        />
                        {step.key === 'decision' && proposal.Status === 'rejected'
                          ? 'Rejected'
                          : step.label}
                      </li>
                    )
                  })}
                </ol>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">Proposal content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Current problem status</p>
                  <p className="mt-1 whitespace-pre-wrap">{proposal.ProblemStatus}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Improvement scheme</p>
                  <p className="mt-1 whitespace-pre-wrap">{proposal.ImprovementScheme}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Expected results</p>
                  <p className="mt-1 whitespace-pre-wrap">{proposal.ExpectedResults}</p>
                </div>
                {proposal.Attachments.length > 0 ? (
                  <div>
                    <p className="font-medium text-muted-foreground">Attachments</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {proposal.Attachments.map((file) => (
                        <Badge key={file} variant="outline">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {proposal.AuditorComments ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="type-section-title">Auditor comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{proposal.AuditorComments}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
