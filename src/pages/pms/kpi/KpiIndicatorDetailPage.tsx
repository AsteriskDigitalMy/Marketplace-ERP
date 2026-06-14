import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Lock, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  KpiIndicatorFormFields,
  useDebouncedCodeCheck,
  type KpiIndicatorFormValues,
} from '@/components/pms/kpi/KpiIndicatorFormFields'
import {
  checkKpiCodeUnique,
  deleteKpiIndicator,
  fetchKpiCategories,
  fetchKpiIndicator,
  fetchKpiIndicatorUsage,
  fetchKpiIndicatorVersions,
  setKpiIndicatorStatus,
  updateKpiIndicator,
  validateKpiFormula,
} from '@/services/pms/kpi/kpi-service'
import type { KpiIndicator, KpiIndicatorVersion } from '@/models/pms/kpi'
import type { KpiIndicatorUsage } from '@/mocks/pms/kpi-store'
import {
  KpiCycleSchema,
  KpiDataSourceSchema,
  KpiEvaluationObjectSchema,
} from '@/models/common/enums'

const schema = z
  .object({
    Code: z.string().regex(/^[A-Z0-9_]{3,32}$/),
    Name: z.string().trim().min(1).max(128),
    Category: z.string().min(1),
    StatisticalScope: z.string().trim().min(1).max(500),
    Formula: z.string().trim().min(1),
    TargetValue: z.number().positive(),
    ChallengeValue: z.number().positive().nullable(),
    BaselineValue: z.number().nullable(),
    Cycle: KpiCycleSchema,
    EvaluationObject: KpiEvaluationObjectSchema,
    DataSource: KpiDataSourceSchema,
    WeightPct: z.number().min(0).max(100).nullable(),
    AlertThreshold: z.number().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.ChallengeValue !== null && data.ChallengeValue <= data.TargetValue) {
      ctx.addIssue({
        code: 'custom',
        message: 'Challenge value must be greater than target',
        path: ['ChallengeValue'],
      })
    }
  })

