import { randomDelay } from '@/lib/api/delay'
import { ApiError } from '@/lib/api/errors'
import type { PerformanceGrade } from '@/models/common/enums'
import type { AppraisalCycle, AppraisalEmployeeRecord } from '@/models/pms/operations'
import { appraisalSchemesStore } from '@/mocks/pms/appraisal-schemes-store'
import { appraisalWorkflowStore } from '@/mocks/pms/appraisal-workflow-store'
import { createPdcaFromHrRectification } from '@/services/pms/pdca/pdca-proposal-service'

export async function fetchAppraisalCycles(): Promise<AppraisalCycle[]> {
  await randomDelay()
  return appraisalWorkflowStore.getCycles()
}

export async function fetchAppraisalCycle(id: string): Promise<AppraisalCycle> {
  await randomDelay()
  const cycle = appraisalWorkflowStore.getCycle(id)
  if (!cycle) throw new ApiError('Cycle not found', 404)
  return cycle
}

export async function fetchAppraisalRecords(cycleId: string): Promise<AppraisalEmployeeRecord[]> {
  await randomDelay()
  return appraisalWorkflowStore.getRecords(cycleId)
}

export async function fetchAppraisalRecord(id: string): Promise<AppraisalEmployeeRecord> {
  await randomDelay()
  const record = appraisalWorkflowStore.getRecord(id)
  if (!record) throw new ApiError('Record not found', 404)
  return record
}

export async function generateAppraisals(cycleId: string): Promise<{ count: number }> {
  await randomDelay(800, 1500)
  const cycle = appraisalWorkflowStore.getCycle(cycleId)
  if (!cycle) throw new ApiError('Cycle not found', 404)
  if (cycle.KpiCompletenessPct < 100) {
    throw new ApiError('KPI data incomplete for this cycle', 400)
  }
  const scheme = appraisalSchemesStore.getById(cycle.SchemeId)
  if (!scheme || scheme.Status !== 'active') {
    throw new ApiError('No active appraisal scheme for this cycle', 400)
  }
  if (cycle.Status === 'generated' || cycle.Status === 'published') {
    throw new ApiError('Cycle already generated', 400)
  }
  const generated = appraisalWorkflowStore.generateForCycle(cycleId)
  return { count: generated.length }
}

export async function previewEmployeeAppraisal(
  cycleId: string,
  employeeId: string,
): Promise<AppraisalEmployeeRecord | null> {
  await randomDelay()
  const records = appraisalWorkflowStore.getRecords(cycleId)
  return records.find((r) => r.EmployeeId === employeeId) ?? null
}

export async function confirmPreliminaryGrades(
  items: { recordId: string; confirmedGrade: PerformanceGrade; opinion?: string }[],
): Promise<void> {
  await randomDelay()
  for (const item of items) {
    const record = appraisalWorkflowStore.getRecord(item.recordId)
    if (!record || record.Status !== 'pending_preliminary') continue
    const grade = item.confirmedGrade
    const nextStatus =
      grade === 'A' || grade === 'B' ? 'pending_final_review' : 'pending_hr'
    const updated: AppraisalEmployeeRecord = {
      ...record,
      ConfirmedGrade: grade,
      ReviewOpinion: item.opinion?.trim() || null,
      Status: nextStatus,
      RoutingSource: grade === 'A' || grade === 'B' ? 'direct_ab' : null,
    }
    appraisalWorkflowStore.appendShuntLog(
      updated,
      'Grade confirmed',
      `Routed to ${nextStatus === 'pending_final_review' ? 'CFO final review' : 'HR queue'}`,
    )
    appraisalWorkflowStore.saveRecord(updated)
  }
}

export async function submitHrRectification(
  recordId: string,
  input: {
    assistanceType: string
    summary: string
    createPdca?: boolean
  },
  submitter?: { id: string; name: string },
): Promise<AppraisalEmployeeRecord> {
  await randomDelay()
  const record = appraisalWorkflowStore.getRecord(recordId)
  if (!record) throw new ApiError('Record not found', 404)
  if (!['pending_hr', 're_rectification'].includes(record.Status)) {
    throw new ApiError('Employee not in HR queue', 400)
  }

  let linkedProposalId = record.LinkedPdcaProposalId
  if (input.createPdca && submitter) {
    const proposal = await createPdcaFromHrRectification(recordId, submitter)
    linkedProposalId = proposal.Id
  } else if (input.createPdca) {
    linkedProposalId = crypto.randomUUID()
  }

  const updated: AppraisalEmployeeRecord = {
    ...record,
    HrAssistanceType: input.assistanceType,
    HrAssistanceSummary: input.summary,
    Status: 'hr_processed',
    LinkedPdcaProposalId: linkedProposalId,
  }
  appraisalWorkflowStore.appendShuntLog(updated, 'HR assistance submitted', input.summary, 'HR Specialist')
  return appraisalWorkflowStore.saveRecord(updated)
}

export async function submitSecondaryReview(
  recordId: string,
  pass: boolean,
  opinion: string,
): Promise<AppraisalEmployeeRecord> {
  await randomDelay()
  const record = appraisalWorkflowStore.getRecord(recordId)
  if (!record) throw new ApiError('Record not found', 404)
  if (record.Status !== 'hr_processed' && record.Status !== 'pending_secondary') {
    throw new ApiError('Not awaiting secondary review', 400)
  }
  if (!opinion.trim()) throw new ApiError('Opinion is required', 400)

  if (pass) {
    const updated: AppraisalEmployeeRecord = {
      ...record,
      SecondaryOpinion: opinion.trim(),
      Status: 'pending_final_review',
      RoutingSource: 'post_hr',
    }
    appraisalWorkflowStore.appendShuntLog(updated, 'Secondary review passed', opinion)
    return appraisalWorkflowStore.saveRecord(updated)
  }

  const updated: AppraisalEmployeeRecord = {
    ...record,
    SecondaryOpinion: opinion.trim(),
    Status: 're_rectification',
  }
  appraisalWorkflowStore.appendShuntLog(updated, 'Secondary review failed', 'Returned to HR')
  return appraisalWorkflowStore.saveRecord(updated)
}

export async function submitFinalReview(
  recordId: string,
  approve: boolean,
  opinion: string,
): Promise<AppraisalEmployeeRecord> {
  await randomDelay()
  const record = appraisalWorkflowStore.getRecord(recordId)
  if (!record) throw new ApiError('Record not found', 404)
  if (record.Status !== 'pending_final_review') {
    throw new ApiError('Not pending final review', 404)
  }
  if (!approve && !opinion.trim()) {
    throw new ApiError('Opinion required when rejecting', 400)
  }

  const updated: AppraisalEmployeeRecord = {
    ...record,
    FinalOpinion: opinion.trim() || null,
    Status: approve ? 'published' : 'returned_auditor',
  }
  appraisalWorkflowStore.appendShuntLog(
    updated,
    approve ? 'Final approval' : 'Final rejection',
    opinion || 'Approved',
    'CFO',
  )
  return appraisalWorkflowStore.saveRecord(updated)
}

export function getQueueCounts() {
  const all = appraisalWorkflowStore.getRecords()
  return {
    hr: all.filter((r) => ['pending_hr', 're_rectification'].includes(r.Status)).length,
    secondary: all.filter((r) => r.Status === 'hr_processed').length,
    final: all.filter((r) => r.Status === 'pending_final_review').length,
    preliminary: all.filter((r) => r.Status === 'pending_preliminary').length,
  }
}
