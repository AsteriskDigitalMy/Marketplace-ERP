import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import { PdcaStatusBadge } from '@/components/pms/pdca/PdcaStatusBadge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { isPdcaTaskOverdue, pdcaCategoryLabel, PDCA_TASK_STATUS_LABELS, pdcaTaskStatusBadgeClass } from '@/lib/pms/pdca-helpers'
import type { PdcaProposal } from '@/models/pms/operations'
import type { UserAccount } from '@/models/pms/identity'
import { fetchAccounts } from '@/services/pms/admin/account-service'
import { fetchPdcaProposal } from '@/services/pms/pdca/pdca-proposal-service'
import {
  createPdcaExecutionTasks,
  fetchPdcaExecutionSummary,
  type PdcaExecutionSummary,
} from '@/services/pms/pdca/pdca-execution-service'

interface DraftStep {
  id: string
  description: string
  ownerId: string
  plannedDeadline: string
}

function newDraftStep(): DraftStep {
  return {
    id: crypto.randomUUID(),
    description: '',
    ownerId: '',
    plannedDeadline: '',
  }
}

export default function PdcaExecutionPage() {
  const { id } = useParams()
  const { hasPermission } = usePmsAuth()
  const canManage = hasPermission('pdca.manage')

  const [proposal, setProposal] = useState<PdcaProposal | null>(null)
  const [summary, setSummary] = useState<PdcaExecutionSummary | null>(null)
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [draftSteps, setDraftSteps] = useState<DraftStep[]>([newDraftStep()])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [pastDeadlineAck, setPastDeadlineAck] = useState(false)

  const load = async () => {
    if (!id) return
    setError(null)
    try {
      const [p, s, accts] = await Promise.all([
        fetchPdcaProposal(id),
        fetchPdcaExecutionSummary(id),
        fetchAccounts(),
      ])
      if (!['approved', 'in_execution', 'completed'].includes(p.Status)) {
        setError('Execution is only available for approved proposals')
        setProposal(p)
        setSummary(null)
        return
      }
      setProposal(p)
      setSummary(s)
      setAccounts(accts.filter((a) => a.Status === 'active'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load execution data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [id])

  const hasPastDeadline = draftSteps.some(
    (s) => s.plannedDeadline && new Date(s.plannedDeadline) < new Date(new Date().toDateString()),
  )

  const handleCreateTasks = async () => {
    if (!id || !canManage) return
    const validSteps = draftSteps.filter((s) => s.description.trim() && s.ownerId && s.plannedDeadline)
    if (validSteps.length === 0) {
      toast.error('Add at least one valid execution step')
      return
    }
    if (hasPastDeadline && !pastDeadlineAck) {
      toast.error('Acknowledge past-deadline warning before creating tasks')
      return
    }

    setCreating(true)
    try {
      const result = await createPdcaExecutionTasks(
        id,
        validSteps.map((s) => ({
          description: s.description,
          ownerId: s.ownerId,
          ownerName: accounts.find((a) => a.Id === s.ownerId)?.EmployeeName ?? s.ownerId,
          plannedDeadline: new Date(s.plannedDeadline).toISOString(),
        })),
      )
      setSummary(result)
      setProposal((prev) => (prev ? { ...prev, Status: 'in_execution' } : prev))
      toast.success('Execution tasks created and assignees notified (mock)')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create tasks')
    } finally {
      setCreating(false)
    }
  }

  const moveStep = (index: number, direction: -1 | 1) => {
    const next = [...draftSteps]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setDraftSteps(next)
  }

  const showEditor = canManage && summary && !summary.TasksCreated

  return (
    <PermissionGate allowed={hasPermission('pdca.submit')}>
      <PageHeader
        title="PDCA Execution"
        description="Decompose approved proposals into owned steps and monitor progress."
        actions={
          <div className="flex gap-2">
            <Button variant="light" size="sm" onClick={() => void load()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            {proposal ? (
              <Button variant="light" size="sm" asChild>
                <Link to={`/pms/pdca/proposals/${proposal.Id}`}>Back to proposal</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <AsyncState loading={loading} error={error} onRetry={() => void load()} empty={!proposal}>
        {proposal ? (
          <div className="space-y-6">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="type-section-title">{proposal.Title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3 text-sm">
                <PdcaStatusBadge status={proposal.Status} />
                <span className="text-muted-foreground">{pdcaCategoryLabel(proposal.Category)}</span>
              </CardContent>
            </Card>

            {!canManage && !summary?.TasksCreated ? (
              <Alert>
                <AlertDescription>
                  Execution tasks have not been created yet. Contact a manager with PDCA management access.
                </AlertDescription>
              </Alert>
            ) : null}

            {showEditor ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="type-section-title">Execution steps editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {draftSteps.map((step, index) => (
                    <div key={step.id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_200px_180px_auto]">
                      <div className="space-y-2">
                        <Label>Step description</Label>
                        <Input
                          value={step.description}
                          onChange={(e) =>
                            setDraftSteps((prev) =>
                              prev.map((s) =>
                                s.id === step.id ? { ...s, description: e.target.value } : s,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsible person</Label>
                        <Select
                          value={step.ownerId}
                          onValueChange={(v) =>
                            setDraftSteps((prev) =>
                              prev.map((s) => (s.id === step.id ? { ...s, ownerId: v } : s)),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((a) => (
                              <SelectItem key={a.Id} value={a.Id}>
                                {a.EmployeeName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Planned deadline</Label>
                        <Input
                          type="date"
                          value={step.plannedDeadline}
                          onChange={(e) =>
                            setDraftSteps((prev) =>
                              prev.map((s) =>
                                s.id === step.id ? { ...s, plannedDeadline: e.target.value } : s,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="flex items-end gap-1">
                        <Button type="button" variant="light" size="icon" onClick={() => moveStep(index, -1)}>
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button type="button" variant="light" size="icon" onClick={() => moveStep(index, 1)}>
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="light"
                          size="icon"
                          disabled={draftSteps.length <= 1}
                          onClick={() => setDraftSteps((prev) => prev.filter((s) => s.id !== step.id))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {hasPastDeadline ? (
                    <label className="flex items-center gap-2 text-sm text-warning-foreground">
                      <input
                        type="checkbox"
                        checked={pastDeadlineAck}
                        onChange={(e) => setPastDeadlineAck(e.target.checked)}
                      />
                      I acknowledge one or more deadlines are in the past
                    </label>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="light" onClick={() => setDraftSteps((p) => [...p, newDraftStep()])}>
                      <Plus className="size-4" />
                      Add step
                    </Button>
                    <Button type="button" disabled={creating} onClick={() => void handleCreateTasks()}>
                      {creating ? <SubmitSpinner /> : null}
                      Create execution tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {summary?.TasksCreated ? (
              <Card className="shadow-[var(--shadow-card)]">
                <CardHeader>
                  <CardTitle className="type-section-title">Management monitor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall progress</span>
                      <span className="font-medium">{summary.OverallProgressPct}%</span>
                    </div>
                    <Progress value={summary.OverallProgressPct} />
                  </div>

                  {summary.Tasks.some((t) => isPdcaTaskOverdue(t)) ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Overdue steps detected.{' '}
                        <Link to="/pms/alerts/rules" className="font-medium underline">
                          Review alert rules
                        </Link>
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <ol className="space-y-3">
                    {summary.Tasks.map((task) => (
                      <li key={task.Id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">
                              {task.StepOrder}. {task.Description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {task.OwnerName} · Deadline{' '}
                              {new Date(task.PlannedDeadline).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={pdcaTaskStatusBadgeClass(task.Status)}>
                              {PDCA_TASK_STATUS_LABELS[task.Status]}
                            </Badge>
                            <span className="text-sm font-medium">{task.ProgressPct}%</span>
                          </div>
                        </div>
                        {task.ProgressNotes.length > 0 ? (
                          <ul className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                            {task.ProgressNotes.map((n) => (
                              <li key={n.At}>
                                {new Date(n.At).toLocaleString()} — {n.ProgressPct}%: {n.Note}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </AsyncState>
    </PermissionGate>
  )
}
