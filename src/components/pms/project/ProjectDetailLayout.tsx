import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { AlertTriangle, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AsyncState } from '@/components/pms/AsyncState'
import { fetchProject, fetchProjectIssues, getLeaderName } from '@/services/pms/project/project-service'
import type { ProjectRecord } from '@/services/pms/project/project-service'
import { cn } from '@/lib/utils'

const tabs = [
  { suffix: '', label: 'Overview' },
  { suffix: '/tasks', label: 'Tasks' },
  { suffix: '/progress', label: 'Progress' },
  { suffix: '/gantt', label: 'Gantt' },
  { suffix: '/issues', label: 'Issues' },
  { suffix: '/kpi-sync', label: 'KPI Sync' },
  { suffix: '/acceptance', label: 'Acceptance' },
  { suffix: '/duration-requests', label: 'Duration Requests' },
]

export function ProjectDetailLayout() {
  const { id = '' } = useParams()
  const base = `/pms/projects/${id}`
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [leaderName, setLeaderName] = useState('')
  const [openIssues, setOpenIssues] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, issues] = await Promise.all([
        fetchProject(id),
        fetchProjectIssues(id),
      ])
      setProject(p)
      setLeaderName(await getLeaderName(p.LeaderId))
      setOpenIssues(issues.filter((i) => i.Status === 'open' || i.Status === 'assigned').length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  return (
    <AsyncState loading={loading} error={error} onRetry={load}>
      {project ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">
                <Link to="/pms/projects" className="hover:underline">
                  Projects
                </Link>{' '}
                → {project.Code || 'Draft'}
              </p>
              <h1 className="text-2xl font-semibold">{project.Name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {project.Code ? (
                  <Badge variant="outline" className="font-mono">
                    {project.Code}
                  </Badge>
                ) : null}
                <Badge>{project.Status.replace(/_/g, ' ')}</Badge>
                {project.Status === 'archived' ? (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="size-3" />
                    Sealed
                  </Badge>
                ) : null}
                <span className="text-sm text-muted-foreground">Leader: {leaderName}</span>
              </div>
            </div>
          </div>

          {project.Status === 'returned' && project.RejectionOpinion ? (
            <Alert variant="destructive">
              <AlertDescription>
                Returned for revision: {project.RejectionOpinion}
              </AlertDescription>
            </Alert>
          ) : null}

          {project.Status === 'pending_acceptance' ? (
            <Alert>
              <AlertDescription>Acceptance application pending auditor review.</AlertDescription>
            </Alert>
          ) : null}

          {openIssues > 0 ? (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription className="flex flex-wrap items-center gap-2">
                {openIssues} open issue(s) require attention.
                <Link to={`${base}/issues`} className="font-medium underline">
                  View issues
                </Link>
              </AlertDescription>
            </Alert>
          ) : null}

          <nav className="flex flex-wrap gap-0 border-b border-border">
            {tabs.map((tab) => (
              <NavLink
                key={tab.suffix}
                to={`${base}${tab.suffix}`}
                end={tab.suffix === ''}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && '-mb-px border-primary text-primary',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <Outlet context={{ project, reload: load }} />
        </div>
      ) : null}
    </AsyncState>
  )
}
