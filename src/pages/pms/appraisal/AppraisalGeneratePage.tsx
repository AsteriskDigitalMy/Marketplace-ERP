import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AppraisalGradeBadge } from '@/components/pms/appraisal/AppraisalGradeBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import type { AppraisalCycle } from '@/models/pms/operations'
import { fetchAppraisalScheme } from '@/services/pms/appraisal/appraisal-scheme-service'
import {
  fetchAppraisalCycle,
  generateAppraisals,
  previewEmployeeAppraisal,
} from '@/services/pms/appraisal/appraisal-workflow-service'

export default function AppraisalGeneratePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [cycle, setCycle] = useState<AppraisalCycle | null>(null)
  const [schemeIndicators, setSchemeIndicators] = useState<
    { KpiName: string; WeightPct: number }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [employeeId, setEmployeeId] = useState('')
  const [preview, setPreview] = useState<{
    total: number
    grade: 'A' | 'B' | 'C' | 'D'
  } | null>(null)

  useEffect(() => {
    if (!id) return
    void fetchAppraisalCycle(id)
      .then(async (c) => {
        setCycle(c)
        const scheme = await fetchAppraisalScheme(c.SchemeId)
        setSchemeIndicators(scheme.Indicators)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const canGenerate =
    cycle?.Status === 'ready' && cycle.KpiCompletenessPct === 100 && schemeIndicators.length > 0

  const runGenerate = async () => {
    if (!id) return
    setGenerating(true)
    setProgress(10)
    const timer = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 200)
    try {
      const result = await generateAppraisals(id)
      setProgress(100)
      toast.success(`Generated ${result.count} preliminary appraisals`)
      navigate(`/pms/appraisal/preliminary?cycleId=${id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      clearInterval(timer)
      setGenerating(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('appraisal.manage')}>
      <PageHeader
        title={cycle ? `Generate — ${cycle.Label}` : 'Generate appraisals'}
        description="Validate prerequisites and batch-generate preliminary drafts."
      />

      <AsyncState loading={loading} error={error} onRetry={() => id && void fetchAppraisalCycle(id)}>
        {cycle ? (
          <div className="space-y-6">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">Pre-check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Active scheme indicators</span>
                  <span className="text-muted-foreground">{schemeIndicators.length} configured</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {schemeIndicators.map((i) => (
                    <li key={i.KpiName}>
                      {i.KpiName} — {i.WeightPct}%
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-sm">
                  <span>Employees in scope</span>
                  <span>6 (mock)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>KPI data completeness</span>
                    <span>{cycle.KpiCompletenessPct}%</span>
                  </div>
                  <Progress value={cycle.KpiCompletenessPct} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">Individual preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-2">
                <Input
                  className="max-w-xs"
                  placeholder="Employee ID e.g. E-1001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
                <Button
                  variant="light"
                  onClick={() => {
                    if (!id) return
                    void previewEmployeeAppraisal(id, employeeId).then((r) => {
                      if (!r) {
                        toast.error('Employee not in cycle scope')
                        setPreview(null)
                        return
                      }
                      setPreview({ total: r.TotalScore, grade: r.AutoGrade })
                    })
                  }}
                >
                  Preview
                </Button>
                {preview ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Score: {preview.total}</span>
                    <AppraisalGradeBadge grade={preview.grade} />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {generating ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">Generating appraisals…</p>
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button disabled={!canGenerate || generating} onClick={() => void runGenerate()}>
                Generate all staff
              </Button>
              <Button variant="light" asChild>
                <Link to="/pms/appraisal/cycles">Back to cycles</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
