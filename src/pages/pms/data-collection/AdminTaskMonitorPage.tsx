import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchAllFillingTasks,
  fetchFillingTaskSummary,
  getDueCountdownLabel,
} from '@/services/pms/data-collection/data-collection-service'
import type { FillingTaskRecord } from '@/services/pms/data-collection/data-collection-service'

export default function AdminTaskMonitorPage() {
  const { hasPermission } = usePmsAuth()
  const [tasks, setTasks] = useState<FillingTaskRecord[]>([])
  const [summary, setSummary] = useState({ pending: 0, submitted: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, s] = await Promise.all([fetchAllFillingTasks(), fetchFillingTaskSummary()])
      setTasks(t.sort((a, b) => a.DueAt.localeCompare(b.DueAt)))
      setSummary(s)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered =
    statusFilter === 'all' ? tasks : tasks.filter((t) => t.Status === statusFilter)

  return (
    <PermissionGate allowed={hasPermission('data.manage')}>
      <PageHeader title="Task monitor" description="Organization-wide filling task status." />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg">
              {summary.pending}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-lg">{summary.submitted}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-lg">
              {summary.overdue}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="mb-4 w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
        </SelectContent>
      </Select>

      <AsyncState loading={loading} empty={!loading && filtered.length === 0} emptyTitle="No tasks">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => {
              const countdown = getDueCountdownLabel(t.DueAt)
              return (
                <TableRow
                  key={t.Id}
                  className={t.Status === 'overdue' ? 'bg-destructive/5' : undefined}
                >
                  <TableCell>
                    {t.IndicatorName}
                    <span className="ml-2 text-muted-foreground">({t.PeriodLabel})</span>
                  </TableCell>
                  <TableCell>{t.AssigneeName}</TableCell>
                  <TableCell>
                    {new Date(t.DueAt).toLocaleDateString()}
                    <Badge variant={countdown.variant} className="ml-2">
                      {countdown.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.Status === 'overdue' ? 'destructive' : 'outline'}>
                      {t.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {t.Status === 'submitted' || t.Status === 'approved' ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/pms/data-collection/fill/${t.Id}`}>View</Link>
                      </Button>
                    ) : null}
                    {t.AlertRecordId ? (
                      <span className="text-xs text-destructive">Alert logged</span>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </AsyncState>
    </PermissionGate>
  )
}
