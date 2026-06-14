import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  IssueReportSection,
  type IssueReportValues,
} from '@/components/pms/project/IssueReportSection'
import { fetchMyTasks, submitTaskProgress } from '@/services/pms/project/project-service'
import type { SubTaskRecord } from '@/services/pms/project/project-service'

export default function MyTasksPage() {
  const { userId } = usePmsAuth()
  const [tasks, setTasks] = useState<SubTaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [activeTask, setActiveTask] = useState<SubTaskRecord | null>(null)
  const [progress, setProgress] = useState(0)
  const [actualDate, setActualDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState('')
  const [issue, setIssue] = useState<IssueReportValues>({
    enabled: false,
    Description: '',
    ResourceType: 'material',
    FlagAtRisk: true,
  })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await fetchMyTasks(userId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = tasks.filter((t) => {
    if (filter === 'overdue') return t.Status === 'overdue'
    if (filter === 'due') return t.UpdateCycle === 'weekly'
    return true
  })

  const openUpdate = (task: SubTaskRecord) => {
    setActiveTask(task)
    setProgress(task.ProgressPct)
    setDescription('')
    setAttachments('')
    setIssue({
      enabled: false,
      Description: '',
      ResourceType: 'material',
      FlagAtRisk: true,
    })
  }

  const handleSubmit = async () => {
    if (!activeTask) return
    if (!description.trim()) {
      toast.error('Work description is required')
      return
    }
    if (progress === 100 && !attachments.trim()) {
      toast.error('Attachments required at 100% progress')
      return
    }
    if (issue.enabled && !issue.Description.trim()) {
      toast.error('Complete issue fields or collapse the issue section')
      return
    }
    setSubmitting(true)
    try {
      const result = await submitTaskProgress(
        activeTask.Id,
        {
          ProgressPct: progress,
          ActualDate: actualDate,
          Description: description,
          Issues: issue.enabled ? issue.Description : null,
          Attachments: attachments
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        issue.enabled
          ? {
              Description: issue.Description,
              ResourceType: issue.ResourceType,
              FlagAtRisk: issue.FlagAtRisk,
            }
          : undefined,
      )
      if (result.issue) {
        toast.warning('Issue reported — project leader notified (mock)')
      } else {
        toast.success('Progress updated — KPI sync triggered (mock)')
      }
      setActiveTask(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="My tasks"
        description="Personal queue for progress updates."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/pms/projects">All projects</Link>
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="due">Due this week</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <AsyncState
            loading={loading}
            error={error}
            empty={!loading && filtered.length === 0}
            emptyTitle="No assigned tasks"
            emptyDescription="Tasks assigned to you will appear here."
            onRetry={load}
          >
            <div className="grid gap-3">
              {filtered.map((task) => (
                <Card key={task.Id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">{task.Name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Update cycle: {task.UpdateCycle}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {task.Status === 'overdue' ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : null}
                      {task.IsAtRisk ? <Badge variant="destructive">At risk</Badge> : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={task.ProgressPct} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{task.ProgressPct}%</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/pms/tasks/${task.Id}/duration-change`}>
                            Duration change
                          </Link>
                        </Button>
                        <Button size="sm" onClick={() => openUpdate(task)}>
                          Update
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AsyncState>
        </TabsContent>
      </Tabs>

      {activeTask ? (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">Update: {activeTask.Name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="progress">Progress % (0–100)</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual">Actual execution date</Label>
              <Input
                id="actual"
                type="date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Work description</Label>
              <Textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attach">Attachments (comma-separated filenames)</Label>
              <Input
                id="attach"
                placeholder="report.pdf, photo.jpg"
                value={attachments}
                onChange={(e) => setAttachments(e.target.value)}
              />
            </div>
            <IssueReportSection value={issue} onChange={setIssue} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTask(null)}>
                Cancel
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={submitting}>
                {submitting ? <SubmitSpinner /> : null}
                Submit update
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
