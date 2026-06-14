import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { PdcaProgressDialog } from '@/components/pms/pdca/PdcaProgressDialog'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  isPdcaTaskOverdue,
  PDCA_TASK_STATUS_LABELS,
  pdcaTaskStatusBadgeClass,
} from '@/lib/pms/pdca-helpers'
import type { PdcaExecutionTask } from '@/models/pms/operations'
import { fetchPdcaTasks } from '@/services/pms/pdca/pdca-execution-service'

export default function PdcaTasksPage() {
  const { userId, hasPermission } = usePmsAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tasks, setTasks] = useState<PdcaExecutionTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<PdcaExecutionTask | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const status = (searchParams.get('status') ?? 'all') as PdcaExecutionTask['Status'] | 'all'
  const overdueOnly = searchParams.get('overdue') === '1'

  const load = async () => {
    setError(null)
    try {
      setTasks(
        await fetchPdcaTasks({
          ownerId: userId,
          status,
          overdueOnly,
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [userId, status, overdueOnly])

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  return (
    <PermissionGate allowed={hasPermission('pdca.submit')}>
      <PageHeader
        title="My PDCA Tasks"
        description="Update progress on improvement steps assigned to you."
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Select value={status} onValueChange={(v) => setFilter('status', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="not_started">Not started</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={overdueOnly}
            onCheckedChange={(c) => setFilter('overdue', c ? '1' : '')}
          />
          Overdue only
        </label>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={tasks.length === 0}
        emptyTitle="No tasks assigned"
        emptyDescription="Execution tasks will appear here when a manager assigns steps to you."
      >
        <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const overdue = isPdcaTaskOverdue(task)
                return (
                  <TableRow key={task.Id}>
                    <TableCell>
                      <Link
                        to={`/pms/pdca/proposals/${task.ProposalId}/execution`}
                        className="font-medium text-primary hover:underline"
                      >
                        {task.ProposalTitle}
                      </Link>
                    </TableCell>
                    <TableCell>{task.Description}</TableCell>
                    <TableCell className={overdue ? 'text-destructive font-medium' : undefined}>
                      {new Date(task.PlannedDeadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{task.ProgressPct}%</TableCell>
                    <TableCell>
                      <Badge className={pdcaTaskStatusBadgeClass(task.Status)}>
                        {PDCA_TASK_STATUS_LABELS[task.Status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setActiveTask(task)
                          setDialogOpen(true)
                        }}
                      >
                        Update progress
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <PdcaProgressDialog
        task={activeTask}
        actorId={userId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => void load()}
      />
    </PermissionGate>
  )
}
