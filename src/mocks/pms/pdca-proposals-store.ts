import type { PdcaProposal } from '@/models/pms/operations'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()
}

const DEFAULT_PROPOSALS: PdcaProposal[] = [
  {
    Id: '90000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Title: 'Reduce cutting line material waste',
    Category: 'production',
    ProblemStatus:
      'Current cutting line yields 4.2% fabric waste per batch, exceeding the 3% target. Operators report inconsistent marker alignment and frequent re-cuts during peak shifts.',
    ImprovementScheme:
      'Introduce laser-guided marker templates and a pre-cut checklist at shift handover. Train two line leads as waste auditors with weekly gemba walks.',
    ExpectedResults:
      'Target waste below 2.8% within one quarter and recover approximately $18k monthly in material cost.',
    Attachments: ['waste-audit-q1.pdf'],
    SubmitterId: MOCK_ADMIN_USER_ID,
    SubmitterName: 'System Administrator',
    Status: 'pending_evaluation',
    SubmittedAt: daysAgo(3),
    SourceHrRectificationId: null,
    AuditorComments: null,
  },
  {
    Id: '90000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Title: 'Automate overtime approval routing',
    Category: 'management',
    ProblemStatus:
      'Overtime requests are emailed to supervisors and often delayed over weekends. Payroll closes with missing approvals, causing manual corrections and employee disputes.',
    ImprovementScheme:
      'Deploy a mobile approval workflow integrated with the existing HR module. Escalate pending requests after 24 hours to department managers.',
    ExpectedResults:
      'Cut overtime approval cycle from 3 days to under 8 hours and eliminate payroll adjustment tickets.',
    Attachments: [],
    SubmitterId: MOCK_ADMIN_USER_ID,
    SubmitterName: 'System Administrator',
    Status: 'approved',
    SubmittedAt: daysAgo(14),
    SourceHrRectificationId: null,
    AuditorComments: 'Strong ROI case. Proceed with pilot in Sewing department.',
  },
  {
    Id: '90000000-0000-0000-0000-000000000003',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Title: 'Consolidate inbound inspection stations',
    Category: 'efficiency',
    ProblemStatus:
      'IQC stations are duplicated across two warehouses, doubling inspector travel time and creating inconsistent defect coding between sites.',
    ImprovementScheme:
      'Merge inspection into a single digital station with shared defect taxonomy and barcode scanning at the primary dock.',
    ExpectedResults:
      'Reduce average inspection turnaround by 35% and standardize defect reporting for supplier scorecards.',
    Attachments: ['dock-layout-sketch.png'],
    SubmitterId: MOCK_ADMIN_USER_ID,
    SubmitterName: 'System Administrator',
    Status: 'in_execution',
    SubmittedAt: daysAgo(30),
    SourceHrRectificationId: null,
    AuditorComments: 'Approved for phased rollout.',
  },
  {
    Id: '90000000-0000-0000-0000-000000000004',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Title: 'LED lighting retrofit for finishing hall',
    Category: 'cost',
    ProblemStatus:
      'Finishing hall lighting consumes 22% more electricity than comparable lines due to outdated fixtures and poor zoning controls.',
    ImprovementScheme:
      'Replace fixtures with motion-zoned LED panels and tie schedules to production calendar.',
    ExpectedResults:
      'Achieve 18% energy reduction with payback within 14 months.',
    Attachments: [],
    SubmitterId: MOCK_ADMIN_USER_ID,
    SubmitterName: 'System Administrator',
    Status: 'completed',
    SubmittedAt: daysAgo(90),
    SourceHrRectificationId: null,
    AuditorComments: 'Verified savings in utility reconciliation.',
  },
  {
    Id: '90000000-0000-0000-0000-000000000005',
    OrganizationId: MOCK_ORGANIZATION_ID,
    Title: 'Centralize spare parts catalog',
    Category: 'management',
    ProblemStatus:
      'Maintenance teams maintain separate spreadsheets for spare parts, causing duplicate orders and stockouts on critical sewing machine components.',
    ImprovementScheme:
      'Pilot a shared catalog with min/max thresholds and monthly cycle counts.',
    ExpectedResults:
      'Reduce emergency purchase orders and improve MTTR on critical equipment.',
    Attachments: [],
    SubmitterId: MOCK_ADMIN_USER_ID,
    SubmitterName: 'System Administrator',
    Status: 'rejected',
    SubmittedAt: daysAgo(20),
    SourceHrRectificationId: null,
    AuditorComments: 'Defer until CMMS upgrade completes in Q3.',
  },
]

let proposals: PdcaProposal[] = [...DEFAULT_PROPOSALS]

export const pdcaProposalsStore = {
  list(): PdcaProposal[] {
    return [...proposals].sort(
      (a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime(),
    )
  },

  getById(id: string): PdcaProposal | undefined {
    return proposals.find((p) => p.Id === id)
  },

  listBySubmitter(submitterId: string): PdcaProposal[] {
    return this.list().filter((p) => p.SubmitterId === submitterId)
  },

  save(proposal: PdcaProposal): PdcaProposal {
    const idx = proposals.findIndex((p) => p.Id === proposal.Id)
    if (idx >= 0) proposals[idx] = proposal
    else proposals.push(proposal)
    return proposal
  },

  reset(): void {
    proposals = [...DEFAULT_PROPOSALS]
  },
}
