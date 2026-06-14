import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Upload } from 'lucide-react'
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
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { useClientDataTable } from '@/hooks/use-client-data-table'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { fetchAccounts } from '@/services/pms/admin/account-service'
import type { UserAccount } from '@/models/pms/identity'

export default function AccountsPage() {
  const { hasPermission } = usePmsAuth()
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const debouncedSearch = useDebouncedValue(search)

  const filteredAccounts = accounts.filter((a) => {
    if (statusFilter !== 'all' && a.Status !== statusFilter) return false
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return (
      a.EmployeeName.toLowerCase().includes(q) ||
      a.LoginAccount.toLowerCase().includes(q) ||
      a.EmployeeId.toLowerCase().includes(q) ||
      a.Position.toLowerCase().includes(q)
    )
  })

  const table = useClientDataTable(filteredAccounts, { pageSize: 10 })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setAccounts(await fetchAccounts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <PermissionGate allowed={hasPermission('user.manage')}>
      <PageHeader
        title="System Accounts"
        description="Efficient account organization with role assignments and lifecycle controls."
        actions={
          <>
            <Button asChild variant="light" size="sm">
              <Link to="/pms/admin/accounts/import">
                <Upload className="mr-2 size-4" />
                Bulk import
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/pms/admin/accounts/new">
                <Plus className="mr-2 size-4" />
                New account
              </Link>
            </Button>
          </>
        }
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={false}>
        <DataTable
          title="Accounts"
          count={filteredAccounts.length}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search accounts…"
          filters={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
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
                <TableHead>Account</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No accounts match your search.
                  </TableCell>
                </TableRow>
              ) : (
                table.pageData.map((a) => (
                  <TableRow key={a.Id}>
                    <TableCell>
                      <TableCellPrimary
                        title={a.EmployeeName}
                        subtitle={a.EmployeeId}
                        leading={<TableAvatar label={a.EmployeeName} />}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.LoginAccount}</TableCell>
                    <TableCell>{a.Position}</TableCell>
                    <TableCell>
                      <Badge variant={a.Status === 'active' ? 'success' : 'secondary'}>
                        {a.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="light" size="sm">
                        <Link to={`/pms/admin/accounts/${a.Id}`}>Manage</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTable>
      </AsyncState>
    </PermissionGate>
  )
}
