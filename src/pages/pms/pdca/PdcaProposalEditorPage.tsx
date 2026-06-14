import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { PDCA_CATEGORIES } from '@/lib/pms/pdca-helpers'
import type { PdcaProposal } from '@/models/pms/operations'
import {
  fetchHrRectificationPrefill,
  notifyAuditorInboxMock,
  savePdcaProposal,
} from '@/services/pms/pdca/pdca-proposal-service'

const MAX_ATTACHMENTS = 5

export default function PdcaProposalEditorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromHr = searchParams.get('fromHr')
  const { userId, displayName, hasPermission } = usePmsAuth()

  const [loadingPrefill, setLoadingPrefill] = useState(!!fromHr)
  const [prefillError, setPrefillError] = useState<string | null>(null)
  const [hrRecordId, setHrRecordId] = useState<string | null>(null)
  const [hrEmployeeId, setHrEmployeeId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PdcaProposal['Category']>('production')
  const [problemStatus, setProblemStatus] = useState('')
  const [improvementScheme, setImprovementScheme] = useState('')
  const [expectedResults, setExpectedResults] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const problemRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!fromHr) return
    setLoadingPrefill(true)
    void fetchHrRectificationPrefill(fromHr)
      .then((prefill) => {
        if (!prefill) {
          setPrefillError('HR rectification record not found. You can still submit manually.')
          return
        }
        setHrRecordId(prefill.recordId)
        setHrEmployeeId(prefill.employeeId)
        setTitle(prefill.title)
        setProblemStatus(prefill.problemStatus)
        setImprovementScheme(prefill.improvementScheme)
        setExpectedResults(prefill.expectedResults)
        setCategory('management')
        setDirty(true)
      })
      .catch(() => setPrefillError('Could not load HR pre-fill data.'))
      .finally(() => setLoadingPrefill(false))
  }, [fromHr])

  const markDirty = () => setDirty(true)

  const handleAttachmentPick = () => {
    const name = window.prompt('Mock attachment file name')
    if (!name?.trim()) return
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`)
      return
    }
    markDirty()
    setAttachments((prev) => [...prev, name.trim()])
  }

  const validate = (): boolean => {
    if (!title.trim()) {
      toast.error('Title is required')
      return false
    }
    if (problemStatus.trim().length < 50) {
      toast.error('Problem description must be at least 50 characters')
      problemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      problemRef.current?.focus()
      return false
    }
    if (!improvementScheme.trim()) {
      toast.error('Improvement scheme is required')
      return false
    }
    if (!expectedResults.trim()) {
      toast.error('Expected results are required')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const proposal = await savePdcaProposal(
        {
          Title: title,
          Category: category,
          ProblemStatus: problemStatus,
          ImprovementScheme: improvementScheme,
          ExpectedResults: expectedResults,
          Attachments: attachments,
          SourceHrRectificationId: hrRecordId,
        },
        { id: userId, name: displayName },
      )
      notifyAuditorInboxMock(proposal)
      toast.success('Proposal submitted — auditor inbox notified (mock)')
      navigate(`/pms/pdca/proposals/${proposal.Id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (dirty) setDiscardOpen(true)
    else navigate('/pms/pdca/proposals')
  }

  return (
    <PermissionGate allowed={hasPermission('pdca.submit')}>
      <PageHeader
        title="New Improvement Proposal"
        description="Describe the problem, proposed solution, and expected outcomes for auditor evaluation."
      />

      <AsyncState loading={loadingPrefill}>
        {prefillError ? (
          <Alert className="mb-4">
            <AlertDescription>{prefillError}</AlertDescription>
          </Alert>
        ) : null}

        {fromHr && hrEmployeeId && !prefillError ? (
          <Alert className="mb-4 border-primary/20 bg-primary/5">
            <AlertDescription>
              Pre-filled from HR rectification for employee context.{' '}
              <Link to="/pms/appraisal/hr" className="font-medium text-primary hover:underline">
                Back to HR workspace
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="mx-auto max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title</Label>
              <span className="text-xs text-muted-foreground">{title.length}/200</span>
            </div>
            <Input
              id="title"
              maxLength={200}
              value={title}
              onChange={(e) => {
                markDirty()
                setTitle(e.target.value)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => {
                markDirty()
                setCategory(v as PdcaProposal['Category'])
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PDCA_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="problem">Current problem status</Label>
              <span className="text-xs text-muted-foreground">{problemStatus.length} (min 50)</span>
            </div>
            <Textarea
              id="problem"
              ref={problemRef}
              rows={5}
              value={problemStatus}
              onChange={(e) => {
                markDirty()
                setProblemStatus(e.target.value)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheme">Improvement scheme</Label>
            <Textarea
              id="scheme"
              rows={4}
              value={improvementScheme}
              onChange={(e) => {
                markDirty()
                setImprovementScheme(e.target.value)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="results">Expected results</Label>
            <Textarea
              id="results"
              rows={3}
              value={expectedResults}
              onChange={(e) => {
                markDirty()
                setExpectedResults(e.target.value)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments (mock)</Label>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file) => (
                <Badge key={file} variant="secondary" className="gap-1 pr-1">
                  {file}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-muted"
                    onClick={() => {
                      markDirty()
                      setAttachments((prev) => prev.filter((f) => f !== file))
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button type="button" variant="light" size="sm" onClick={handleAttachmentPick}>
              Add attachment
            </Button>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="light" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? <SubmitSpinner /> : null}
              Submit proposal
            </Button>
          </div>
        </div>
      </AsyncState>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your proposal draft will be lost if you leave without submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/pms/pdca/proposals')}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PermissionGate>
  )
}
