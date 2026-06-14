import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchProject,
  fetchProjectKpiSync,
  fetchProjectTasks,
  reviewProjectAcceptance,
} from '@/services/pms/project/project-service'
import type { ProjectRecord, SubTaskRecord } from '@/services/pms/project/project-service'
import type { PerformanceGrade } from '@/models/common/enums'

const schema = z
  .object({
    Opinion: z.string().trim().min(1),
    EvaluationGrade: z.enum(['A', 'B', 'C', 'D']),
    Decision: z.enum(['pass', 'fail']),
    RectificationRequirements: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.Decision === 'fail' && !data.RectificationRequirements?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Rectification requirements required on fail',
        path: ['RectificationRequirements'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export default function ProjectAcceptanceReviewDetailPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [tasks, setTasks] = useState<SubTaskRecord[]>([])
  const [kpiRows, setKpiRows] = useState<{ name: string; value: number; target: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      Opinion: '',
      EvaluationGrade: 'B',
      Decision: 'pass',
      RectificationRequirements: null,
    },
  })

  const decision = form.watch('Decision')

  useEffect(() => {
    void Promise.all([
      fetchProject(projectId),
      fetchProjectTasks(projectId),
      fetchProjectKpiSync(projectId),
    ]).then(([p, t, sync]) => {
      setProject(p)
      setTasks(t)
      setKpiRows(sync.Mappings.map((m) => ({ name: m.KpiName, value: m.SyncedValue, target: m.TargetValue })))
      setLoading(false)
    })
  }, [projectId])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await reviewProjectAcceptance(projectId, values)
      if (values.Decision === 'pass') {
        toast.success('Project archived and sealed (mock)')
      } else {
        toast.error('Returned to leader for rectification')
      }
      navigate('/pms/projects/acceptance-reviews')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Review failed')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <PermissionGate allowed={hasPermission('acceptance.approve')}>
      <AsyncState loading={loading}>
        {project ? (
          <div className="space-y-6">
            <PageHeader
              title={`Acceptance review — ${project.Code}`}
              description={project.Name}
              actions={
                <Button asChild variant="light" size="sm">
                  <Link to="/pms/projects/acceptance-reviews">Back</Link>
                </Button>
              }
            />

            <Tabs defaultValue="materials">
              <TabsList>
                <TabsTrigger value="materials">Execution materials</TabsTrigger>
                <TabsTrigger value="tasks">Task summary</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
                <TabsTrigger value="kpi">KPI achievement</TabsTrigger>
              </TabsList>

              <TabsContent value="materials" className="mt-4">
                <Card>
                  <CardContent className="pt-6 text-sm">
                    <p>{project.AcceptanceApplication?.CompletionSummary}</p>
                    <p className="mt-2 text-muted-foreground">
                      Target achievement:{' '}
                      <Badge>{project.AcceptanceApplication?.TargetAchievement}</Badge>
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Accepted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((t) => (
                      <TableRow key={t.Id}>
                        <TableCell>{t.Name}</TableCell>
                        <TableCell>{t.OwnerName}</TableCell>
                        <TableCell>{t.ProgressPct}%</TableCell>
                        <TableCell>
                          <Badge variant={t.Status === 'completed' ? 'default' : 'outline'}>
                            {t.Status === 'completed' ? 'yes' : 'no'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="attachments" className="mt-4">
                <ul className="list-inside list-disc text-sm">
                  {project.AcceptanceApplication?.Attachments.map((f) => (
                    <li key={f}>
                      {f}{' '}
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Download (mock)
                      </Button>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="kpi" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Synced</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiRows.map((k) => (
                      <TableRow key={k.name}>
                        <TableCell>{k.name}</TableCell>
                        <TableCell>{k.value}</TableCell>
                        <TableCell>{k.target}</TableCell>
                        <TableCell>
                          <Badge variant={k.value >= k.target ? 'default' : 'destructive'}>
                            {k.value - k.target}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Comprehensive opinion</Label>
                    <Textarea rows={4} {...form.register('Opinion')} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Select
                        value={form.watch('EvaluationGrade')}
                        onValueChange={(v) =>
                          form.setValue('EvaluationGrade', v as PerformanceGrade)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(['A', 'B', 'C', 'D'] as const).map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Decision</Label>
                      <Select
                        value={decision}
                        onValueChange={(v) => form.setValue('Decision', v as 'pass' | 'fail')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pass">Pass</SelectItem>
                          <SelectItem value="fail">Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {decision === 'fail' ? (
                    <div className="space-y-2">
                      <Label>Rectification requirements</Label>
                      <Textarea rows={3} {...form.register('RectificationRequirements')} />
                      {form.formState.errors.RectificationRequirements ? (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.RectificationRequirements.message}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <SubmitSpinner /> : null}
                    Submit decision
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
