import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AppraisalGradeBadge } from '@/components/pms/appraisal/AppraisalGradeBadge'
import { DisposalLogPanel } from '@/components/pms/alerts/DisposalLogPanel'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { AppraisalEmployeeRecord } from '@/models/pms/operations'
import {
  fetchAppraisalCycles,
  fetchAppraisalRecords,
  submitFinalReview,
} from '@/services/pms/appraisal/appraisal-workflow-service'

export default function AppraisalFinalPage() {
  const { hasPermission } = usePmsAuth()
  const [records, setRecords] = useState<AppraisalEmployeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [approve, setApprove] = useState<boolean | null>(null)
  const [opinion, setOpinion] = useState('')

  const load = async () => {
    try {
      const cycles = await fetchAppraisalCycles()
      const generated = cycles.find((c) => c.Status === 'generated')
      if (!generated) {
        setRecords([])
        return
      }
      const all = await fetchAppraisalRecords(generated.Id)
      setRecords(
        all.filter((r) =>
          ['pending_final_review', 'published', 'returned_auditor'].includes(r.Status),
        ),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const active = records.find((r) => r.Id === activeId)
  const actionable = (r: AppraisalEmployeeRecord) =>
    r.Status === 'pending_final_review' && (r.RoutingSource === 'direct_ab' || r.RoutingSource === 'post_hr')

  const bulkApprove = async () => {
    const targets = records.filter(actionable)
    for (const r of targets) {
      await submitFinalReview(r.Id, true, 'Bulk approved')
    }
    toast.success(`Approved ${targets.length} employees`)
    void load()
  }

  return (
    <PermissionGate allowed={hasPermission('appraisal.final')}>
      <PageHeader
        title="Executive Final Review"
        description="CFO final approval — results publish on approve."
        actions={
          <Button variant="light" size="sm" onClick={() => void bulkApprove()}>
            Bulk approve actionable
          </Button>
        }
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={records.length === 0}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => {
                const canAct = actionable(row)
                return (
                  <TableRow
                    key={row.Id}
                    className={canAct ? 'cursor-pointer hover:bg-muted/50' : 'opacity-60'}
                    onClick={() => canAct && setActiveId(row.Id)}
                  >
                    <TableCell>{row.EmployeeName}</TableCell>
                    <TableCell>
                      <AppraisalGradeBadge grade={row.ConfirmedGrade ?? row.AutoGrade} />
                    </TableCell>
                    <TableCell>
                      {row.RoutingSource === 'direct_ab' ? 'Direct A/B' : 'Post-HR'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.Status.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {active && actionable(active) ? (
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">{active.EmployeeName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Score {active.TotalScore} · {active.Department}
                </p>
                <DisposalLogPanel
                  entries={active.ShuntingLog.map((e) => ({
                    At: e.At,
                    Actor: e.Actor,
                    Action: e.Action,
                    Detail: e.Detail,
                  }))}
                />
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={approve === true} onChange={() => setApprove(true)} />
                    Approve
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={approve === false} onChange={() => setApprove(false)} />
                    Reject
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Opinion</Label>
                  <Textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} />
                </div>
                <Button
                  disabled={approve === null}
                  onClick={() => {
                    void submitFinalReview(active.Id, approve!, opinion).then(() => {
                      toast.success(approve ? 'Published' : 'Returned to auditor')
                      setOpinion('')
                      setApprove(null)
                      void load()
                      setActiveId(null)
                    })
                  }}
                >
                  Submit final review
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
