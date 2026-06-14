import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  fetchEnabledKpis,
  fetchProject,
  getLeaderName,
  reviewProjectInitiation,
} from '@/services/pms/project/project-service'
import type { ProjectRecord } from '@/services/pms/project/project-service'

const schema = z
  .object({
    Decision: z.enum(['approve', 'reject']),
    Opinion: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.Decision === 'reject' && !data.Opinion.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Opinion is required when rejecting',
        path: ['Opinion'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export default function ProjectApprovalReviewPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [leaderName, setLeaderName] = useState('')
  const [kpis, setKpis] = useState<{ Id: string; Code: string; Name: string; TargetValue: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { Decision: 'approve', Opinion: '' },
  })

  const decision = form.watch('Decision')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, k] = await Promise.all([fetchProject(projectId), fetchEnabledKpis()])
      setProject(p)
      setLeaderName(await getLeaderName(p.LeaderId))
      setKpis(k.filter((x) => p.BoundKpiIds.includes(x.Id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [projectId])

  const submit = form.handleSubmit(async (values) => {
    if (values.Decision === 'approve' && project && project.BudgetAmount > 1_000_000) {
      setConfirmOpen(true)
      return
    }
    await doReview(values)
  })

  const doReview = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await reviewProjectInitiation(projectId, values.Decision, values.Opinion)
      if (values.Decision === 'approve') {
        toast.success('Project approved — Gantt initialized (mock)')
      } else {
        toast.error('Project returned to initiator', {
          description: 'Leader notified with rejection opinion.',
        })
      }
      navigate('/pms/projects/approvals')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Review failed')
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }

  const formatBudget = (n: number) =>
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(n)

  return (
    <PermissionGate allowed={hasPermission('project.approve')}>
      <AsyncState loading={loading} error={error} onRetry={load}>
        {project ? (
          <div className="space-y-6">
            <PageHeader
              title={`Review ${project.Code}`}
              description={project.Name}
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link to="/pms/projects/approvals">Back to inbox</Link>
                </Button>
              }
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Leader: {leaderName}</p>
                  <p>Type: {project.BusinessType}</p>
                  <p>
                    Planned: {project.PlannedStart} → {project.PlannedEnd}
                  </p>
                  <p>Budget: {formatBudget(project.BudgetAmount)}</p>
                  {project.ClientInfo ? <p>Client: {project.ClientInfo}</p> : null}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Budget summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{formatBudget(project.BudgetAmount)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bound KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpis.map((k) => (
                      <TableRow key={k.Id}>
                        <TableCell>
                          <Link
                            to={`/pms/kpi/indicators/${k.Id}`}
                            className="font-mono text-sm hover:underline"
                          >
                            {k.Code}
                          </Link>
                        </TableCell>
                        <TableCell>{k.Name}</TableCell>
                        <TableCell>{k.TargetValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {project.GanttSketch ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gantt sketch</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm">{project.GanttSketch}</pre>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <RadioGroup
                    value={decision}
                    onValueChange={(v) => form.setValue('Decision', v as 'approve' | 'reject')}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="approve" id="approve" />
                      <Label htmlFor="approve">Approve</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="reject" id="reject" />
                      <Label htmlFor="reject">Reject</Label>
                    </div>
                  </RadioGroup>
                  <div className="space-y-2">
                    <Label htmlFor="opinion">
                      Opinion {decision === 'reject' ? '(required)' : '(optional)'}
                    </Label>
                    <Textarea id="opinion" rows={4} {...form.register('Opinion')} />
                    {form.formState.errors.Opinion ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.Opinion.message}
                      </p>
                    ) : null}
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <SubmitSpinner /> : null}
                    Submit decision
                  </Button>
                </form>
              </CardContent>
            </Card>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm high-budget approval?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Budget exceeds MYR 1,000,000. Confirm KPI and budget commitments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void doReview(form.getValues())}>
                    Confirm approve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
