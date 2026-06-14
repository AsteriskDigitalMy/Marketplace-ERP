import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { createDurationChangeRequest, fetchTask } from '@/services/pms/project/project-service'
import type { SubTaskRecord } from '@/services/pms/project/project-service'

const schema = z
  .object({
    ProposedStart: z.string().min(1),
    ProposedEnd: z.string().min(1),
    Reason: z.string().trim().min(20, 'Reason must be at least 20 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.ProposedEnd < data.ProposedStart) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be on or after start',
        path: ['ProposedEnd'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export default function TaskDurationChangePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { userId } = usePmsAuth()
  const [task, setTask] = useState<SubTaskRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ProposedStart: '', ProposedEnd: '', Reason: '' },
  })

  useEffect(() => {
    void fetchTask(id)
      .then((t) => {
        if (t.Status === 'completed') {
          toast.error('Cannot request change for completed task')
          navigate('/pms/tasks/my')
          return
        }
        setTask(t)
        form.reset({
          ProposedStart: t.PlannedStart,
          ProposedEnd: t.PlannedEnd,
          Reason: '',
        })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, form, navigate])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await createDurationChangeRequest(
        id,
        values.ProposedStart,
        values.ProposedEnd,
        values.Reason,
        userId,
      )
      toast.success('Duration change request submitted')
      navigate('/pms/tasks/my')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AsyncState loading={loading} error={error}>
      {task ? (
        <div className="mx-auto max-w-lg space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link to="/pms/tasks/my" className="hover:underline">
              My tasks
            </Link>{' '}
            → {task.Name} → Duration change
          </p>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current schedule</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                {task.PlannedStart} → {task.PlannedEnd}
              </p>
              <Link
                to={`/pms/projects/${task.ProjectId}`}
                className="text-primary underline"
              >
                View project
              </Link>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>Proposed dates cannot be before today (mock rule).</AlertDescription>
          </Alert>

          <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Adjusted start</Label>
                <Input type="date" {...form.register('ProposedStart')} />
              </div>
              <div className="space-y-2">
                <Label>Adjusted end</Label>
                <Input type="date" {...form.register('ProposedEnd')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason ({form.watch('Reason').length}/20 min)</Label>
              <Textarea rows={4} {...form.register('Reason')} />
              {form.formState.errors.Reason ? (
                <p className="text-sm text-destructive">{form.formState.errors.Reason.message}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/pms/tasks/my">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <SubmitSpinner /> : null}
                Submit request
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </AsyncState>
  )
}
