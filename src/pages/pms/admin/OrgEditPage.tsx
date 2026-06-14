import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { formatTierLabel, getAllowedChildTiers } from '@/lib/pms/org-tier-rules'
import {
  fetchOrgEditMeta,
  fetchOrgUnit,
  fetchProcessTags,
  setOrgUnitDisabled,
  updateOrgUnit,
  validateSiblingName,
} from '@/services/pms/admin/org-service'
import type { OrgUnit } from '@/models/pms/organization'
import type { OrgUnitEditMeta } from '@/mocks/pms/store'
import { ApiError } from '@/lib/api/errors'

const formSchema = z.object({
  Name: z.string().trim().min(1).max(200),
  TierType: z.enum(['company', 'plant', 'department', 'workshop', 'line', 'process', 'shift']),
  ProcessTag: z.string().nullable(),
  SortOrder: z.number().int().min(0),
})

type FormValues = z.infer<typeof formSchema>

export default function OrgEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [unit, setUnit] = useState<OrgUnit | null>(null)
  const [meta, setMeta] = useState<OrgUnitEditMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [processTags, setProcessTags] = useState<{ Code: string; DisplayName: string }[]>([])

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) })
  const tierType = form.watch('TierType')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [u, m, tags] = await Promise.all([
        fetchOrgUnit(id),
        fetchOrgEditMeta(id),
        fetchProcessTags(),
      ])
      setUnit(u)
      setMeta(m)
      setProcessTags(tags)
      form.reset({
        Name: u.Name,
        TierType: u.TierType,
        ProcessTag: u.ProcessTag,
        SortOrder: u.SortOrder,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const onSubmit = form.handleSubmit(async (values) => {
    if (!unit) {
      return
    }
    if (!validateSiblingName(unit.ParentId, values.Name, unit.Id)) {
      form.setError('Name', { message: 'Name must be unique among siblings' })
      return
    }
    setSubmitting(true)
    try {
      await updateOrgUnit(id, {
        Name: values.Name,
        TierType: values.TierType,
        ProcessTag: values.TierType === 'process' ? values.ProcessTag : null,
        SortOrder: values.SortOrder,
      })
      toast.success('Organization updated')
      navigate('/pms/admin/org')
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.Name) {
        form.setError('Name', { message: err.fieldErrors.Name })
      } else {
        toast.error(err instanceof Error ? err.message : 'Update failed')
      }
    } finally {
      setSubmitting(false)
    }
  })

  const handleDisable = async () => {
    if (!unit) {
      return
    }
    setSubmitting(true)
    try {
      await setOrgUnitDisabled(id, !unit.IsDisabled)
      toast.success(unit.IsDisabled ? 'Organization enabled' : 'Organization disabled')
      setDisableOpen(false)
      navigate('/pms/admin/org')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const parentTier = unit?.ParentId ? null : null
  void parentTier
  const allowedTiers = unit
    ? getAllowedChildTiers(
        unit.ParentId
          ? unit.TierType
          : null,
      )
    : []

  return (
    <PermissionGate allowed={hasPermission('org.manage')}>
      <PageHeader
        title="Edit Organization Unit"
        description={unit?.Code}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/pms/admin/org">Back to tree</Link>
          </Button>
        }
      />
      <AsyncState loading={loading} error={error} onRetry={() => void load()}>
        {unit && meta ? (
          <div className="mx-auto max-w-xl space-y-6">
            {meta.ChildCount > 0 && !unit.IsDisabled ? (
              <Alert>
                <AlertTitle>Sub-organizations present</AlertTitle>
                <AlertDescription>
                  Disabling this unit will hide {meta.ChildCount} descendant unit(s) from selectors.
                </AlertDescription>
              </Alert>
            ) : null}
            <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization name</Label>
                <Input id="name" {...form.register('Name')} />
                {form.formState.errors.Name ? (
                  <p className="text-sm text-destructive">{form.formState.errors.Name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Tier type</Label>
                <Select
                  value={tierType}
                  onValueChange={(v) => form.setValue('TierType', v as FormValues['TierType'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[unit.TierType, ...allowedTiers.filter((t) => t !== unit.TierType)].map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {formatTierLabel(tier)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {tierType === 'process' ? (
                <div className="space-y-2">
                  <Label>Process tag</Label>
                  <Select
                    value={form.watch('ProcessTag') ?? ''}
                    onValueChange={(v) => form.setValue('ProcessTag', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent>
                      {processTags.map((t) => (
                        <SelectItem key={t.Code} value={t.Code}>
                          {t.DisplayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="sort">Sort order</Label>
                <Input id="sort" type="number" min={0} {...form.register('SortOrder', { valueAsNumber: true })} />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <SubmitSpinner /> : null}
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant={unit.IsDisabled ? 'default' : 'destructive'}
                  disabled={submitting}
                  onClick={() => setDisableOpen(true)}
                >
                  {unit.IsDisabled ? 'Enable unit' : 'Disable unit'}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </AsyncState>

      <AlertDialog open={disableOpen} onOpenChange={setDisableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {unit?.IsDisabled ? 'Enable organization?' : 'Disable organization?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {unit?.IsDisabled
                ? 'This unit will participate in statistics and appear in selectors again.'
                : 'This unit will no longer participate in data statistics. Descendants will be hidden synchronously.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDisable()}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
