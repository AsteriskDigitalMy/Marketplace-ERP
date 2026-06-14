import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import type { PdcaExecutionTask } from '@/models/pms/operations'
import { updatePdcaTaskProgress } from '@/services/pms/pdca/pdca-execution-service'

interface PdcaProgressDialogProps {
  task: PdcaExecutionTask | null
  actorId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function PdcaProgressDialog({
  task,
  actorId,
  open,
  onOpenChange,
  onSaved,
}: PdcaProgressDialogProps) {
  const [progressPct, setProgressPct] = useState(0)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (task) {
      setProgressPct(task.ProgressPct)
      setNote('')
    }
  }, [task])

  const handleSave = async () => {
    if (!task) return
    setSaving(true)
    try {
      await updatePdcaTaskProgress(task.Id, { progressPct, note }, actorId)
      toast.success('Progress updated')
      onOpenChange(false)
      onSaved()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update progress</DialogTitle>
        </DialogHeader>
        {task ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">{task.ProposalTitle}</p>
              <p className="text-sm text-muted-foreground">{task.Description}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progress %</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={progressPct}
                onChange={(e) => setProgressPct(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">
                Progress notes{progressPct < 100 ? ' (required)' : ' (optional)'}
              </Label>
              <Textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="light" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={saving} onClick={() => void handleSave()}>
            {saving ? <SubmitSpinner /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
