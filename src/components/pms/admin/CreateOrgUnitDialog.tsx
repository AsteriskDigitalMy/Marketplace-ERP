import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import { formatTierLabel, getAllowedChildTiers } from '@/lib/pms/org-tier-rules'
import type { OrgTierType } from '@/models/common/enums'
import { createOrgUnit, validateSiblingName } from '@/services/pms/admin/org-service'
import type { OrgUnitTreeNode } from '@/services/pms/admin/org-service'
import { fetchProcessTags } from '@/services/pms/admin/org-service'
import { ApiError } from '@/lib/api/errors'
import { toast } from 'sonner'

const formSchema = z
  .object({
    Name: z.string().trim().min(1, 'Required').max(200),
    TierType: z.enum([
      'company',
      'plant',
      'department',
      'workshop',
      'line',
      'process',
      'shift',
    ]),
    ProcessTag: z.string().nullable(),
    SortOrder: z.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    if (data.TierType === 'process' && !data.ProcessTag) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Process tag is required',
        path: ['ProcessTag'],
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

interface CreateOrgUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent: OrgUnitTreeNode | null
  onCreated: () => void
}

export function CreateOrgUnitDialog({
  open,
  onOpenChange,
  parent,
  onCreated,
}: CreateOrgUnitDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [processTags, setProcessTags] = useState<{ Code: string; DisplayName: string }[]>([])

  const allowedTiers = getAllowedChildTiers(parent?.TierType ?? null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: '',
      TierType: allowedTiers[0],
      ProcessTag: null,
      SortOrder: 0,
    },
  })

  const tierType = form.watch('TierType')
  const isDirty = form.formState.isDirty

  useEffect(() => {
    if (open) {
      form.reset({
        Name: '',
        TierType: allowedTiers[0],
        ProcessTag: null,
        SortOrder: 0,
      })
      fetchProcessTags()
        .then(setProcessTags)
        .catch(() => toast.error('Failed to load process tags'))
    }
  }, [open, form, allowedTiers])

  useEffect(() => {
    if (tierType !== 'process') {
      form.setValue('ProcessTag', null)
    }
  }, [tierType, form])

  const handleClose = () => {
    if (isDirty) {
      setDiscardOpen(true)
      return
    }
    onOpenChange(false)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const parentId = parent?.Id ?? null
    if (!validateSiblingName(parentId, values.Name)) {
      form.setError('Name', { message: 'Name must be unique among siblings' })
      return
    }
    setSubmitting(true)
    try {
      const unit = await createOrgUnit({
        ParentId: parentId,
        Name: values.Name,
        TierType: values.TierType as OrgTierType,
        ProcessTag: values.TierType === 'process' ? values.ProcessTag : null,
        SortOrder: values.SortOrder,
      })
      toast.success(`Unit created — Code: ${unit.Code}`)
      onOpenChange(false)
      onCreated()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.Name) {
        form.setError('Name', { message: error.fieldErrors.Name })
      } else {
        toast.error(error instanceof Error ? error.message : 'Create failed')
      }
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Organizational Unit</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Parent node</Label>
              <Input
                readOnly
                disabled
                value={
                  parent
                    ? `${parent.Name} (${formatTierLabel(parent.TierType)})`
                    : 'Root (new company)'
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                placeholder="e.g. Cutting Workshop A"
                maxLength={200}
                {...form.register('Name', {
                  onBlur: (e) => {
                    const parentId = parent?.Id ?? null
                    if (!validateSiblingName(parentId, e.target.value)) {
                      form.setError('Name', { message: 'Name must be unique among siblings' })
                    }
                  },
                })}
              />
              {form.formState.errors.Name ? (
                <p className="text-sm text-destructive">{form.formState.errors.Name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Tier type</Label>
              <Select
                value={tierType}
                onValueChange={(v) => form.setValue('TierType', v as FormValues['TierType'], { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedTiers.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {formatTierLabel(tier)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {tierType === 'process' ? (
              <div className="space-y-2">
                <Label>Process business tag</Label>
                <Select
                  value={form.watch('ProcessTag') ?? ''}
                  onValueChange={(v) => form.setValue('ProcessTag', v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                  <SelectContent>
                    {processTags.map((tag) => (
                      <SelectItem key={tag.Code} value={tag.Code}>
                        {tag.DisplayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.ProcessTag ? (
                  <p className="text-sm text-destructive">{form.formState.errors.ProcessTag.message}</p>
                ) : null}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="sort-order">Sort order</Label>
              <Input
                id="sort-order"
                type="number"
                min={0}
                {...form.register('SortOrder', { valueAsNumber: true })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="light" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <SubmitSpinner /> : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your entered data will be lost if you leave this form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false)
                form.reset()
                onOpenChange(false)
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
