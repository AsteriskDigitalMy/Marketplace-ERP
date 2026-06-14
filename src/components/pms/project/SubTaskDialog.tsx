import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SubTaskRecord } from '@/services/pms/project/project-service'

const schema = z
  .object({
    Name: z.string().trim().min(1).max(200),
    OwnerId: z.string().uuid(),
    PlannedStart: z.string().min(1),
    PlannedEnd: z.string().min(1),
    Workload: z.number().positive().nullable(),
    AcceptanceCriteria: z.string().trim().min(1).max(2000),
    UpdateCycle: z.enum(['daily', 'weekly']),
    PrerequisiteTaskIds: z.array(z.string().uuid()),
  })
  .superRefine((data, ctx) => {
    if (data.PlannedEnd < data.PlannedStart) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be on or after start date',
        path: ['PlannedEnd'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

interface SubTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  teamUsers: { Id: string; Name: string }[]
  siblingTasks: SubTaskRecord[]
  initial?: SubTaskRecord | null
  onSave: (values: FormValues) => Promise<void>
}

export function SubTaskDialog({
  open,
  onOpenChange,
  projectId,
  teamUsers,
  siblingTasks,
  initial,
  onSave,
}: SubTaskDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      Name: '',
      OwnerId: '',
      PlannedStart: '',
      PlannedEnd: '',
      Workload: null,
      AcceptanceCriteria: '',
      UpdateCycle: 'weekly',
      PrerequisiteTaskIds: [],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        initial
          ? {
              Name: initial.Name,
              OwnerId: initial.OwnerId,
              PlannedStart: initial.PlannedStart,
              PlannedEnd: initial.PlannedEnd,
              Workload: initial.Workload,
              AcceptanceCriteria: initial.AcceptanceCriteria,
              UpdateCycle: initial.UpdateCycle,
              PrerequisiteTaskIds: initial.PrerequisiteTaskIds,
            }
          : {
              Name: '',
              OwnerId: teamUsers[0]?.Id ?? '',
              PlannedStart: '',
              PlannedEnd: '',
              Workload: null,
              AcceptanceCriteria: '',
              UpdateCycle: 'weekly',
              PrerequisiteTaskIds: [],
            },
      )
    }
  }, [open, initial, teamUsers, form])

  const prerequisites = form.watch('PrerequisiteTaskIds')

  const togglePrereq = (taskId: string) => {
    const current = form.getValues('PrerequisiteTaskIds')
    form.setValue(
      'PrerequisiteTaskIds',
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
      { shouldDirty: true },
    )
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave(values)
    onOpenChange(false)
  })

  const otherTasks = siblingTasks.filter((t) => t.Id !== initial?.Id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit sub-task' : 'New sub-task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" value={projectId} readOnly />
          <div className="space-y-2">
            <Label htmlFor="task-name">Task name</Label>
            <Input id="task-name" {...form.register('Name')} />
          </div>
          <div className="space-y-2">
            <Label>Executor</Label>
            <Select
              value={form.watch('OwnerId')}
              onValueChange={(v) => form.setValue('OwnerId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select executor" />
              </SelectTrigger>
              <SelectContent>
                {teamUsers.map((u) => (
                  <SelectItem key={u.Id} value={u.Id}>
                    {u.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Planned start</Label>
              <Input id="start" type="date" {...form.register('PlannedStart')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Planned end</Label>
              <Input id="end" type="date" {...form.register('PlannedEnd')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workload">Workload (hours)</Label>
            <Input
              id="workload"
              type="number"
              {...form.register('Workload', {
                setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="criteria">Acceptance criteria</Label>
            <Textarea id="criteria" rows={3} {...form.register('AcceptanceCriteria')} />
          </div>
          <div className="space-y-2">
            <Label>Update cycle</Label>
            <Select
              value={form.watch('UpdateCycle')}
              onValueChange={(v) => form.setValue('UpdateCycle', v as 'daily' | 'weekly')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {otherTasks.length > 0 ? (
            <div className="space-y-2">
              <Label>Prerequisites</Label>
              <div className="space-y-2 rounded-md border p-3">
                {otherTasks.map((t) => (
                  <label key={t.Id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={prerequisites.includes(t.Id)}
                      onCheckedChange={() => togglePrereq(t.Id)}
                    />
                    {t.Name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="light" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save sub-task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
