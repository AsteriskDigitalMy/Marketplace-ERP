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
  const debouncedSearch = useDebouncedValue(search)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, cats] = await Promise.all([
        fetchKpiIndicators({
          search: debouncedSearch || undefined,
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
  }, [debouncedSearch, categoryFilter, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const table = useClientDataTable(indicators, { pageSize: 10 })

  return (
    <div className="space-y-6">
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
        <DataTable
          title="Indicators"
          count={indicators.length}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by code or name…"
          filters={
            <>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[180px]">
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
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </>
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
                <TableHead>Indicator</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.pageData.map((ind) => (
                <TableRow key={ind.Id}>
                  <TableCell>
                    <TableCellPrimary
                      title={ind.Name}
                      subtitle={ind.Code}
                      leading={<TableAvatar label={ind.Name} />}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ind.Category}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{ind.Cycle}</TableCell>
                  <TableCell>
                    <Badge variant={ind.Status === 'enabled' ? 'success' : 'outline'}>
                      {ind.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{ind.Version}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="light" size="sm" asChild>
                      <Link to={`/pms/kpi/indicators/${ind.Id}`}>View</Link>
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