export default function KpiIndicatorDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = usePmsAuth()
  const [indicator, setIndicator] = useState<KpiIndicator | null>(null)
  const [versions, setVersions] = useState<KpiIndicatorVersion[]>([])
  const [usage, setUsage] = useState<KpiIndicatorUsage | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<KpiIndicator['Status'] | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [diffVersion, setDiffVersion] = useState<KpiIndicatorVersion | null>(null)

  const form = useForm<KpiIndicatorFormValues>({ resolver: zodResolver(schema) })
  const code = form.watch('Code')
  const codeCheckState = useDebouncedCodeCheck(code, id, checkKpiCodeUnique)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ind, vers, use, cats] = await Promise.all([
        fetchKpiIndicator(id),
        fetchKpiIndicatorVersions(id),
        fetchKpiIndicatorUsage(id),
        fetchKpiCategories(),
      ])
      setIndicator(ind)
      setVersions(vers)
      setUsage(use)
      setCategories(cats)
      form.reset({
        Code: ind.Code,
        Name: ind.Name,
        Category: ind.Category,
        StatisticalScope: ind.StatisticalScope,
        Formula: ind.Formula,
        TargetValue: ind.TargetValue,
        ChallengeValue: ind.ChallengeValue,
        BaselineValue: ind.BaselineValue,
        Cycle: ind.Cycle,
        EvaluationObject: ind.EvaluationObject,
        DataSource: ind.DataSource,
        WeightPct: ind.WeightPct,
        AlertThreshold: ind.AlertThreshold,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load indicator')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const onSave = form.handleSubmit(async (values) => {
    if (!indicator) return
    if (codeCheckState === 'duplicate') {
      form.setError('Code', { message: 'Indicator code already exists' })
      return
    }
    const validation = await validateKpiFormula(values.Formula, values.Code)
    if (!validation.IsValid) {
      toast.error(validation.Errors[0] ?? 'Formula validation failed')
      return
    }
    setSubmitting(true)
    try {
      const updated = await updateKpiIndicator(id, values)
      toast.success(`Saved — now at ${updated.Version}`)
      setEditing(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  })

  const handleStatusChange = async () => {
    if (!pendingStatus) return
    try {
      if (pendingStatus === 'enabled') {
        const validation = await validateKpiFormula(indicator?.Formula ?? '', indicator?.Code)
        if (!validation.IsValid) {
          toast.error('Cannot enable — formula has validation errors')
          return
        }
      }
      await setKpiIndicatorStatus(id, pendingStatus)
      toast.success(`Indicator ${pendingStatus === 'enabled' ? 'enabled' : 'disabled'}`)
      setStatusDialogOpen(false)
      setPendingStatus(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status change failed')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteKpiIndicator(id)
      toast.success('Indicator deleted')
      navigate('/pms/kpi/indicators')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const canDelete = indicator && !indicator.HasCalculationHistory
  const hasActiveUsage = usage && usage.ActiveProjects > 0

  return (
    <AsyncState loading={loading} error={error} onRetry={load}>
      {indicator ? (
        <div className="space-y-4">
          <PageHeader
            title={indicator.Name}
            description={`KPI Library → ${indicator.Code}`}
            actions={
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="light" size="sm">
                  <Link to="/pms/kpi/indicators">Back</Link>
                </Button>
                {hasPermission('kpi.manage') && !editing ? (
                  <>
                    <Button size="sm" onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="light" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const next =
                              indicator.Status === 'enabled' ? 'disabled' : 'enabled'
                            setPendingStatus(next)
                            setStatusDialogOpen(true)
                          }}
                        >
                          {indicator.Status === 'enabled' ? 'Disable' : 'Enable'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {canDelete ? (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteDialogOpen(true)}
                          >
                            Delete
                          </DropdownMenuItem>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem disabled>Delete</DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              Cannot delete — used in calculations
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : null}
              </div>
            }
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {indicator.Code}
            </Badge>
            <Badge variant={indicator.Status === 'enabled' ? 'default' : 'secondary'}>
              {indicator.Status}
            </Badge>
            <Badge variant="outline">{indicator.Version}</Badge>
            {indicator.IsCoreLocked ? (
              <Badge variant="secondary" className="gap-1">
                <Lock className="size-3" />
                Core KPI
              </Badge>
            ) : null}
          </div>

          <Tabs defaultValue="attributes">
            <TabsList>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="history">Version history</TabsTrigger>
              <TabsTrigger value="usage">Usage stats</TabsTrigger>
            </TabsList>

            <TabsContent value="attributes" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Indicator attributes</CardTitle>
                  {!indicator.IsCoreLocked && !editing ? (
                    <Button variant="link" size="sm" asChild>
                      <Link to={`/pms/kpi/indicators/${id}/formula`}>Edit formula</Link>
                    </Button>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <form onSubmit={onSave} className="space-y-6">
                      <KpiIndicatorFormFields
                        form={form}
                        categories={categories}
                        codeCheckState={codeCheckState}
                        isCoreLocked={indicator.IsCoreLocked}
                        onOpenFormulaEditor={() =>
                          navigate(`/pms/kpi/indicators/${id}/formula`)
                        }
                      />
                      <div className="flex gap-2 border-t pt-4">
                        <Button
                          type="button"
                          variant="light"
                          onClick={() => {
                            setEditing(false)
                            form.reset()
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? <SubmitSpinner /> : null}
                          Save changes
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <KpiIndicatorFormFields
                      form={form}
                      categories={categories}
                      isCoreLocked={indicator.IsCoreLocked}
                      readOnly
                      onOpenFormulaEditor={() =>
                        navigate(`/pms/kpi/indicators/${id}/formula`)
                      }
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Version history</CardTitle>
                </CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No prior versions.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Changed at</TableHead>
                          <TableHead>Summary</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {versions.map((v) => (
                          <TableRow
                            key={`${v.IndicatorId}-${v.Version}-${v.ChangedAt}`}
                            className={v.Version === indicator.Version ? 'bg-muted/50' : ''}
                          >
                            <TableCell className="font-mono">{v.Version}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(v.ChangedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{v.Summary}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => setDiffVersion(v)}
                              >
                                Diff
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{usage?.ActiveProjects ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Appraisal schemes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{usage?.AppraisalSchemes ?? 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last calculated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {usage?.LastCalculatedAt
                        ? new Date(usage.LastCalculatedAt).toLocaleString()
                        : 'Never'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {usage && usage.References.length > 0 ? (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Label</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usage.References.map((ref) => (
                          <TableRow key={`${ref.EntityType}-${ref.EntityId}`}>
                            <TableCell className="capitalize">{ref.EntityType}</TableCell>
                            <TableCell>
                              {ref.EntityType === 'project' ? (
                                <Link
                                  to={`/pms/projects/${ref.EntityId}`}
                                  className="text-primary underline"
                                >
                                  {ref.Label}
                                </Link>
                              ) : (
                                ref.Label
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>
          </Tabs>

          <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {pendingStatus === 'disabled' ? 'Disable indicator?' : 'Enable indicator?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {pendingStatus === 'disabled'
                    ? 'Disabling stops new cycle calculations. Historical data is preserved.'
                    : 'Enabling allows this indicator to participate in scheduled calculations.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {pendingStatus === 'disabled' && hasActiveUsage ? (
                <Alert>
                  <AlertDescription>
                    This indicator is bound to {usage?.ActiveProjects} active project(s). Disabling
                    may affect in-progress KPI tracking.
                  </AlertDescription>
                </Alert>
              ) : null}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleStatusChange()}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete indicator?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The indicator will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive-solid"
                  onClick={() => void handleDelete()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={!!diffVersion} onOpenChange={() => setDiffVersion(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Version diff — {diffVersion?.Version}</DialogTitle>
                <DialogDescription>Mock snapshot comparison</DialogDescription>
              </DialogHeader>
              <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(diffVersion?.Snapshot, null, 2)}
              </pre>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
    </AsyncState>
  )
}
