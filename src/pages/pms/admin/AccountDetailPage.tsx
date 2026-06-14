import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchAccount,
  resetAccountPassword,
  setAccountStatus,
  updateAccount,
} from '@/services/pms/admin/account-service'
import { fetchActiveDepartments } from '@/services/pms/admin/config-service'
import type { UserAccount } from '@/models/pms/identity'

const schema = z.object({
  EmployeeName: z.string().trim().min(1).max(200),
  DepartmentId: z.string().uuid(),
  Position: z.string().trim().min(1).max(100),
})

type FormValues = z.infer<typeof schema>

export default function AccountDetailPage() {
  const { id = '' } = useParams()
  const { hasPermission } = usePmsAuth()
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [departments, setDepartments] = useState<{ Id: string; Name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'disable' | 'activate' | 'reset' | null>(null)

  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, d] = await Promise.all([fetchAccount(id), fetchActiveDepartments()])
      setAccount(a)
      setDepartments(d)
      form.reset({
        EmployeeName: a.EmployeeName,
        DepartmentId: a.DepartmentId,
        Position: a.Position,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const updated = await updateAccount(id, values)
      setAccount(updated)
      toast.success('Account updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  })

  const runConfirmedAction = async () => {
    if (!confirmAction) {
      return
    }
    setSubmitting(true)
    try {
      if (confirmAction === 'reset') {
        const pwd = await resetAccountPassword(id)
        toast.success('Password reset', { description: `New password: ${pwd}`, duration: 10000 })
      } else {
        const status = confirmAction === 'activate' ? 'active' : 'disabled'
        const updated = await setAccountStatus(id, status)
        setAccount(updated)
        toast.success(status === 'active' ? 'Account activated' : 'Account disabled')
      }
      setConfirmAction(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('user.manage')}>
      <PageHeader
        title="Account Details"
        description={account?.LoginAccount}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/pms/admin/accounts">Back</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to={`/pms/admin/accounts/${id}/roles`}>Manage roles</Link>
            </Button>
          </>
        }
      />
      <AsyncState loading={loading} error={error} onRetry={() => void load()}>
        {account ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={account.Status === 'active' ? 'default' : 'secondary'}>
                  {account.Status}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={account.EmployeeId} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Employee name</Label>
                <Input id="name" {...form.register('EmployeeName')} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.watch('DepartmentId')}
                  onValueChange={(v) => form.setValue('DepartmentId', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.Id} value={d.Id}>
                        {d.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pos">Position</Label>
                <Input id="pos" {...form.register('Position')} />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? <SubmitSpinner /> : null}
                Save HR info
              </Button>
            </form>
            <div className="space-y-3 rounded-lg border p-6">
              <h3 className="font-medium">Lifecycle actions</h3>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setConfirmAction(account.Status === 'active' ? 'disable' : 'activate')}
              >
                {account.Status === 'active' ? 'Disable account' : 'Activate account'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setConfirmAction('reset')}
              >
                Reset password
              </Button>
            </div>
          </div>
        ) : null}
      </AsyncState>

      <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'disable' && 'Login will be terminated immediately for this user.'}
              {confirmAction === 'activate' && 'User will regain login access.'}
              {confirmAction === 'reset' && 'A new secure password will be generated and shown once.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void runConfirmedAction()} disabled={submitting}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
