import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { bulkImportAccounts } from '@/services/pms/admin/account-service'
import type { BulkImportResult } from '@/mocks/pms/store'

export default function AccountImportPage() {
  const { hasPermission } = usePmsAuth()
  const [fileName, setFileName] = useState('')
  const [results, setResults] = useState<BulkImportResult[] | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleImport = async () => {
    if (!fileName) {
      toast.error('Select a file first')
      return
    }
    setSubmitting(true)
    try {
      const mockRows = [
        {
          EmployeeName: 'Import User One',
          EmployeeId: `EMP-IMP-${Date.now()}`,
          DepartmentId: '10000000-0000-0000-0000-000000000003',
          Position: 'Operator',
          RoleIds: ['20000000-0000-0000-0000-000000000002'],
        },
        {
          EmployeeName: 'Duplicate Test',
          EmployeeId: 'EMP-0001',
          DepartmentId: '10000000-0000-0000-0000-000000000003',
          Position: 'Operator',
          RoleIds: ['20000000-0000-0000-0000-000000000002'],
        },
      ]
      const res = await bulkImportAccounts(mockRows)
      setResults(res)
      const ok = res.filter((r) => r.Status === 'success').length
      toast.success(`Import complete: ${ok} succeeded, ${res.length - ok} failed`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('user.manage')}>
      <PageHeader
        title="Bulk Account Import"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/pms/admin/accounts">Back</Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Download the official template, fill employee rows, then upload for line-by-line validation.
          </p>
          <Button type="button" variant="outline" onClick={() => toast.info('Template download started (mock)')}>
            Download template
          </Button>
          <div className="space-y-2">
            <Label htmlFor="file">Upload file</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            />
          </div>
          <Button type="button" onClick={() => void handleImport()} disabled={submitting || !fileName}>
            {submitting ? <SubmitSpinner /> : null}
            Import accounts
          </Button>
        </div>
        {results ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.Row}>
                    <TableCell>{r.Row}</TableCell>
                    <TableCell>{r.EmployeeId}</TableCell>
                    <TableCell>
                      <Badge variant={r.Status === 'success' ? 'default' : 'destructive'}>
                        {r.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.Error ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </PermissionGate>
  )
}
