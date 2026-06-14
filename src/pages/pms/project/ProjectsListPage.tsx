import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { DataTable, DataTablePagination } from '@/components/layout/DataTable'
import { TableAvatar, TableCellPrimary } from '@/components/layout/TableCellPrimary'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { useClientDataTable } from '@/hooks/use-client-data-table'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
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
  const debouncedSearch = useDebouncedValue(search)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProjects({
        search: debouncedSearch || undefined,
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
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const table = useClientDataTable(projects, { pageSize: 10 })

  const formatBudget = (n: number) =>
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(n)

  return (
    <div className="space-y-6">
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

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && projects.length === 0}
        emptyTitle="No projects found"
        emptyDescription="Start a new project or adjust filters."
        onRetry={load}
      >
        <DataTable
          title="Projects"
          count={projects.length}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by code or name…"
          filters={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[200px]">
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
          }
          footer={
            <DataTablePagination
              page={table.page}
              pageSize={table.pageSize}
              totalItems={table.totalItems}
              totalPages={table.totalPages}
              rangeStart={table.rangeStart}
              rangeEnd={table.rangeEnd}
              onPageChange={table.setPage}
              onPageSizeChange={table.setPageSize}
            />
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Planned</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.pageData.map((p) => (
                <TableRow key={p.Id}>
                  <TableCell>
                    <TableCellPrimary
                      title={p.Name}
                      subtitle={p.Code || 'Draft project'}
                      leading={<TableAvatar label={p.Name} />}
                    />
                  </TableCell>
                  <TableCell>{leaders[p.LeaderId] ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.Status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.PlannedStart} → {p.PlannedEnd}
                  </TableCell>
                  <TableCell className="font-medium">{formatBudget(p.BudgetAmount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="light" size="sm" asChild>
                      <Link to={`/pms/projects/${p.Id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </AsyncState>
    </div>
  )
}
