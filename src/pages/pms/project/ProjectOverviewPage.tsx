import { Link, useOutletContext } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { ProjectRecord } from '@/services/pms/project/project-service'
import { fetchEnabledKpis } from '@/services/pms/project/project-service'
import { useEffect, useState } from 'react'

interface OutletCtx {
  project: ProjectRecord
  reload: () => void
}

export default function ProjectOverviewPage() {
  const { project } = useOutletContext<OutletCtx>()
  const { hasPermission } = usePmsAuth()
  const [kpiLabels, setKpiLabels] = useState<Record<string, string>>({})

  useEffect(() => {
    void fetchEnabledKpis().then((kpis) => {
      const map: Record<string, string> = {}
      kpis.forEach((k) => {
        map[k.Id] = `${k.Code} — ${k.Name}`
      })
      setKpiLabels(map)
    })
  }, [])

  const formatBudget = (n: number) =>
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(n)

  const canEdit =
    hasPermission('project.initiate') &&
    (project.Status === 'draft' || project.Status === 'returned')

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Business type:</span> {project.BusinessType}
          </p>
          <p>
            <span className="text-muted-foreground">Planned:</span> {project.PlannedStart} →{' '}
            {project.PlannedEnd}
          </p>
          <p>
            <span className="text-muted-foreground">Budget:</span> {formatBudget(project.BudgetAmount)}
          </p>
          {project.ClientInfo ? (
            <p>
              <span className="text-muted-foreground">Client:</span> {project.ClientInfo}
            </p>
          ) : null}
          {project.ApprovalOpinion ? (
            <p>
              <span className="text-muted-foreground">Approval note:</span> {project.ApprovalOpinion}
            </p>
          ) : null}
          {canEdit ? (
            <Button asChild size="sm" className="mt-2">
              <Link to={`/pms/projects/${project.Id}/edit`}>Edit application</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bound KPIs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {project.BoundKpiIds.map((id) => (
            <Badge key={id} variant="secondary">
              <Link to={`/pms/kpi/indicators/${id}`} className="hover:underline">
                {kpiLabels[id] ?? id}
              </Link>
            </Badge>
          ))}
        </CardContent>
      </Card>

      {project.GanttSketch ? (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Gantt sketch</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {project.GanttSketch}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
