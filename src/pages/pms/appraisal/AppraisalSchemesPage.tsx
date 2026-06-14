import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  APPRAISAL_DEPARTMENT_OPTIONS,
  cycleLabel,
  schemeStatusBadge,
} from '@/lib/pms/appraisal-helpers'
import type { AppraisalScheme } from '@/models/pms/operations'
import {
  archiveAppraisalScheme,
  fetchAppraisalSchemes,
} from '@/services/pms/appraisal/appraisal-scheme-service'

export default function AppraisalSchemesPage() {
  const { hasPermission } = usePmsAuth()
  const navigate = useNavigate()
  const [schemes, setSchemes] = useState<AppraisalScheme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('all')
  const [cycle, setCycle] = useState('all')
  const [departmentId, setDepartmentId] = useState('all')
  const [search, setSearch] = useState('')
  const [archiveTarget, setArchiveTarget] = useState<AppraisalScheme | null>(null)

  const load = async () => {
    setError(null)
    try {
      setSchemes(
        await fetchAppraisalSchemes({
          status: status as AppraisalScheme['Status'] | 'all',
          cycle: cycle as AppraisalScheme['Cycle'] | 'all',
          departmentId: departmentId === 'all' ? undefined : departmentId,
          search,
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load schemes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => void load(), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [status, cycle, departmentId, search])

  const scopeChips = (scheme: AppraisalScheme) => {
    const depts = scheme.Departments.map(
      (id) => APPRAISAL_DEPARTMENT_OPTIONS.find((d) => d.Id === id)?.Name ?? id.slice(0, 8),
    )
    return depts.slice(0, 2).join(', ')
  }

  return (
    <PermissionGate allowed={hasPermission('appraisal.manage')}>
      <PageHeader
        title="Appraisal Schemes"
        description="Configure differentiated performance appraisal schemes by department, role, and cycle."
        actions={
          <Button asChild>
            <Link to="/pms/appraisal/schemes/new">
              <Plus className="mr-2 size-4" />
              New scheme
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cycle} onValueChange={setCycle}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cycles</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="semi_annual">Semi-annual</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {APPRAISAL_DEPARTMENT_OPTIONS.map((d) => (
              <SelectItem key={d.Id} value={d.Id}>
                {d.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="max-w-xs"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={schemes.length === 0}
        emptyTitle="No appraisal schemes"
        emptyDescription="Create a scheme to define KPI weights and grade rules."
        emptyAction={
          <Button asChild>
            <Link to="/pms/appraisal/schemes/new">New scheme</Link>
          </Button>
        }
      >
        <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Indicators</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemes.map((scheme) => (
                <TableRow key={scheme.Id}>
                  <TableCell>
                    {scheme.Status === 'draft' ? (
                      <Link
                        to={`/pms/appraisal/schemes/${scheme.Id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {scheme.Name}
                      </Link>
                    ) : (
                      <Link
                        to={`/pms/appraisal/schemes/${scheme.Id}`}
                        className="font-medium hover:underline"
                      >
                        {scheme.Name}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{scopeChips(scheme)}</TableCell>
                  <TableCell>{cycleLabel(scheme.Cycle)}</TableCell>
                  <TableCell>{scheme.Indicators.length}</TableCell>
                  <TableCell>
                    <Badge variant={schemeStatusBadge(scheme.Status)}>{scheme.Status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    {scheme.Status === 'draft' ? (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => navigate(`/pms/appraisal/schemes/${scheme.Id}`)}
                      >
                        Edit
                      </Button>
                    ) : null}
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() =>
                        navigate(`/pms/appraisal/schemes/new?copyFrom=${scheme.Id}`)
                      }
                    >
                      Copy
                    </Button>
                    {scheme.Status !== 'archived' ? (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => setArchiveTarget(scheme)}
                      >
                        Archive
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <AlertDialog open={!!archiveTarget} onOpenChange={() => setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive scheme?</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget?.Name} will become read-only and unavailable for new cycles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!archiveTarget) return
                void archiveAppraisalScheme(archiveTarget.Id).then(() => {
                  toast.success('Scheme archived')
                  setArchiveTarget(null)
                  void load()
                })
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
