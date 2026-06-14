import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { Checkbox } from '@/components/ui/checkbox'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { createAccount, fetchRoles } from '@/services/pms/admin/account-service'
import { fetchActiveDepartments } from '@/services/pms/admin/config-service'
import type { SystemRole } from '@/models/pms/identity'
import { ApiError } from '@/lib/api/errors'

const schema = z.object({
  EmployeeName: z.string().trim().min(1).max(200),
  EmployeeId: z.string().trim().min(1).max(50),
  DepartmentId: z.string().uuid(),
  Position: z.string().trim().min(1).max(100),
  InitialPassword: z.string().min(8, 'At least 8 characters'),
  RoleIds: z.array(z.string().uuid()).min(1, 'Select at least one role'),
})

type FormValues = z.infer<typeof schema>

export default function AccountCreatePage() {
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [roles, setRoles] = useState<SystemRole[]>([])
  const [departments, setDepartments] = useState<{ Id: string; Name: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      EmployeeName: '',
      EmployeeId: '',
      DepartmentId: '',
      Position: '',
      InitialPassword: '',
      RoleIds: [],
    },
  })

  useEffect(() => {
    void Promise.all([fetchRoles(), fetchActiveDepartments()]).then(([r, d]) => {
      setRoles(r)
      setDepartments(d)
      if (d[0]) {
        form.setValue('DepartmentId', d[0].Id)
      }
    })
  }, [form])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const { account, generatedPassword } = await createAccount(values)
      toast.success(`Account created. Login: ${account.LoginAccount}`, {
        description: `Initial password: ${generatedPassword}`,
        duration: 10000,
      })
      navigate(`/pms/admin/accounts/${account.Id}`)
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.EmployeeId) {
        form.setError('EmployeeId', { message: err.fieldErrors.EmployeeId })
      } else {
        toast.error(err instanceof Error ? err.message : 'Create failed')
      }
    } finally {
      setSubmitting(false)
    }
  })

  const selectedRoles = form.watch('RoleIds')

  return (
    <PermissionGate allowed={hasPermission('user.manage')}>
      <PageHeader
        title="Create Account"
        actions={
          <Button asChild variant="light" size="sm">
            <Link to="/pms/admin/accounts">Back</Link>
          </Button>
        }
      />
      <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="ename">Employee name</Label>
          <Input id="ename" {...form.register('EmployeeName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eid">Employee ID</Label>
          <Input id="eid" {...form.register('EmployeeId')} />
          {form.formState.errors.EmployeeId ? (
            <p className="text-sm text-destructive">{form.formState.errors.EmployeeId.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={form.watch('DepartmentId')}
            onValueChange={(v) => form.setValue('DepartmentId', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
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
          <Label htmlFor="position">Position</Label>
          <Input id="position" {...form.register('Position')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Initial password</Label>
          <Input id="password" type="password" {...form.register('InitialPassword')} />
          {form.formState.errors.InitialPassword ? (
            <p className="text-sm text-destructive">{form.formState.errors.InitialPassword.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>Roles</Label>
          <div className="space-y-2 rounded-md border p-3">
            {roles.map((role) => (
              <label key={role.Id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedRoles.includes(role.Id)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...selectedRoles, role.Id]
                      : selectedRoles.filter((id) => id !== role.Id)
                    form.setValue('RoleIds', next, { shouldValidate: true })
                  }}
                />
                {role.Name}
              </label>
            ))}
          </div>
          {form.formState.errors.RoleIds ? (
            <p className="text-sm text-destructive">{form.formState.errors.RoleIds.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? <SubmitSpinner /> : null}
          Create account
        </Button>
      </form>
    </PermissionGate>
  )
}
