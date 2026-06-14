import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  batchUpdateProgress,
  fetchProjectTasks,
} from '@/services/pms/project/project-service'
import type { ProjectRecord, SubTaskRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
}

export default function ProjectProgressPage() {
  const { project } = useOutletContext<OutletCtx>()
  const { hasPermission } = usePmsAuth()
  const [tasks, setTasks] = useState<SubTaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [progress, setProgress] = useState(50)
  const [description, setDescription] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await fetchProjectTasks(project.Id)
      setTasks(all.filter((t) => t.Status === 'in_progress' || t.Status === 'overdue'))
    } finally {
      setLoading(false)
    }
  }, [project.Id])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const applyBatch = async () => {
    if (!description.trim()) {
      toast.error('Description required')
      return
    }
    await batchUpdateProgress(selected, progress, description)
    toast.success(`Updated ${selected.length} task(s)`)
    setSelected([])
    setConfirmOpen(false)
    await load()
  }

  return (
    <PermissionGate allowed={hasPermission('project.manage')}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Leader batch progress</h3>
          <Button asChild variant="outline" size="sm">
            <Link to={`/pms/projects/${project.Id}/progress/import`}>Excel import</Link>
          </Button>
        </div>

        <AsyncState loading={loading} empty={!loading && tasks.length === 0} emptyTitle="No in-progress tasks">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Task</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow key={t.Id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(t.Id)}
                        onCheckedChange={() => toggle(t.Id)}
                      />
                    </TableCell>
                    <TableCell>{t.Name}</TableCell>
                    <TableCell>{t.OwnerName}</TableCell>
                    <TableCell>{t.ProgressPct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AsyncState>

        <div className="grid max-w-md gap-3 rounded-lg border p-4">
          <div className="space-y-2">
            <Label>Batch progress %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Shared description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            disabled={selected.length === 0}
            onClick={() => setConfirmOpen(true)}
          >
            Apply to {selected.length} task(s)
          </Button>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply batch update?</AlertDialogTitle>
              <AlertDialogDescription>
                This will create individual progress log entries for {selected.length} task(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void applyBatch()}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGate>
  )
}
