import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { FormulaEditor } from '@/components/pms/kpi/FormulaEditor'
import {
  fetchKpiIndicator,
  updateKpiIndicator,
} from '@/services/pms/kpi/kpi-service'
import type { KpiIndicator } from '@/models/pms/kpi'

export default function KpiFormulaEditorPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [indicator, setIndicator] = useState<KpiIndicator | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const ind = await fetchKpiIndicator(id)
      setIndicator(ind)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load indicator')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const handleApply = async (expression: string) => {
    if (!indicator || indicator.IsCoreLocked) return
    setSaving(true)
    try {
      const updated = await updateKpiIndicator(id, { Formula: expression })
      toast.success(`Formula saved — now at ${updated.Version}`)
      navigate(`/pms/kpi/indicators/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PermissionGate allowed={hasPermission('kpi.manage')}>
      <AsyncState loading={loading} error={error} onRetry={load}>
        {indicator ? (
          <div className="space-y-4">
            <PageHeader
              title="Formula editor"
              description={`${indicator.Code} — ${indicator.Name}`}
              actions={
                <Button asChild variant="light" size="sm">
                  <Link to={`/pms/kpi/indicators/${id}`}>Back to indicator</Link>
                </Button>
              }
            />

            {indicator.IsCoreLocked ? (
              <p className="text-sm text-muted-foreground">
                This is a core industry KPI — the formula is locked and cannot be edited.
              </p>
            ) : null}

            <FormulaEditor
              initialExpression={indicator.Formula}
              indicator={indicator}
              selfCode={indicator.Code}
              readOnly={indicator.IsCoreLocked || saving}
              onApply={(expr) => void handleApply(expr)}
            />
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
