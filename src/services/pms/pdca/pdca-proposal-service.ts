import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import { appraisalWorkflowStore } from '@/mocks/pms/appraisal-workflow-store'
import { pdcaProposalsStore } from '@/mocks/pms/pdca-proposals-store'
import { PdcaProposalSchema, type PdcaProposal } from '@/models/pms/operations'

export type PdcaProposalInput = Omit<
  PdcaProposal,
  'Id' | 'OrganizationId' | 'SubmittedAt' | 'Status' | 'AuditorComments' | 'SubmitterId' | 'SubmitterName'
> & {
  Id?: string
}

export interface PdcaProposalFilters {
  submitterId?: string
  status?: PdcaProposal['Status'] | 'all'
  category?: PdcaProposal['Category'] | 'all'
  search?: string
}

export interface HrRectificationPrefill {
  recordId: string
  employeeId: string
  employeeName: string
  title: string
  problemStatus: string
  improvementScheme: string
  expectedResults: string
}

export async function fetchPdcaProposals(filters?: PdcaProposalFilters): Promise<PdcaProposal[]> {
  await randomDelay()
  let list = pdcaProposalsStore.list()
  if (filters?.submitterId) {
    list = list.filter((p) => p.SubmitterId === filters.submitterId)
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((p) => p.Status === filters.status)
  }
  if (filters?.category && filters.category !== 'all') {
    list = list.filter((p) => p.Category === filters.category)
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter((p) => p.Title.toLowerCase().includes(q))
  }
  return list
}

export async function fetchPdcaProposal(id: string): Promise<PdcaProposal> {
  await randomDelay()
  const proposal = pdcaProposalsStore.getById(id)
  if (!proposal) throw new ApiError('Proposal not found', 404)
  return proposal
}

export async function fetchHrRectificationPrefill(
  fromHr: string,
): Promise<HrRectificationPrefill | null> {
  await randomDelay()
  const record =
    appraisalWorkflowStore.getRecord(fromHr) ??
    appraisalWorkflowStore.getRecords().find((r) => r.EmployeeId === fromHr)
  if (!record || !record.HrAssistanceSummary) return null

  const grade = record.ConfirmedGrade ?? record.AutoGrade
  return {
    recordId: record.Id,
    employeeId: record.EmployeeId,
    employeeName: record.EmployeeName,
    title: `Performance improvement — ${record.EmployeeName}`,
    problemStatus: `Employee ${record.EmployeeName} (${record.Department}) received grade ${grade} with total score ${record.TotalScore}. ${record.ReviewOpinion ?? 'Performance shortfall identified during appraisal.'} HR assistance type: ${record.HrAssistanceType ?? 'coaching'}. ${record.HrAssistanceSummary}`,
    improvementScheme: `Follow-up plan from HR rectification (${record.HrAssistanceType ?? 'coaching'}): ${record.HrAssistanceSummary}`,
    expectedResults: `Restore performance to at least grade C within the next appraisal cycle through structured coaching and measurable KPI recovery for ${record.EmployeeName}.`,
  }
}

export async function savePdcaProposal(
  input: PdcaProposalInput,
  submitter: { id: string; name: string },
): Promise<PdcaProposal> {
  await randomDelay()
  const proposal: PdcaProposal = {
    Id: input.Id ?? crypto.randomUUID(),
    OrganizationId: MOCK_ORGANIZATION_ID,
    Title: input.Title.trim(),
    Category: input.Category,
    ProblemStatus: input.ProblemStatus.trim(),
    ImprovementScheme: input.ImprovementScheme.trim(),
    ExpectedResults: input.ExpectedResults.trim(),
    Attachments: input.Attachments,
    SubmitterId: submitter.id,
    SubmitterName: submitter.name,
    Status: 'pending_evaluation',
    SubmittedAt: new Date().toISOString(),
    SourceHrRectificationId: input.SourceHrRectificationId,
    AuditorComments: null,
  }

  const parsed = PdcaProposalSchema.safeParse(proposal)
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid proposal', 400)
  }

  return pdcaProposalsStore.save(parsed.data)
}

export async function createPdcaFromHrRectification(
  recordId: string,
  submitter: { id: string; name: string },
): Promise<PdcaProposal> {
  await randomDelay()
  const prefill = await fetchHrRectificationPrefill(recordId)
  if (!prefill) throw new ApiError('HR rectification record not found', 404)

  const proposal = await savePdcaProposal(
    {
      Title: prefill.title,
      Category: 'management',
      ProblemStatus: prefill.problemStatus,
      ImprovementScheme: prefill.improvementScheme,
      ExpectedResults: prefill.expectedResults,
      Attachments: [],
      SourceHrRectificationId: prefill.recordId,
    },
    submitter,
  )

  const record = appraisalWorkflowStore.getRecord(recordId)
  if (record) {
    appraisalWorkflowStore.saveRecord({
      ...record,
      LinkedPdcaProposalId: proposal.Id,
    })
  }

  return proposal
}

export function notifyAuditorInboxMock(proposal: PdcaProposal): void {
  void proposal
}
