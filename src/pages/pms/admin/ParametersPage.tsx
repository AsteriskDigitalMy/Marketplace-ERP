import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { fetchParameters, updateParameter } from '@/services/pms/admin/config-service'
import type { SystemParameterRecord } from '@/mocks/pms/store'

export default function ParametersPage() {
  const { hasPermission } = usePmsAuth()
  const [params, setParams] = useState<SystemParameterRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<SystemParameterRecord | null>(null)
  const [value, setValue] = useState<string>('')
  const [scheduled, setScheduled] = useState(false)
  const [effectiveAt, setEffectiveAt] = useState('')
  const [coreConfirmOpen, setCoreConfirmOpen] = useState(false)
  const [historyParam, setHistoryParam] = useState<SystemParameterRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setParams(await fetchParameters())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parameters')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openEdit = (param: SystemParameterRecord) => {
    setEditing(param)
    setValue(String(param.Value))
    setScheduled(false)
    setEffectiveAt(new Date().toISOString().slice(0, 16))
  }

  const parseValue = (): string | number | boolean => {
    if (!editing) {
      return ''
    }
    if (editing.DataType === 'number') {
      return Number(value)
    }
    if (editing.DataType === 'boolean') {
      return value === 'true'
    }
    return value
  }

  const commitSave = async () => {
    if (!editing) {
      return
    }
    setSubmitting(true)
    try {
      const effective = scheduled ? new Date(effectiveAt).toISOString() : new Date().toISOString()
      const updated = await updateParameter(editing.Code, parseValue(), effective)
      setParams((prev) => prev.map((p) => (p.Code === updated.Code ? updated : p)))
      toast.success('Parameter updated')
      setEditing(null)
      setCoreConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSave = () => {
    if (!editing) {
      return
    }
    if (editing.DataType === 'number' && Number.isNaN(Number(value))) {
      toast.error('Value must be a number')
      return
    }
    if (editing.IsCore) {
      setCoreConfirmOpen(true)
      return
    }
    void commitSave()
  }

  return (
    <PermissionGate allowed={hasPermission('parameter.manage')}>
      <PageHeader title="System Parameters" description="Global business control parameters" />
      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={params.length === 0}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {params.map((param) => (
                <TableRow key={param.Code}>
                  <TableCell className="font-mono text-sm">
                    {param.Code}
                    {param.IsCore ? (
                      <Badge variant="secondary" className="ml-2">
                        core
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{param.Name}</TableCell>
                  <TableCell>{param.DataType}</TableCell>
                  <TableCell>{String(param.Value)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(param.EffectiveAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button type="button" variant="light" size="sm" onClick={() => openEdit(param)}>
                      Edit
                    </Button>
                    <Button type="button" variant="light" size="sm" onClick={() => setHistoryParam(param)}>
                      History
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit parameter — {editing?.Code}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="val">Value ({editing.DataType})</Label>
                {editing.DataType === 'boolean' ? (
                  <select
                    id="val"
                    className="flex h-9 w-full rounded-md border px-3 text-sm"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <Input
                    id="val"
                    type={editing.DataType === 'number' ? 'number' : editing.DataType === 'date' ? 'datetime-local' : 'text'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={scheduled} onCheckedChange={setScheduled} id="sched" />
                <Label htmlFor="sched">Schedule effective time</Label>
              </div>
              {scheduled ? (
                <div className="space-y-2">
                  <Label htmlFor="eff">Effective at</Label>
                  <Input
                    id="eff"
                    type="datetime-local"
                    value={effectiveAt}
                    onChange={(e) => setEffectiveAt(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="light" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={submitting}>
              {submitting ? <SubmitSpinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={coreConfirmOpen} onOpenChange={setCoreConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modify core parameter?</AlertDialogTitle>
            <AlertDialogDescription>
              This parameter affects critical business rules. Confirm you want to apply this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void commitSave()} disabled={submitting}>
              Confirm change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={!!historyParam} onOpenChange={(o) => !o && setHistoryParam(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Change log — {historyParam?.Code}</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-3 text-sm">
            {historyParam?.ChangeLog.map((entry, i) => (
              <li key={`${entry.At}-${i}`} className="rounded border p-2">
                <p className="text-xs text-muted-foreground">{new Date(entry.At).toLocaleString()} — {entry.Actor}</p>
                <p>
                  {entry.OldValue} → {entry.NewValue}
                </p>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </PermissionGate>
  )
}
