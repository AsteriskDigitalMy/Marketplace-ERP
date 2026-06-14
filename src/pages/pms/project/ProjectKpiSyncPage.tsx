import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AsyncState } from '@/components/pms/AsyncState'
import { fetchProjectKpiSync } from '@/services/pms/project/project-service'
import type { ProjectKpiSyncState, ProjectRecord } from '@/services/pms/project/project-service'

interface OutletCtx {
  project: ProjectRecord
}

export default function ProjectKpiSyncPage() {
  const { project } = useOutletContext<OutletCtx>()
  const [sync, setSync] = useState<ProjectKpiSyncState | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSync(await fetchProjectKpiSync(project.Id))
    } finally {
      setLoading(false)
    }
  }, [project.Id])

  useEffect(() => {
    void load()
  }, [load])

  const refresh = async () => {
    setRefreshing(true)
    try {
      setSync(await fetchProjectKpiSync(project.Id))
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">KPI sync monitor</h3>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={refreshing}>
          {refreshing ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      <AsyncState
        loading={loading}
        empty={!loading && project.BoundKpiIds.length === 0}
        emptyTitle="No bound KPIs"
        emptyDescription="Edit the project to bind KPI indicators."
      >
        {sync ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completion %</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{sync.CompletionPct}%</p>
                  <Badge variant="outline" className="mt-2">
                    project_auto_sync
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">On-time rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{sync.OnTimeRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    Last synced:{' '}
                    {sync.LastSyncedAt ? new Date(sync.LastSyncedAt).toLocaleString() : 'Never'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Delay count</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{sync.DelayCount}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">KPI mappings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Synced value</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Trace</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sync.Mappings.map((m) => (
                      <TableRow key={m.KpiId}>
                        <TableCell>
                          <Link
                            to={`/pms/kpi/indicators/${m.KpiId}`}
                            className="hover:underline"
                          >
                            {m.KpiCode} — {m.KpiName}
                          </Link>
                        </TableCell>
                        <TableCell>{m.SyncedValue}</TableCell>
                        <TableCell>{m.TargetValue}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.SourceFlag}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/pms/projects/${project.Id}/tasks`}
                            className="text-sm text-primary underline"
                          >
                            {m.TaskIds.length} task(s)
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sync log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>At</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>KPI</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sync.Log.map((entry) => (
                      <TableRow key={entry.Id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(entry.At).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/pms/projects/${project.Id}/tasks?highlight=${entry.TaskId}`}
                            className="hover:underline"
                          >
                            {entry.TaskName}
                          </Link>
                        </TableCell>
                        <TableCell>{entry.Event}</TableCell>
                        <TableCell>{entry.KpiName}</TableCell>
                        <TableCell>{entry.Value}</TableCell>
                        <TableCell>
                          <Badge variant={entry.Status === 'success' ? 'default' : 'destructive'}>
                            {entry.Status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : null}
      </AsyncState>
    </div>
  )
}
