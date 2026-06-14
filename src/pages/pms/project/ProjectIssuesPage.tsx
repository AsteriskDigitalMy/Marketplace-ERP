import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  assignProjectIssues,
  fetchProjectIssues,
  fetchProjectUsers,
  submitIssueDisposal,
  verifyProjectIssue,
} from '@/services/pms/project/project-service'
import type { IssueRecord, ProjectRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
}

export default function ProjectIssuesPage() {
  const { project } = useOutletContext<OutletCtx>()
  const { hasPermission, userId } = usePmsAuth()
  const isLeader = hasPermission('project.manage') && project.LeaderId === userId || hasPermission('project.manage')
  const [issues, setIssues] = useState<IssueRecord[]>([])
  const [users, setUsers] = useState<{ Id: string; Name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [handlerId, setHandlerId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [measures, setMeasures] = useState('')
  const [timeline, setTimeline] = useState<IssueRecord | null>(null)
  const [verifyTarget, setVerifyTarget] = useState<IssueRecord | null>(null)
  const [verifyComment, setVerifyComment] = useState('')
  const [disposalTarget, setDisposalTarget] = useState<IssueRecord | null>(null)
  const [disposalResult, setDisposalResult] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [i, u] = await Promise.all([
        fetchProjectIssues(project.Id),
        fetchProjectUsers(),
      ])
      setIssues(i)
      setUsers(u)
    } finally {
      setLoading(false)
    }
  }, [project.Id])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = issues.filter((i) => filter === 'all' || i.Status === filter)

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const bulkAssign = async () => {
    if (!handlerId || !deadline) {
      toast.error('Handler and deadline required')
      return
    }
    await assignProjectIssues(selected, handlerId, deadline, measures || null)
    toast.success('Issues assigned — handlers notified (mock)')
    setAssignOpen(false)
    setSelected([])
    await load()
  }

  if (!isLeader) {
    return (
      <PermissionGate allowed={false}>
        <span />
      </PermissionGate>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="type-section-title">Project issues</h3>
        <Button
          size="sm"
          disabled={selected.length === 0}
          onClick={() => setAssignOpen(true)}
        >
          Bulk assign ({selected.length})
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <AsyncState loading={loading} empty={!loading && filtered.length === 0} emptyTitle="No issues">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Task</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((issue) => (
                  <TableRow key={issue.Id}>
                    <TableCell>
                      {issue.Status === 'open' ? (
                        <Checkbox
                          checked={selected.includes(issue.Id)}
                          onCheckedChange={() => toggle(issue.Id)}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Link to={`/pms/projects/${project.Id}/tasks`} className="hover:underline">
                        {issue.TaskName}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{issue.Description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{issue.ResourceType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{issue.Status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="light" size="sm" onClick={() => setTimeline(issue)}>
                        Timeline
                      </Button>
                      {issue.Status === 'assigned' && issue.HandlerId === userId ? (
                        <Button variant="light" size="sm" onClick={() => setDisposalTarget(issue)}>
                          Dispose
                        </Button>
                      ) : null}
                      {issue.Status === 'resolved' ? (
                        <Button variant="light" size="sm" onClick={() => setVerifyTarget(issue)}>
                          Verify
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AsyncState>
        </TabsContent>
      </Tabs>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk assign {selected.length} issue(s)</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-2">
              <Label>Handler</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={handlerId}
                onChange={(e) => setHandlerId(e.target.value)}
              >
                <option value="">Select handler</option>
                {users.map((u) => (
                  <option key={u.Id} value={u.Id}>
                    {u.Name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Resolution measures template</Label>
              <Textarea value={measures} onChange={(e) => setMeasures(e.target.value)} rows={3} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => void bulkAssign()}>Confirm assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!timeline} onOpenChange={() => setTimeline(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Disposal timeline</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
          <ul className="space-y-2 text-sm">
            {timeline?.DisposalLog.map((entry, i) => (
              <li key={i} className="rounded border p-2">
                <p className="font-medium">{entry.Action}</p>
                <p className="text-muted-foreground">{new Date(entry.At).toLocaleString()}</p>
                <p>{entry.Note}</p>
              </li>
            ))}
          </ul>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!disposalTarget} onOpenChange={() => setDisposalTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit disposal result</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <Textarea
            rows={4}
            value={disposalResult}
            onChange={(e) => setDisposalResult(e.target.value)}
            placeholder="Describe remediation taken…"
          />
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!disposalTarget) return
                await submitIssueDisposal(disposalTarget.Id, disposalResult, ['evidence.pdf'])
                toast.success('Disposal submitted for verification')
                setDisposalTarget(null)
                await load()
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!verifyTarget} onOpenChange={() => setVerifyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify issue closure</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <Textarea
            rows={3}
            value={verifyComment}
            onChange={(e) => setVerifyComment(e.target.value)}
          />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="light"
              onClick={async () => {
                if (!verifyTarget) return
                await verifyProjectIssue(verifyTarget.Id, 'return', verifyComment)
                toast.info('Returned to handler')
                setVerifyTarget(null)
                await load()
              }}
            >
              Return
            </Button>
            <Button
              onClick={async () => {
                if (!verifyTarget) return
                await verifyProjectIssue(verifyTarget.Id, 'close', verifyComment)
                toast.success('Issue closed — risk badge cleared')
                setVerifyTarget(null)
                await load()
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
