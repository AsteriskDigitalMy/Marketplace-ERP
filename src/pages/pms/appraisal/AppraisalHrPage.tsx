import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  submitHrRectification,
} from '@/services/pms/appraisal/appraisal-workflow-service'

export default function AppraisalHrPage() {
  const { hasPermission, userId, displayName } = usePmsAuth()
  const [records, setRecords] = useState<AppraisalEmployeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [assistanceType, setAssistanceType] = useState('coaching')
  const [summary, setSummary] = useState('')
  const [createPdca, setCreatePdca] = useState(false)

  const [createdProposalId, setCreatedProposalId] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const cycles = await fetchAppraisalCycles()
      const generated = cycles.find((c) => c.Status === 'generated')
      if (!generated) {
        setRecords([])
        return
      }
      const all = await fetchAppraisalRecords(generated.Id)
      setRecords(all.filter((r) => ['pending_hr', 're_rectification'].includes(r.Status)))
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
    <PermissionGate allowed={hasPermission('appraisal.hr')}>
      <PageHeader
        title="HR Performance Rectification"
        description="Assist low-performance employees and optionally generate PDCA proposals."
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={records.length === 0}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((row) => (
                  <TableRow
                    key={row.Id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setActiveId(row.Id)}
                  >
                    <TableCell>
                      <div className="font-medium">{row.EmployeeName}</div>
                      <div className="text-xs text-muted-foreground">{row.Department}</div>
                    </TableCell>
                    <TableCell>
                      <AppraisalGradeBadge grade={row.ConfirmedGrade ?? row.AutoGrade} />
                    </TableCell>
                    <TableCell>{row.Status.replace(/_/g, ' ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {active ? (
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">{active.EmployeeName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Performance shortfall: score {active.TotalScore}, grade{' '}
                  {active.ConfirmedGrade ?? active.AutoGrade}. {active.ReviewOpinion}
                </p>
                <div className="space-y-2">
                  <Label>Assistance type</Label>
                  <Select value={assistanceType} onValueChange={setAssistanceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="training">Skills training</SelectItem>
                      <SelectItem value="guidance">Job guidance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assistance record</Label>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={createPdca} onCheckedChange={(c) => setCreatePdca(!!c)} />
                  Generate PDCA proposal (mock)
                </label>
                <Button
                  onClick={() => {
                    if (!summary.trim()) {
                      toast.error('Assistance record is required')
                      return
                    }
                    void submitHrRectification(
                      active.Id,
                      { assistanceType, summary, createPdca },
                      { id: userId, name: displayName },
                    ).then((record) => {
                      toast.success('Submitted for secondary review')
                      if (record.LinkedPdcaProposalId && createPdca) {
                        setCreatedProposalId(record.LinkedPdcaProposalId)
                        toast.success('PDCA proposal created')
                      }
                      setSummary('')
                      setCreatePdca(false)
                      void load()
                      setActiveId(null)
                    })
                  }}
                >
                  Submit HR assistance
                </Button>
                {createdProposalId ? (
                  <p className="text-sm">
                    <Link
                      to={`/pms/pdca/proposals/${createdProposalId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      Open PDCA proposal
                    </Link>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
