import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { AppraisalEmployeeDetailDialog } from '@/components/pms/appraisal/AppraisalEmployeeDetailDialog'
import { AppraisalGradeBadge } from '@/components/pms/appraisal/AppraisalGradeBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { PerformanceGrade } from '@/models/common/enums'
import type { AppraisalCycle, AppraisalEmployeeRecord } from '@/models/pms/operations'
import {
  confirmPreliminaryGrades,
  fetchAppraisalCycles,
  fetchAppraisalRecords,
} from '@/services/pms/appraisal/appraisal-workflow-service'

const GRADES: PerformanceGrade[] = ['A', 'B', 'C', 'D']

export default function AppraisalPreliminaryPage() {
  const { hasPermission } = usePmsAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [cycles, setCycles] = useState<AppraisalCycle[]>([])
  const [records, setRecords] = useState<AppraisalEmployeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cycleId, setCycleId] = useState(searchParams.get('cycleId') ?? '')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [draftGrades, setDraftGrades] = useState<Record<string, PerformanceGrade>>({})
  const [detail, setDetail] = useState<AppraisalEmployeeRecord | null>(null)

  const load = async (cid: string) => {
    if (!cid) return
    setError(null)
    try {
      const [cycleList, recs] = await Promise.all([
        fetchAppraisalCycles(),
        fetchAppraisalRecords(cid),
      ])
      setCycles(cycleList.filter((c) => c.Status === 'generated' || c.Status === 'published'))
      setRecords(recs)
      const grades: Record<string, PerformanceGrade> = {}
      recs.forEach((r) => {
        grades[r.Id] = r.ConfirmedGrade ?? r.AutoGrade
      })
      setDraftGrades(grades)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAppraisalCycles().then((list) => {
      const generated = list.filter((c) => c.Status === 'generated')
      const initial = cycleId || generated[0]?.Id || ''
      setCycleId(initial)
      if (initial) void load(initial)
      else setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!cycleId) return
    setSearchParams({ cycleId })
    setLoading(true)
    void load(cycleId)
  }, [cycleId])

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter(
      (r) =>
        r.EmployeeName.toLowerCase().includes(q) || r.EmployeeId.toLowerCase().includes(q),
    )
  }, [records, search])

  const summary = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, pending: 0 }
    records.forEach((r) => {
      counts[r.AutoGrade] += 1
      if (r.Status === 'pending_preliminary') counts.pending += 1
    })
    return { total: records.length, counts }
  }, [records])

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error('Nothing to export')
      return
    }
    const header = 'EmployeeId,Name,Department,Score,AutoGrade,ConfirmedGrade,Status\n'
    const rows = filtered
      .map(
        (r) =>
          `${r.EmployeeId},${r.EmployeeName},${r.Department},${r.TotalScore},${r.AutoGrade},${r.ConfirmedGrade ?? ''},${r.Status}`,
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'preliminary-appraisals.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const submitBatch = async () => {
    const items = [...selected]
      .map((id) => records.find((r) => r.Id === id))
      .filter((r): r is AppraisalEmployeeRecord => !!r && r.Status === 'pending_preliminary')
      .map((r) => ({
        recordId: r.Id,
        confirmedGrade: draftGrades[r.Id] ?? r.AutoGrade,
      }))
    if (items.length === 0) {
      toast.error('Select pending rows to confirm')
      return
    }
    await confirmPreliminaryGrades(items)
    toast.success(`Confirmed ${items.length} grades`)
    setSelected(new Set())
    void load(cycleId)
  }

  return (
    <PermissionGate allowed={hasPermission('appraisal.review')}>
      <PageHeader
        title="Preliminary Performance Review"
        description="Review auto-generated scores and confirm grades for smart routing."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={cycleId} onValueChange={setCycleId}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Cycle" />
          </SelectTrigger>
          <SelectContent>
            {cycles.map((c) => (
              <SelectItem key={c.Id} value={c.Id}>
                {c.Label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">Total: {summary.total}</Badge>
        <Badge variant="outline">A: {summary.counts.A}</Badge>
        <Badge variant="outline">B: {summary.counts.B}</Badge>
        <Badge variant="outline">C: {summary.counts.C}</Badge>
        <Badge variant="outline">D: {summary.counts.D}</Badge>
        <Badge variant="secondary">Pending: {summary.counts.pending}</Badge>
        <Button variant="light" size="sm" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <Card className="mb-4 shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="type-card-title text-sm">Smart shunting rules</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Grades A/B route to CFO final review. Grades C/D route to HR rectification queue.
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search name or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {selected.size > 0 ? (
          <Button size="sm" onClick={() => void submitBatch()}>
            Confirm selected ({selected.size})
          </Button>
        ) : null}
      </div>

      <AsyncState loading={loading} error={error} onRetry={() => void load(cycleId)} empty={filtered.length === 0}>
        <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Auto grade</TableHead>
                <TableHead>Confirm grade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.Id}>
                  <TableCell>
                    <Checkbox
                      disabled={row.Status !== 'pending_preliminary'}
                      checked={selected.has(row.Id)}
                      onCheckedChange={(c) => {
                        setSelected((prev) => {
                          const next = new Set(prev)
                          if (c) next.add(row.Id)
                          else next.delete(row.Id)
                          return next
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => setDetail(row)}
                    >
                      {row.EmployeeName}
                    </button>
                    <div className="text-xs text-muted-foreground">{row.EmployeeId}</div>
                  </TableCell>
                  <TableCell>{row.Department}</TableCell>
                  <TableCell>{row.TotalScore}</TableCell>
                  <TableCell>
                    <AppraisalGradeBadge grade={row.AutoGrade} />
                  </TableCell>
                  <TableCell>
                    {row.Status === 'pending_preliminary' ? (
                      <Select
                        value={draftGrades[row.Id]}
                        onValueChange={(v) =>
                          setDraftGrades((prev) => ({ ...prev, [row.Id]: v as PerformanceGrade }))
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      row.ConfirmedGrade ?? '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.Status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <AppraisalEmployeeDetailDialog record={detail} onOpenChange={(o) => !o && setDetail(null)} />

      {cycles.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/pms/appraisal/cycles" className="text-primary hover:underline">
            Generate appraisals for a cycle first
          </Link>
        </p>
      ) : null}
    </PermissionGate>
  )
}
