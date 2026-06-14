import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { bindUserRoles, fetchAccount, fetchRoles } from '@/services/pms/admin/account-service'
import type { SystemRole } from '@/models/pms/identity'

export default function AccountRolesPage() {
  const { id = '' } = useParams()
  const { hasPermission } = usePmsAuth()
  const [accountName, setAccountName] = useState('')
  const [roles, setRoles] = useState<SystemRole[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [mode, setMode] = useState<'add' | 'replace'>('replace')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [account, allRoles] = await Promise.all([fetchAccount(id), fetchRoles()])
        setAccountName(account.EmployeeName)
        setRoles(allRoles)
        setSelected(account.RoleIds)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const save = async () => {
    if (selected.length === 0) {
      toast.error('Select at least one role')
      return
    }
    setSubmitting(true)
    try {
      await bindUserRoles(id, selected)
      toast.success('Roles updated — permissions refresh immediately (mock)')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('user.manage')}>
      <PageHeader
        title="Role Binding"
        description={accountName}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to={`/pms/admin/accounts/${id}`}>Back to account</Link>
          </Button>
        }
      />
      <AsyncState loading={loading} error={error}>
        <div className="mx-auto max-w-lg space-y-6 rounded-lg border p-6">
          <div className="space-y-2">
            <Label>Batch mode (for multi-select workflows)</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'add' | 'replace')}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace">Replace existing roles</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add">Add to existing roles</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Business roles</Label>
            <div className="space-y-2 rounded-md border p-3">
              {roles.map((role) => (
                <label key={role.Id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(role.Id)}
                    onCheckedChange={(checked) => {
                      setSelected((prev) => {
                        if (checked) {
                          return mode === 'add' ? [...new Set([...prev, role.Id])] : [...prev.filter((x) => x !== role.Id), role.Id]
                        }
                        return prev.filter((x) => x !== role.Id)
                      })
                    }}
                  />
                  <span>{role.Name}</span>
                  <span className="text-xs text-muted-foreground">{role.Remarks}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="button" onClick={() => void save()} disabled={submitting}>
            {submitting ? <SubmitSpinner /> : null}
            Save role binding
          </Button>
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
