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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { ProjectKpiPickerDialog } from '@/components/pms/project/ProjectKpiPickerDialog'
import {
  checkProjectNameUnique,
  createProject,
  fetchBusinessTypes,
  fetchEnabledKpis,
  fetchProject,
  fetchProjectUsers,
  submitProject,
  updateProject,
} from '@/services/pms/project/project-service'

const schema = z
  .object({
    Name: z.string().trim().min(1).max(200),
    BusinessType: z.string().min(1),
    PlannedStart: z.string().min(1),
    PlannedEnd: z.string().min(1),
    LeaderId: z.string().uuid(),
    TeamMemberIds: z.array(z.string().uuid()).min(1),
    BudgetAmount: z.number().positive(),
    BoundKpiIds: z.array(z.string().uuid()).min(1),
    ClientInfo: z.string().max(1000).nullable(),
    GanttSketch: z.string().max(2000).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.PlannedEnd <= data.PlannedStart) {
      ctx.addIssue({
        code: 'custom',
        message: 'Planned end must be after start',
        path: ['PlannedEnd'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export default function ProjectCreatePage() {
  const { id: editId } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const isEdit = Boolean(editId)
  const [users, setUsers] = useState<{ Id: string; Name: string }[]>([])
  const [businessTypes, setBusinessTypes] = useState<string[]>([])
  const [kpis, setKpis] = useState<
    { Id: string; Code: string; Name: string; Category: string; TargetValue: number }[]
  >([])
  const [kpiPickerOpen, setKpiPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [nameChecking, setNameChecking] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      Name: '',
      BusinessType: '',
      PlannedStart: '',
      PlannedEnd: '',
      LeaderId: '',
      TeamMemberIds: [],
      BudgetAmount: 0,
      BoundKpiIds: [],
      ClientInfo: null,
      GanttSketch: null,
    },
  })

  useEffect(() => {
    void Promise.all([fetchProjectUsers(), fetchBusinessTypes(), fetchEnabledKpis()]).then(
      ([u, bt, k]) => {
        setUsers(u)
        setBusinessTypes(bt)
        setKpis(k)
        if (!isEdit && u[0]) {
          form.setValue('LeaderId', u[0].Id)
          form.setValue('TeamMemberIds', [u[0].Id])
        }
        if (bt[0]) form.setValue('BusinessType', bt[0])
      },
    )
  }, [form, isEdit])

  useEffect(() => {
    if (!editId) return
    void fetchProject(editId).then((p) => {
      form.reset({
        Name: p.Name,
        BusinessType: p.BusinessType,
        PlannedStart: p.PlannedStart,
        PlannedEnd: p.PlannedEnd,
        LeaderId: p.LeaderId,
        TeamMemberIds: p.TeamMemberIds,
        BudgetAmount: p.BudgetAmount,
        BoundKpiIds: p.BoundKpiIds,
        ClientInfo: p.ClientInfo,
        GanttSketch: p.GanttSketch,
      })
    })
  }, [editId, form])

  const name = form.watch('Name')
  useEffect(() => {
    if (!name || name.length < 3) return
    setNameChecking(true)
    const timer = setTimeout(() => {
      void checkProjectNameUnique(name, editId).then((unique) => {
        if (!unique) {
          form.setError('Name', { message: 'Project name already exists' })
        } else {
          form.clearErrors('Name')
        }
        setNameChecking(false)
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [name, editId, form])

  const boundKpis = kpis.filter((k) => form.watch('BoundKpiIds').includes(k.Id))
  const teamIds = form.watch('TeamMemberIds')

  const toggleTeam = (userId: string) => {
    const current = form.getValues('TeamMemberIds')
    form.setValue(
      'TeamMemberIds',
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
      { shouldValidate: true },
    )
  }

  const save = async (asDraft: boolean) => {
    const valid = await form.trigger()
    if (!valid) return
    setSubmitting(true)
    try {
      const values = form.getValues()
      if (isEdit && editId) {
        await updateProject(editId, {
          ...values,
          GanttSketch: values.GanttSketch,
        })
        if (!asDraft) {
          const submitted = await submitProject(editId)
          toast.success(`Submitted for approval — code ${submitted.Code}`)
          navigate(`/pms/projects/${submitted.Id}`)
        } else {
          toast.success('Draft saved')
          navigate('/pms/projects')
        }
      } else {
        const created = await createProject(
          {
            ...values,
            GanttSketch: values.GanttSketch,
            ClientInfo: values.ClientInfo,
          },
          asDraft,
        )
        if (!asDraft) {
          toast.success(`Submitted for approval — code ${created.Code}`)
        } else {
          toast.success('Draft saved')
        }
        navigate(`/pms/projects/${created.Id}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('project.initiate')}>
      <PageHeader
        title={isEdit ? 'Edit project application' : 'New project'}
        description="Capture project basics, team, budget, and KPI bindings."
        actions={
          <Button
            type="button"
            variant="light"
            size="sm"
            onClick={() => {
              if (form.formState.isDirty) setDiscardOpen(true)
              else navigate('/pms/projects')
            }}
          >
            Back
          </Button>
        }
      />

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Project name</Label>
              <Input id="name" {...form.register('Name')} />
              {form.formState.errors.Name ? (
                <p className="text-sm text-destructive">{form.formState.errors.Name.message}</p>
              ) : nameChecking ? (
                <p className="text-sm text-muted-foreground">Checking uniqueness…</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Business type</Label>
              <Select
                value={form.watch('BusinessType')}
                onValueChange={(v) => form.setValue('BusinessType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Planned start</Label>
              <Input id="start" type="date" {...form.register('PlannedStart')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Planned end</Label>
              <Input id="end" type="date" {...form.register('PlannedEnd')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="client">Partner / client info</Label>
              <Textarea id="client" rows={2} {...form.register('ClientInfo')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team &amp; budget</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Overall leader</Label>
              <Select
                value={form.watch('LeaderId')}
                onValueChange={(v) => form.setValue('LeaderId', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.Id} value={u.Id}>
                      {u.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget amount (MYR)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                {...form.register('BudgetAmount', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Execution team</Label>
              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <Badge
                    key={u.Id}
                    variant={teamIds.includes(u.Id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTeam(u.Id)}
                  >
                    {u.Name}
                  </Badge>
                ))}
              </div>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No users —{' '}
                  <Link to="/pms/admin/accounts/new" className="underline">
                    create accounts
                  </Link>
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">KPI binding</CardTitle>
            <Button type="button" variant="light" size="sm" onClick={() => setKpiPickerOpen(true)}>
              Select KPIs
            </Button>
          </CardHeader>
          <CardContent>
            {boundKpis.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Select at least one enabled KPI from the library.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {boundKpis.map((k) => (
                  <Badge key={k.Id} variant="secondary">
                    {k.Code} — {k.Name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initial Gantt sketch (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              placeholder="Milestone 1: …&#10;Milestone 2: …"
              {...form.register('GanttSketch')}
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="light" disabled={submitting} onClick={() => void save(true)}>
            Save draft
          </Button>
          <Button type="button" disabled={submitting} onClick={() => void save(false)}>
            {submitting ? <SubmitSpinner /> : null}
            Submit for approval
          </Button>
        </div>
      </form>

      <ProjectKpiPickerDialog
        open={kpiPickerOpen}
        onOpenChange={setKpiPickerOpen}
        options={kpis}
        selectedIds={form.watch('BoundKpiIds')}
        onConfirm={(ids) => form.setValue('BoundKpiIds', ids, { shouldValidate: true })}
      />

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>Unsaved changes will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/pms/projects')}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
