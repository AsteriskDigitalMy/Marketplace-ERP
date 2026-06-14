import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchDurationRequests,
  reviewDurationRequest,
} from '@/services/pms/project/project-service'
import type { DurationChangeRequest, ProjectRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
}

export default function ProjectDurationRequestsPage() {
  const { project } = useOutletContext<OutletCtx>()
  const { hasPermission } = usePmsAuth()
  const [requests, setRequests] = useState<DurationChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<DurationChangeRequest | null>(null)
  const [opinion, setOpinion] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRequests(await fetchDurationRequests(project.Id))
    } finally {
      setLoading(false)
    }
  }, [project.Id])

  useEffect(() => {
    void load()
  }, [load])

  const submitReview = async (decision: 'approved' | 'rejected') => {
    if (!reviewing) return
    try {
      await reviewDurationRequest(reviewing.Id, decision, opinion)
      toast.success(decision === 'approved' ? 'Approved — Gantt refreshed (mock)' : 'Request rejected')
      setReviewing(null)
      setOpinion('')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Review failed')
    }
  }

  const pending = requests.filter((r) => r.Status === 'pending').length

  return (
    <PermissionGate allowed={hasPermission('project.manage')}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Duration change requests</h3>
          {pending > 0 ? <Badge>{pending} pending</Badge> : null}
        </div>

        <AsyncState
          loading={loading}
          empty={!loading && requests.length === 0}
          emptyTitle="No duration requests"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Executor</TableHead>
                <TableHead>Original</TableHead>
                <TableHead>Proposed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.Id}>
                  <TableCell>{r.TaskName}</TableCell>
                  <TableCell>{r.ExecutorName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.OriginalStart} → {r.OriginalEnd}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.ProposedStart} → {r.ProposedEnd}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.Status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.Status === 'pending' ? (
                      <Button variant="light" size="sm" onClick={() => setReviewing(r)}>
                        Review
                      </Button>
                    ) : (
                      r.ReviewOpinion
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AsyncState>

        <Dialog open={!!reviewing} onOpenChange={() => setReviewing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review duration change</DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-4">
            {reviewing ? (
              <div className="space-y-2 text-sm">
                <p>{reviewing.Reason}</p>
                {reviewing.ProposedEnd > project.PlannedEnd ? (
                  <p className="text-amber-600">
                    Warning: proposed end extends beyond project planned end.
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Opinion</Label>
              <Textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} rows={3} />
            </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="destructive-solid" onClick={() => void submitReview('rejected')}>
                Reject
              </Button>
              <Button onClick={() => void submitReview('approved')}>Approve</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}
