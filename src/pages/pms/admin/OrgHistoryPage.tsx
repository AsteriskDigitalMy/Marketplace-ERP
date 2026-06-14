import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchOrgUnit,
  fetchOrgVersions,
  rollbackOrgVersion,
} from '@/services/pms/admin/org-service'
import type { OrgVersion } from '@/models/pms/organization'

export default function OrgHistoryPage() {
  const { id = '' } = useParams()
  const { hasPermission } = usePmsAuth()
  const [versions, setVersions] = useState<OrgVersion[]>([])
  const [unitName, setUnitName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<OrgVersion | null>(null)
  const [rollbackId, setRollbackId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [unit, list] = await Promise.all([fetchOrgUnit(id), fetchOrgVersions(id)])
      setUnitName(unit.Name)
      setVersions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const confirmRollback = async () => {
    if (!rollbackId) {
      return
    }
    setSubmitting(true)
    try {
      await rollbackOrgVersion(rollbackId)
      toast.success('Organization structure rolled back')
      setRollbackId(null)
      void load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rollback failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('org.manage')}>
      <PageHeader
        title="Version History"
        description={unitName}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to={`/pms/admin/org/${id}/edit`}>Back to edit</Link>
          </Button>
        }
      />
      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={versions.length === 0} emptyTitle="No versions recorded yet">
        <ol className="relative space-y-6 border-l pl-6">
          {versions.map((v) => (
            <li key={v.Id} className="relative">
              <span className="absolute -left-[1.6rem] top-1 size-3 rounded-full bg-primary" />
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Version {v.Version}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(v.SnapshotAt).toLocaleString()} — {v.Summary}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setPreview(v)}>
                    Preview snapshot
                  </Button>
                  <Button type="button" size="sm" onClick={() => setRollbackId(v.Id)}>
                    Restore this version
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </AsyncState>

      <Sheet open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Snapshot v{preview?.Version}</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 max-h-[70vh] space-y-1 overflow-y-auto text-sm">
            {preview?.TreeSnapshot.map((u) => (
              <li key={u.Id} className="text-muted-foreground">
                {u.Code} — {u.Name} ({u.TierType})
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!rollbackId} onOpenChange={(o) => !o && setRollbackId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore historical version?</AlertDialogTitle>
            <AlertDialogDescription>
              The entire organization structure will be replaced with the selected snapshot. A new change log entry will be created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmRollback()} disabled={submitting}>
              {submitting ? <SubmitSpinner /> : null}
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
