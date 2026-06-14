import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { KpiIndicatorPickerDialog } from '@/components/pms/appraisal/KpiIndicatorPickerDialog'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  APPRAISAL_DEPARTMENT_OPTIONS,
  APPRAISAL_PROJECT_TYPES,
  APPRAISAL_ROLE_OPTIONS,
  DEFAULT_GRADE_RULES,
  gradeColorClass,
  sumIndicatorWeights,
  validateGradeRules,
} from '@/lib/pms/appraisal-helpers'
import type { PerformanceGrade } from '@/models/common/enums'
import type { AppraisalScheme } from '@/models/pms/operations'
import {
  fetchAppraisalScheme,
  findSchemeConflicts,
  saveAppraisalScheme,
} from '@/services/pms/appraisal/appraisal-scheme-service'

export default function AppraisalSchemeEditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const copyFrom = searchParams.get('copyFrom')
  const isNew = !id
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()

  const [loading, setLoading] = useState(!isNew || !!copyFrom)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [conflictOpen, setConflictOpen] = useState(false)
  const [conflicts, setConflicts] = useState<AppraisalScheme[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [schemeStatus, setSchemeStatus] = useState<AppraisalScheme['Status']>('draft')

  const [name, setName] = useState('')
  const [departments, setDepartments] = useState<string[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [projectTypes, setProjectTypes] = useState<string[]>([])
  const [cycle, setCycle] = useState<AppraisalScheme['Cycle']>('quarterly')
  const [indicators, setIndicators] = useState<AppraisalScheme['Indicators']>([])
  const [gradeRules, setGradeRules] = useState<AppraisalScheme['GradeRules']>(DEFAULT_GRADE_RULES)

  const readOnly = schemeStatus === 'active' || schemeStatus === 'archived'
  const weightTotal = useMemo(() => sumIndicatorWeights(indicators), [indicators])
  const weightValid = Math.abs(weightTotal - 100) < 0.01
  const gradeError = validateGradeRules(gradeRules)
  const canActivate = weightValid && !gradeError && indicators.length > 0 && name.trim().length > 0

  useEffect(() => {
    const loadId = id ?? copyFrom
    if (!loadId) return
    setLoading(true)
    void fetchAppraisalScheme(loadId)
      .then((scheme) => {
        setName(copyFrom ? `${scheme.Name} (Copy)` : scheme.Name)
        setDepartments(scheme.Departments)
        setRoles(scheme.Roles)
        setProjectTypes(scheme.ProjectTypes)
        setCycle(scheme.Cycle)
        setIndicators(scheme.Indicators.map((i) => ({ ...i })))
        setGradeRules(scheme.GradeRules.map((g) => ({ ...g })))
        setSchemeStatus(copyFrom ? 'draft' : scheme.Status)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, copyFrom])

  const markDirty = () => setDirty(true)

  const toggleId = (list: string[], value: string, setter: (v: string[]) => void) => {
    markDirty()
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  const buildInput = (): Parameters<typeof saveAppraisalScheme>[0] => ({
    Id: id,
    Name: name.trim(),
    Departments: departments,
    Roles: roles,
    ProjectTypes: projectTypes,
    Cycle: cycle,
    Indicators: indicators,
    GradeRules: gradeRules,
    Status: schemeStatus,
  })

  const handleSaveDraft = async () => {
    setSubmitting(true)
    try {
      await saveAppraisalScheme(buildInput(), false)
      toast.success('Draft saved')
      setDirty(false)
      navigate('/pms/appraisal/schemes')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleActivate = async () => {
    const draft = { ...buildInput(), Status: 'active' as const, Id: id ?? crypto.randomUUID() }
    const found = findSchemeConflicts(draft as AppraisalScheme)
    if (found.length > 0) {
      setConflicts(found)
      setConflictOpen(true)
      return
    }
    setSubmitting(true)
    try {
      await saveAppraisalScheme(buildInput(), true)
      toast.success('Effective next cycle')
      navigate('/pms/appraisal/schemes')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Activate failed'
      if (msg.includes('Scope conflict')) {
        setConflicts(findSchemeConflicts({ ...buildInput(), Status: 'active' } as AppraisalScheme))
        setConflictOpen(true)
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const requestCancel = () => {
    if (dirty) {
      setDiscardOpen(true)
      return
    }
    navigate('/pms/appraisal/schemes')
  }

  const updateGrade = (grade: PerformanceGrade, field: 'MinScore' | 'MaxScore', value: string) => {
    markDirty()
    setGradeRules((prev) =>
      prev.map((g) => (g.Grade === grade ? { ...g, [field]: Number(value) } : g)),
    )
  }

  return (
    <PermissionGate allowed={hasPermission('appraisal.manage')}>
      <PageHeader
        title={isNew ? 'New appraisal scheme' : name || 'Appraisal scheme'}
        description="Bind KPI indicators, weights, and grade division rules."
      />

      {readOnly ? (
        <Alert className="mb-4">
          <AlertDescription>
            Active or archived schemes cannot be edited — use Copy to create a new draft.
          </AlertDescription>
        </Alert>
      ) : null}

      <AsyncState loading={loading} error={error} onRetry={() => id && void fetchAppraisalScheme(id)}>
        <div className="space-y-6 pb-24">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="type-section-title">Basic info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Scheme name</Label>
                <Input
                  id="name"
                  maxLength={100}
                  disabled={readOnly}
                  value={name}
                  onChange={(e) => {
                    markDirty()
                    setName(e.target.value)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Applicable departments</Label>
                <div className="space-y-2 rounded-md border p-3">
                  {APPRAISAL_DEPARTMENT_OPTIONS.map((d) => (
                    <label key={d.Id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        disabled={readOnly}
                        checked={departments.includes(d.Id)}
                        onCheckedChange={() => toggleId(departments, d.Id, setDepartments)}
                      />
                      {d.Name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Applicable roles</Label>
                <div className="space-y-2 rounded-md border p-3">
                  {APPRAISAL_ROLE_OPTIONS.map((r) => (
                    <label key={r.Id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        disabled={readOnly}
                        checked={roles.includes(r.Id)}
                        onCheckedChange={() => toggleId(roles, r.Id, setRoles)}
                      />
                      {r.Name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Project types (optional)</Label>
                <div className="space-y-2 rounded-md border p-3">
                  {APPRAISAL_PROJECT_TYPES.map((pt) => (
                    <label key={pt} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        disabled={readOnly}
                        checked={projectTypes.includes(pt)}
                        onCheckedChange={() => toggleId(projectTypes, pt, setProjectTypes)}
                      />
                      {pt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Appraisal cycle</Label>
                <Select
                  disabled={readOnly}
                  value={cycle}
                  onValueChange={(v) => {
                    markDirty()
                    setCycle(v as AppraisalScheme['Cycle'])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annual">Semi-annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="type-section-title">Indicators & weights</CardTitle>
              {!readOnly ? (
                <Button variant="light" size="sm" onClick={() => setPickerOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Add indicators
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {indicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No indicators selected.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead className="w-32">Weight %</TableHead>
                      {!readOnly ? <TableHead className="w-12" /> : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicators.map((ind) => (
                      <TableRow key={ind.KpiId}>
                        <TableCell>{ind.KpiName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            disabled={readOnly}
                            value={ind.WeightPct}
                            onChange={(e) => {
                              markDirty()
                              setIndicators((prev) =>
                                prev.map((x) =>
                                  x.KpiId === ind.KpiId
                                    ? { ...x, WeightPct: Number(e.target.value) }
                                    : x,
                                ),
                              )
                            }}
                          />
                        </TableCell>
                        {!readOnly ? (
                          <TableCell>
                            <Button
                              variant="light"
                              size="sm"
                              onClick={() => {
                                markDirty()
                                setIndicators((prev) => prev.filter((x) => x.KpiId !== ind.KpiId))
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <p
                className={`mt-3 text-sm font-medium ${weightValid ? 'text-emerald-600' : 'text-destructive'}`}
              >
                Total weight: {weightTotal.toFixed(1)}% {weightValid ? '(100%)' : '(must equal 100%)'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="type-section-title">Scoring & grade rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gradeRules.map((rule) => (
                <div key={rule.Grade} className="grid grid-cols-[60px_1fr_1fr_auto] items-center gap-2">
                  <Badge className={gradeColorClass(rule.Grade)}>{rule.Grade}</Badge>
                  <Input
                    type="number"
                    disabled={readOnly}
                    value={rule.MinScore}
                    onChange={(e) => updateGrade(rule.Grade, 'MinScore', e.target.value)}
                  />
                  <Input
                    type="number"
                    disabled={readOnly}
                    value={rule.MaxScore}
                    onChange={(e) => updateGrade(rule.Grade, 'MaxScore', e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">preview</span>
                </div>
              ))}
              {gradeError ? <p className="text-sm text-destructive">{gradeError}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 z-10 -mx-1 border-t bg-background/95 px-1 py-4 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <Button variant="light" onClick={requestCancel}>
              {readOnly ? 'Back' : 'Cancel'}
            </Button>
            {!readOnly ? (
              <>
                <Button variant="light" disabled={submitting} onClick={() => void handleSaveDraft()}>
                  Save as draft
                </Button>
                <Button disabled={submitting || !canActivate} onClick={() => void handleActivate()}>
                  Activate
                </Button>
              </>
            ) : (
              <Button
                variant="light"
                onClick={() =>
                  navigate(`/pms/appraisal/schemes/new?copyFrom=${id}`)
                }
              >
                Copy to new draft
              </Button>
            )}
          </div>
        </div>
      </AsyncState>

      <KpiIndicatorPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        excludeIds={indicators.map((i) => i.KpiId)}
        onAdd={(items) => {
          markDirty()
          setIndicators((prev) => [
            ...prev,
            ...items.map((i) => ({ ...i, WeightPct: 0 })),
          ])
        }}
      />

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/pms/appraisal/schemes')}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scope conflict</AlertDialogTitle>
            <AlertDialogDescription>
              Active schemes overlap this scope. Archive or narrow scope before activating:
              <ul className="mt-2 list-disc pl-5">
                {conflicts.map((c) => (
                  <li key={c.Id}>{c.Name}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review conflicts</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-4 text-sm text-muted-foreground">
        <Link to="/pms/appraisal/schemes" className="text-primary hover:underline">
          Back to schemes
        </Link>
      </p>
    </PermissionGate>
  )
}
