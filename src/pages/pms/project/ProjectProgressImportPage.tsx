import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { validateProgressImport } from '@/services/pms/project/project-service'
import type { ProjectRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
}

const TEMPLATE = `TaskName,ProgressPct,ActualDate,Description
Cutting line optimization,70,2026-06-12,Weekly status import`

export default function ProjectProgressImportPage() {
  const { project } = useOutletContext<OutletCtx>()
  const { hasPermission } = usePmsAuth()
  const [csv, setCsv] = useState(TEMPLATE)
  const [results, setResults] = useState<
    { Row: number; TaskName: string; Status: 'success' | 'failed'; Errors: string[] }[] | null
  >(null)
  const [validating, setValidating] = useState(false)

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'progress-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validate = async () => {
    setValidating(true)
    try {
      const lines = csv.trim().split('\n').slice(1)
      const rows = lines.map((line) => {
        const [TaskName, ProgressPct, ActualDate, Description] = line.split(',')
        return {
          TaskName: TaskName?.trim() ?? '',
          ProgressPct: Number(ProgressPct),
          ActualDate: ActualDate?.trim() ?? '',
          Description: Description?.trim() ?? '',
        }
      })
      const res = await validateProgressImport(project.Id, rows)
      setResults(res)
      const failed = res.filter((r) => r.Status === 'failed').length
      if (failed > 0) {
        toast.error(`${failed} row(s) failed validation — no partial commit`)
      } else {
        toast.success('All rows valid (mock — import not committed)')
      }
    } finally {
      setValidating(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('project.manage')}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="type-section-title">Excel / CSV import</h3>
          <Button asChild variant="light" size="sm">
            <Link to={`/pms/projects/${project.Id}/progress`}>Back to batch update</Link>
          </Button>
        </div>

        <Button variant="light" size="sm" onClick={downloadTemplate}>
          Download template
        </Button>

        <div className="space-y-2">
          <Label htmlFor="csv">Paste CSV data</Label>
          <Textarea id="csv" rows={8} className="font-mono text-sm" value={csv} onChange={(e) => setCsv(e.target.value)} />
        </div>

        <Button onClick={() => void validate()} disabled={validating}>
          Validate upload
        </Button>

        {results ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.Row}>
                  <TableCell>{r.Row}</TableCell>
                  <TableCell>{r.TaskName}</TableCell>
                  <TableCell>
                    <Badge variant={r.Status === 'success' ? 'default' : 'destructive'}>
                      {r.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-destructive">{r.Errors.join('; ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </div>
    </PermissionGate>
  )
}
