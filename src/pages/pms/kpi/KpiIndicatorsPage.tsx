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
import { fetchKpiIndicators, fetchKpiCategories } from '@/services/pms/kpi/kpi-service'
import type { KpiIndicator } from '@/models/pms/kpi'

export default function KpiIndicatorsPage() {
  const { hasPermission } = usePmsAuth()
  const [indicators, setIndicators] = useState<KpiIndicator[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, cats] = await Promise.all([
        fetchKpiIndicators({
          search: search || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? (statusFilter as KpiIndicator['Status']) : undefined,
        }),
        fetchKpiCategories(),
      ])
      setIndicators(data)
      setCategories(cats)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load indicators')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-4">
      <PageHeader
        title="KPI Indicator Library"
        description="Manage enterprise KPI definitions, formulas, and versions."
        actions={
          hasPermission('kpi.manage') ? (
            <Button asChild>
              <Link to="/pms/kpi/indicators/new">
                <Plus className="mr-2 size-4" />
                New indicator
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && indicators.length === 0}
        emptyTitle="No indicators found"
        emptyDescription="Create your first KPI indicator or adjust filters."
        emptyAction={
          hasPermission('kpi.manage') ? (
            <Button asChild>
              <Link to="/pms/kpi/indicators/new">Create first indicator</Link>
            </Button>
          ) : null
        }
        onRetry={load}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicators.map((ind) => (
                <TableRow key={ind.Id}>
                  <TableCell className="font-mono text-sm">{ind.Code}</TableCell>
                  <TableCell className="font-medium">{ind.Name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ind.Category}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{ind.Cycle}</TableCell>
                  <TableCell>
                    <Badge variant={ind.Status === 'enabled' ? 'default' : 'outline'}>
                      {ind.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{ind.Version}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="light" size="sm" asChild>
                      <Link to={`/pms/kpi/indicators/${ind.Id}`}>View</Link>
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
