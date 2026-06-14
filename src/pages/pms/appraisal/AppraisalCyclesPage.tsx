import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { AppraisalCycle } from '@/models/pms/operations'
import { fetchAppraisalCycles } from '@/services/pms/appraisal/appraisal-workflow-service'

const STATUS_LABELS: Record<AppraisalCycle['Status'], string> = {
  not_started: 'Not started',
  ready: 'Ready to generate',
  generated: 'Generated',
  published: 'Published',
}

export default function AppraisalCyclesPage() {
  const { hasPermission } = usePmsAuth()
  const [cycles, setCycles] = useState<AppraisalCycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      setCycles(await fetchAppraisalCycles())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cycles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <PermissionGate allowed={hasPermission('appraisal.manage')}>
      <PageHeader
        title="Appraisal Cycles"
        description="Monitor cycles and batch-generate preliminary performance appraisals."
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={cycles.length === 0}>
        <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cycle</TableHead>
                <TableHead>Scheme</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>KPI data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle) => (
                <TableRow key={cycle.Id}>
                  <TableCell className="font-medium">{cycle.Label}</TableCell>
                  <TableCell>
                    <Link
                      to={`/pms/appraisal/schemes/${cycle.SchemeId}`}
                      className="text-primary hover:underline"
                    >
                      {cycle.SchemeName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(cycle.PeriodStart).toLocaleDateString()} –{' '}
                    {new Date(cycle.PeriodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cycle.KpiCompletenessPct === 100 ? 'default' : 'secondary'}>
                      {cycle.KpiCompletenessPct === 100 ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </TableCell>
                  <TableCell>{STATUS_LABELS[cycle.Status]}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    {cycle.Status === 'ready' ? (
                      <Button variant="light" size="sm" asChild>
                        <Link to={`/pms/appraisal/cycles/${cycle.Id}/generate`}>Generate</Link>
                      </Button>
                    ) : null}
                    {cycle.Status === 'generated' ? (
                      <Button variant="light" size="sm" asChild>
                        <Link to={`/pms/appraisal/preliminary?cycleId=${cycle.Id}`}>
                          View preliminary
                        </Link>
                      </Button>
                    ) : null}
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
