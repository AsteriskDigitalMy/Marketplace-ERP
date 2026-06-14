import { useEffect, useState } from 'react'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { fetchOperationLog, fetchOperationLogs } from '@/services/pms/admin/config-service'
import type { OperationLog } from '@/models/pms/configuration'
import { toast } from 'sonner'

export default function OperationLogsPage() {
  const { hasPermission } = usePmsAuth()
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [operator, setOperator] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [ip, setIp] = useState('')
  const [detail, setDetail] = useState<OperationLog | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setLogs(
        await fetchOperationLogs({
          operator: operator || undefined,
          businessType: businessType || undefined,
          ip: ip || undefined,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openDetail = async (id: string) => {
    try {
      setDetail(await fetchOperationLog(id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load detail')
    }
  }

  return (
    <PermissionGate allowed={hasPermission('audit.read')}>
      <PageHeader
        title="Operation Logs"
        description="Immutable audit trail — no delete or tamper actions"
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => toast.info('Export started (mock CSV)')}>
            Export
          </Button>
        }
      />
      <div className="mb-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="op">Operator</Label>
          <Input id="op" value={operator} onChange={(e) => setOperator(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="bt">Business type</Label>
          <Input id="bt" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="org, user, role…" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ip">Login IP</Label>
          <Input id="ip" value={ip} onChange={(e) => setIp(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="button" className="w-full" onClick={() => void load()}>
            Search
          </Button>
        </div>
      </div>
      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={logs.length === 0}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>IP</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.Id}>
                  <TableCell className="text-xs">{new Date(log.OperatedAt).toLocaleString()}</TableCell>
                  <TableCell>{log.OperatorAccount}</TableCell>
                  <TableCell>{log.BusinessType}</TableCell>
                  <TableCell>{log.TargetLabel}</TableCell>
                  <TableCell>{log.Action}</TableCell>
                  <TableCell className="font-mono text-xs">{log.LoginIp}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void openDetail(log.Id)}>
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AsyncState>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Log detail</SheetTitle>
          </SheetHeader>
          {detail ? (
            <div className="mt-4 space-y-4 text-sm">
              <p>
                <span className="text-muted-foreground">Action:</span> {detail.Action} on {detail.TargetLabel}
              </p>
              <div>
                <p className="mb-1 font-medium">Before</p>
                <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(detail.BeforeData, null, 2) ?? 'null'}
                </pre>
              </div>
              <div>
                <p className="mb-1 font-medium">After</p>
                <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(detail.AfterData, null, 2) ?? 'null'}
                </pre>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </PermissionGate>
  )
}
