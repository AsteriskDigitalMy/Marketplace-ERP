import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { AppraisalEmployeeRecord } from '@/models/pms/operations'
import {
  fetchAppraisalCycles,
  fetchAppraisalRecords,
  submitSecondaryReview,
} from '@/services/pms/appraisal/appraisal-workflow-service'

export default function AppraisalSecondaryPage() {
  const { hasPermission } = usePmsAuth()
  const [records, setRecords] = useState<AppraisalEmployeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pass, setPass] = useState<boolean | null>(null)
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
      setRecords(all.filter((r) => r.Status === 'hr_processed'))
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

  return (
    <PermissionGate allowed={hasPermission('appraisal.review')}>
      <PageHeader
        title="Secondary Rectification Review"
        description="Confirm HR assistance effectiveness before CFO final review."
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={records.length === 0}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>HR record</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.Id} className="cursor-pointer" onClick={() => setActiveId(row.Id)}>
                  <TableCell>{row.EmployeeName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {row.HrAssistanceSummary}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {active ? (
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">{active.EmployeeName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AppraisalGradeBadge grade={active.ConfirmedGrade ?? active.AutoGrade} />
                <p className="text-sm text-muted-foreground">{active.HrAssistanceSummary}</p>
                {active.LinkedPdcaProposalId ? (
                  <p className="text-xs text-muted-foreground">Linked PDCA: {active.LinkedPdcaProposalId.slice(0, 8)}…</p>
                ) : null}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={pass === true} onChange={() => setPass(true)} />
                    Pass
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={pass === false} onChange={() => setPass(false)} />
                    Fail
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Final opinion</Label>
                  <Textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} />
                </div>
                <Button
                  disabled={pass === null}
                  onClick={() => {
                    void submitSecondaryReview(active.Id, pass!, opinion).then(() => {
                      toast.success(pass ? 'Routed to final review' : 'Returned to HR')
                      setOpinion('')
                      setPass(null)
                      void load()
                      setActiveId(null)
                    })
                  }}
                >
                  Submit review
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
