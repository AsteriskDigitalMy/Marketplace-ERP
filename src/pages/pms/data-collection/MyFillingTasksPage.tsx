import { useCallback, useEffect, useState } from 'react'
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
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchMyFillingTasks,
  getDueCountdownLabel,
} from '@/services/pms/data-collection/data-collection-service'
import type { FillingTaskRecord } from '@/services/pms/data-collection/data-collection-service'

export default function MyFillingTasksPage() {
  const { userId } = usePmsAuth()
  const [tasks, setTasks] = useState<FillingTaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTasks(await fetchMyFillingTasks(userId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-4">
      <PageHeader
        title="My filling tasks"
        description="Periodic KPI data entry assignments."
      />

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && tasks.length === 0}
        emptyTitle="No tasks assigned"
        emptyDescription="Filling tasks will appear here when rules are triggered."
        onRetry={load}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => {
              const countdown = getDueCountdownLabel(t.DueAt)
              const canFill = t.Status === 'pending' || t.Status === 'overdue'
              return (
                <TableRow key={t.Id}>
                  <TableCell className="font-medium">{t.IndicatorName}</TableCell>
                  <TableCell>{t.PeriodLabel}</TableCell>
                  <TableCell>
                    {new Date(t.DueAt).toLocaleDateString()}
                    <Badge variant={countdown.variant} className="ml-2">
                      {countdown.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.Status === 'overdue'
                          ? 'destructive'
                          : t.Status === 'submitted' || t.Status === 'approved'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {t.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant={canFill ? 'default' : 'light'} size="sm" asChild>
                      <Link to={`/pms/data-collection/fill/${t.Id}`}>
                        {canFill ? 'Fill' : 'View'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </AsyncState>
    </div>
  )
}
