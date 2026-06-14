import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
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
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { fetchProjects, getLeaderName } from '@/services/pms/project/project-service'
import type { ProjectRecord } from '@/services/pms/project/project-service'
import type { Project } from '@/models/pms/project'

export default function ProjectsListPage() {
  const { hasPermission } = usePmsAuth()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [leaders, setLeaders] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjects({
        search: search || undefined,
        status: statusFilter !== 'all' ? (statusFilter as Project['Status']) : undefined,
      })
      setProjects(data)
      const names: Record<string, string> = {}
      await Promise.all(
        [...new Set(data.map((p) => p.LeaderId))].map(async (id) => {
          names[id] = await getLeaderName(id)
        }),
      )
      setLeaders(names)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const formatBudget = (n: number) =>
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(n)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Projects"
        description="Initiate, track, and close performance improvement projects."
        actions={
          hasPermission('project.initiate') ? (
            <Button asChild>
              <Link to="/pms/projects/new">
                <Plus className="mr-2 size-4" />
                New project
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Pending approval</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="pending_acceptance">Pending acceptance</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && projects.length === 0}
        emptyTitle="No projects found"
        emptyDescription="Start a new project or adjust filters."
        onRetry={load}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Planned</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.Id}>
                  <TableCell className="font-mono text-sm">{p.Code || '—'}</TableCell>
                  <TableCell className="font-medium">{p.Name}</TableCell>
                  <TableCell>{leaders[p.LeaderId] ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.Status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.PlannedStart} → {p.PlannedEnd}
                  </TableCell>
                  <TableCell>{formatBudget(p.BudgetAmount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/pms/projects/${p.Id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>
    </div>
  )
}
