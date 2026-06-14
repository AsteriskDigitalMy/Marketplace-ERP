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
  fetchPendingAcceptanceReviews,
  getLeaderName,
} from '@/services/pms/project/project-service'
import type { ProjectRecord } from '@/services/pms/project/project-service'

export default function ProjectAcceptanceReviewInboxPage() {
  const { hasPermission } = usePmsAuth()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [leaders, setLeaders] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let data = await fetchPendingAcceptanceReviews()
      if (search) {
        const q = search.toLowerCase()
        data = data.filter(
          (p) => p.Code.toLowerCase().includes(q) || p.Name.toLowerCase().includes(q),
        )
      }
      setProjects(data)
      const names: Record<string, string> = {}
      await Promise.all(
        [...new Set(data.map((p) => p.LeaderId))].map(async (id) => {
          names[id] = await getLeaderName(id)
        }),
      )
      setLeaders(names)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <PermissionGate allowed={hasPermission('acceptance.approve')}>
      <PageHeader
        title="Project acceptance reviews"
        description="Final acceptance decisions for completed projects."
        actions={<Badge variant="secondary">{projects.length} pending</Badge>}
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AsyncState
        loading={loading}
        empty={!loading && projects.length === 0}
        emptyTitle="No pending acceptance reviews"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>Target achievement</TableHead>
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
                <TableCell>
                  <Badge variant="outline">
                    {p.AcceptanceApplication?.TargetAchievement ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.AcceptanceApplication?.SubmittedAt
                    ? new Date(p.AcceptanceApplication.SubmittedAt).toLocaleString()
                    : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="light" size="sm" asChild>
                    <Link to={`/pms/projects/acceptance-reviews/${p.Id}`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AsyncState>
    </PermissionGate>
  )
}
