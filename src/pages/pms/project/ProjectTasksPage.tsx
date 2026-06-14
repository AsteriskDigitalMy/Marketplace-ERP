import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { SubTaskDialog } from '@/components/pms/project/SubTaskDialog'
import {
  createSubTask,
  deleteSubTask,
  fetchProjectTasks,
  fetchProjectUsers,
  updateSubTask,
} from '@/services/pms/project/project-service'
import type { ProjectRecord, SubTaskRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
  reload: () => void
}

export default function ProjectTasksPage() {
  const { project } = useOutletContext<OutletCtx>()
  const { hasPermission } = usePmsAuth()
  const [tasks, setTasks] = useState<SubTaskRecord[]>([])
  const [users, setUsers] = useState<{ Id: string; Name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SubTaskRecord | null>(null)
  const [quickView, setQuickView] = useState<SubTaskRecord | null>(null)

  const canManage =
    hasPermission('project.manage') && project.Status === 'in_progress'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, u] = await Promise.all([
        fetchProjectTasks(project.Id),
        fetchProjectUsers(),
      ])
      setTasks(t)
      setUsers(u.filter((x) => project.TeamMemberIds.includes(x.Id)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [project.Id, project.TeamMemberIds])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = async (values: {
    Name: string
    OwnerId: string
    PlannedStart: string
    PlannedEnd: string
    Workload: number | null
    AcceptanceCriteria: string
    UpdateCycle: 'daily' | 'weekly'
    PrerequisiteTaskIds: string[]
  }) => {
    try {
      if (editing) {
        await updateSubTask(editing.Id, values)
        toast.success('Sub-task updated')
      } else {
        await createSubTask({ ProjectId: project.Id, ...values })
        toast.success('Sub-task created — executor to-do updated (mock)')
      }
      setEditing(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
      throw err
    }
  }

  const handleDelete = async (task: SubTaskRecord) => {
    try {
      await deleteSubTask(task.Id)
      toast.success('Task deleted')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="type-section-title">Sub-tasks</h3>
        {canManage ? (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            New sub-task
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button size="sm" disabled>
                  New sub-task
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Available when project is in progress</TooltipContent>
          </Tooltip>
        )}
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && tasks.length === 0}
        emptyTitle="No sub-tasks yet"
        emptyDescription="Create the first sub-task to decompose this project."
        emptyAction={
          canManage ? (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Create first sub-task
            </Button>
          ) : null
        }
        onRetry={load}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Deps</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.Id} className="cursor-pointer" onClick={() => setQuickView(t)}>
                  <TableCell className="font-medium">
                    {t.Name}
                    {t.IsAtRisk ? (
                      <Badge variant="destructive" className="ml-2">
                        at risk
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{t.OwnerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.PlannedStart} → {t.PlannedEnd}
                  </TableCell>
                  <TableCell>
                    {t.PrerequisiteTaskIds.length > 0 ? (
                      <Badge variant="outline">{t.PrerequisiteTaskIds.length}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.Status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell>{t.ProgressPct}%</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {canManage ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => {
                            setEditing(t)
                            setDialogOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive-solid"
                          size="sm"
                          disabled={t.Status !== 'not_started'}
                          onClick={() => void handleDelete(t)}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <SubTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={project.Id}
        teamUsers={users}
        siblingTasks={tasks}
        initial={editing}
        onSave={handleSave}
      />

      <Sheet open={!!quickView} onOpenChange={() => setQuickView(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{quickView?.Name}</SheetTitle>
            <SheetDescription>{quickView?.OwnerName}</SheetDescription>
          </SheetHeader>
          {quickView ? (
            <div className="mt-4 space-y-2 text-sm">
              <p>{quickView.AcceptanceCriteria}</p>
              <p className="text-muted-foreground">
                {quickView.PlannedStart} → {quickView.PlannedEnd}
              </p>
              <Button asChild size="sm" variant="light">
                <Link to="/pms/tasks/my">Update progress</Link>
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
