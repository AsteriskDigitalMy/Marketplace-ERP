import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { fetchDataReviews } from '@/services/pms/data-collection/data-collection-service'
import type { DataReviewRecord } from '@/services/pms/data-collection/data-collection-service'

export default function DataReviewQueuePage() {
  const { hasPermission } = usePmsAuth()
  const [reviews, setReviews] = useState<DataReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [level, setLevel] = useState<string>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const status = tab === 'pending' ? 'pending_review' : undefined
      let data = await fetchDataReviews({
        status,
        level: level !== 'all' ? (level as 'team' | 'department') : undefined,
        search: search || undefined,
      })
      if (tab === 'completed') {
        data = data.filter((r) => r.Status === 'approved' || r.Status === 'rejected')
      }
      setReviews(data)
    } finally {
      setLoading(false)
    }
  }, [tab, level, search])

  useEffect(() => {
    void load()
  }, [load])

  const pendingCount = reviews.filter((r) => r.Status === 'pending_review').length

  return (
    <PermissionGate allowed={hasPermission('data.review')}>
      <PageHeader
        title="Data review queue"
        description="Multi-level review of submitted filling records."
        actions={<Badge variant="secondary">{pendingCount} pending</Badge>}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search submitter or indicator…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="light" onClick={() => { setLevel('all'); setSearch('') }}>
              Reset filters
            </Button>
          </div>

          <AsyncState
            loading={loading}
            empty={!loading && reviews.length === 0}
            emptyTitle="No records pending review"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record</TableHead>
                  <TableHead>Indicator</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.RecordId}>
                    <TableCell className="font-mono text-xs">{r.RecordId.slice(0, 8)}…</TableCell>
                    <TableCell>{r.IndicatorName}</TableCell>
                    <TableCell>{r.SubmitterName}</TableCell>
                    <TableCell>{r.PeriodLabel}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.ReviewLevel}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.SubmittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.Status === 'rejected'
                            ? 'destructive'
                            : r.Status === 'approved'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {r.Status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="light" size="sm" asChild>
                        <Link to={`/pms/data-collection/reviews/${r.RecordId}`}>Review</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AsyncState>
        </TabsContent>
      </Tabs>
    </PermissionGate>
  )
}
