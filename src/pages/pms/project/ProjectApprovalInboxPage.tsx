import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchPendingApprovals,
  getLeaderName,
} from '@/services/pms/project/project-service'
import type { ProjectRecord } from '@/services/pms/project/project-service'

export default function ProjectApprovalInboxPage() {
  const { hasPermission } = usePmsAuth()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [leaders, setLeaders] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data = await fetchPendingApprovals()
      if (search) {
        const q = search.toLowerCase()
        data = data.filter(
          (p) => p.Code.toLowerCase().includes(q) || p.Name.toLowerCase().includes(q),
        )
      }
      data.sort((a, b) => (b.SubmittedAt ?? '').localeCompare(a.SubmittedAt ?? ''))
      setProjects(data)
      const names: Record<string, string> = {}
      await Promise.all(
        [...new Set(data.map((p) => p.LeaderId))].map(async (id) => {
          names[id] = await getLeaderName(id)
        }),
      )
      setLeaders(names)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    void load()
  }, [load])

  const formatBudget = (n: number) =>
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(n)

  return (
    <PermissionGate allowed={hasPermission('project.approve')}>
      <PageHeader
        title="Project initiation approvals"
        description="Review pending project applications."
        actions={
          <Badge variant="secondary">{projects.length} pending</Badge>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && projects.length === 0}
        emptyTitle="No pending approvals"
        emptyDescription="All initiation applications have been reviewed."
        onRetry={load}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.Id}>
                  <TableCell className="font-mono text-sm">{p.Code}</TableCell>
                  <TableCell>{p.Name}</TableCell>
                  <TableCell>{leaders[p.LeaderId]}</TableCell>
                  <TableCell>{formatBudget(p.BudgetAmount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.SubmittedAt ? new Date(p.SubmittedAt).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="light" size="sm" asChild>
                      <Link to={`/pms/projects/approvals/${p.Id}`}>Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>
    </PermissionGate>
  )
}
