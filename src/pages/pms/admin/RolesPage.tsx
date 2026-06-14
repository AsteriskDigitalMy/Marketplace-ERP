import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { deleteRole, fetchRoles, saveRole } from '@/services/pms/admin/account-service'
import type { SystemRole } from '@/models/pms/identity'
import type { DataScope } from '@/models/common/enums'

const MENU_OPTIONS = ['pms.admin', 'pms.kpi', 'pms.projects', 'pms.appraisal', 'pms.alerts']

export default function RolesPage() {
  const { hasPermission } = usePmsAuth()
  const [roles, setRoles] = useState<SystemRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<SystemRole | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [remarks, setRemarks] = useState('')
  const [menus, setMenus] = useState<string[]>([])
  const [dataScope, setDataScope] = useState<DataScope>('company')
  const [customFilter, setCustomFilter] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setRoles(await fetchRoles())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openNew = () => {
    setEditing(null)
    setName('')
    setRemarks('')
    setMenus(['pms.admin'])
    setDataScope('company')
    setCustomFilter('')
    setEditorOpen(true)
  }

  const openEdit = (role: SystemRole) => {
    setEditing(role)
    setName(role.Name)
    setRemarks(role.Remarks ?? '')
    setMenus(role.MenuPermissions)
    setDataScope(role.DataScope)
    setCustomFilter(role.CustomFilter ?? '')
    setEditorOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Role name is required')
      return
    }
    if (menus.length === 0) {
      toast.error('Select at least one menu permission')
      return
    }
    if (dataScope === 'custom' && !customFilter.trim()) {
      toast.error('Custom filter is required for custom data scope')
      return
    }
    setSubmitting(true)
    try {
      await saveRole(
        {
          Name: name.trim(),
          Remarks: remarks.trim() || null,
          MenuPermissions: menus,
          ButtonPermissions: Object.fromEntries(menus.map((m) => [m, ['view', 'edit', 'export']])),
          DataScope: dataScope,
          CustomFilter: dataScope === 'custom' ? customFilter : null,
        },
        editing?.Id,
      )
      toast.success(editing ? 'Role updated' : 'Role created')
      setEditorOpen(false)
      void load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (role: SystemRole) => {
    try {
      await deleteRole(role.Id)
      toast.success('Role deleted')
      void load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <PermissionGate allowed={hasPermission('role.manage')}>
      <PageHeader
        title="System Roles"
        description="Menu, button, and data-scope permissions"
        actions={
          <Button type="button" size="sm" onClick={openNew}>
            <Plus className="mr-2 size-4" />
            New role
          </Button>
        }
      />
      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={roles.length === 0}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Data scope</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.Id}>
                  <TableCell>
                    <div className="font-medium">{role.Name}</div>
                    <div className="text-xs text-muted-foreground">{role.Remarks}</div>
                  </TableCell>
                  <TableCell>{role.DataScope}</TableCell>
                  <TableCell>{role.BoundUserCount}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button type="button" variant="light" size="sm" onClick={() => openEdit(role)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={role.BoundUserCount > 0}
                      onClick={() => void handleDelete(role)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit role' : 'New role'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rname">Role name</Label>
              <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Menu permissions</Label>
              <div className="space-y-2 rounded-md border p-3">
                {MENU_OPTIONS.map((menu) => (
                  <label key={menu} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={menus.includes(menu)}
                      onCheckedChange={(c) =>
                        setMenus((prev) =>
                          c ? [...prev, menu] : prev.filter((m) => m !== menu),
                        )
                      }
                    />
                    {menu}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data visibility scope</Label>
              <Select value={dataScope} onValueChange={(v) => setDataScope(v as DataScope)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Entire company</SelectItem>
                  <SelectItem value="department">Current department</SelectItem>
                  <SelectItem value="individual">Individual only</SelectItem>
                  <SelectItem value="custom">Custom filter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dataScope === 'custom' ? (
              <div className="space-y-2">
                <Label htmlFor="filter">Custom filter</Label>
                <Textarea id="filter" value={customFilter} onChange={(e) => setCustomFilter(e.target.value)} />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="light" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={submitting}>
              {submitting ? <SubmitSpinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
