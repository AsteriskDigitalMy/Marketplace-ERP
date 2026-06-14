import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { fetchAccounts } from '@/services/pms/admin/account-service'
import type { UserAccount } from '@/models/pms/identity'

export default function AccountsPage() {
  const { hasPermission } = usePmsAuth()
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        description="Employee accounts and login credentials"
        actions={
          <>
            <Button asChild variant="outline" size="sm">
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
      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={accounts.length === 0}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.Id}>
                  <TableCell className="font-mono text-sm">{a.EmployeeId}</TableCell>
                  <TableCell>{a.EmployeeName}</TableCell>
                  <TableCell>{a.LoginAccount}</TableCell>
                  <TableCell>{a.Position}</TableCell>
                  <TableCell>
                    <Badge variant={a.Status === 'active' ? 'default' : 'secondary'}>
                      {a.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="light" size="sm">
                      <Link to={`/pms/admin/accounts/${a.Id}`}>Manage</Link>
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
