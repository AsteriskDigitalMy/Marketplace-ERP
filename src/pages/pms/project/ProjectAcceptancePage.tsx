import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchProjectKpiSync,
  fetchProjectTasks,
  submitAcceptanceApplication,
} from '@/services/pms/project/project-service'
import type { ProjectRecord, SubTaskRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
  reload: () => void
}

export default function ProjectAcceptancePage() {
  const { project, reload } = useOutletContext<OutletCtx>()
  const { hasPermission, userId } = usePmsAuth()
  const [tasks, setTasks] = useState<SubTaskRecord[]>([])
  const [kpiPreview, setKpiPreview] = useState<{ name: string; value: number; target: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState('')
  const [achievement, setAchievement] = useState<'met' | 'partial' | 'not_met'>('met')
  const [attachments, setAttachments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, sync] = await Promise.all([
        fetchProjectTasks(project.Id),
        fetchProjectKpiSync(project.Id),
      ])
      setTasks(t)
      setKpiPreview(
        sync.Mappings.map((m) => ({
          name: m.KpiName,
          value: m.SyncedValue,
          target: m.TargetValue,
        })),
      )
    } finally {
      setLoading(false)
    }
  }, [project.Id])

  useEffect(() => {
    void load()
  }, [load])

  const completed = tasks.filter((t) => t.Status === 'completed').length
  const allAccepted = tasks.length > 0 && completed === tasks.length
  const pending = tasks.filter((t) => t.Status !== 'completed')

  const submit = async () => {
    if (!summary.trim() || summary.length < 50) {
      toast.error('Summary must be at least 50 characters')
      return
    }
    const files = attachments.split(',').map((s) => s.trim()).filter(Boolean)
    if (files.length === 0) {
      toast.error('At least one attachment required')
      return
    }
    setSubmitting(true)
    try {
      await submitAcceptanceApplication(
        project.Id,
        {
          CompletionSummary: summary,
          TargetAchievement: achievement,
          Attachments: files,
        },
        userId,
      )
      toast.success('Acceptance application submitted — auditor queue updated (mock)')
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const alreadySubmitted = project.Status === 'pending_acceptance' || project.AcceptanceApplication

  return (
    <PermissionGate allowed={hasPermission('project.manage')}>
      <AsyncState loading={loading}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Acceptance application</h3>

          <Alert variant={allAccepted ? 'default' : 'destructive'}>
            <AlertDescription>
              {completed} of {tasks.length} tasks accepted
            </AlertDescription>
          </Alert>
          <Progress value={tasks.length ? (completed / tasks.length) * 100 : 0} />

          {!allAccepted && pending.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pending task</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((t) => (
                  <TableRow key={t.Id}>
                    <TableCell>{t.Name}</TableCell>
                    <TableCell>{t.OwnerName}</TableCell>
                    <TableCell>{t.ProgressPct}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((t) => (
                <div key={t.Id} className="flex items-center justify-between text-sm">
                  <span>{t.Name}</span>
                  <Badge variant={t.Status === 'completed' ? 'default' : 'outline'}>
                    {t.Status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {kpiPreview.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KPI achievement preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Synced</TableHead>
                      <TableHead>Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiPreview.map((k) => (
                      <TableRow key={k.name}>
                        <TableCell>{k.name}</TableCell>
                        <TableCell>{k.value}</TableCell>
                        <TableCell>{k.target}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {alreadySubmitted ? (
            <Alert>
              <AlertDescription>
                Application submitted{' '}
                {project.AcceptanceApplication?.SubmittedAt
                  ? new Date(project.AcceptanceApplication.SubmittedAt).toLocaleString()
                  : ''}
                — awaiting auditor review.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Overall completion summary (min 50 chars)</Label>
                  <Textarea rows={5} value={summary} onChange={(e) => setSummary(e.target.value)} disabled={!allAccepted} />
                </div>
                <div className="space-y-2">
                  <Label>Target achievement</Label>
                  <RadioGroup
                    value={achievement}
                    onValueChange={(v) => setAchievement(v as typeof achievement)}
                    disabled={!allAccepted}
                    className="flex gap-4"
                  >
                    {(['met', 'partial', 'not_met'] as const).map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <RadioGroupItem value={v} id={`ach-${v}`} />
                        <Label htmlFor={`ach-${v}`} className="font-normal capitalize">
                          {v.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Outcome attachments (comma-separated)</Label>
                  <Input
                    value={attachments}
                    onChange={(e) => setAttachments(e.target.value)}
                    placeholder="final-report.pdf"
                    disabled={!allAccepted}
                  />
                </div>
                <Button onClick={() => void submit()} disabled={!allAccepted || submitting}>
                  {submitting ? <SubmitSpinner /> : null}
                  Submit for acceptance
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
