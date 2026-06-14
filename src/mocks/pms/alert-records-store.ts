import type { AlertRecord } from '@/models/pms/operations'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString()
}

const DEFAULT_RECORDS: AlertRecord[] = [
  {
    Id: '71000000-0000-0000-0000-000000000001',
    OrganizationId: MOCK_ORGANIZATION_ID,
    RuleId: '70000000-0000-0000-0000-000000000001',
    RuleName: 'KPI achievement below 80%',
    Type: 'kpi',
    MonitoredObjectLabel: 'Monthly Output KPI',
    Level: 'important',
    TriggeredAt: hoursAgo(8),
    DeadlineAt: hoursFromNow(40),
    IsOverdue: false,
    EscalationHistory: [],
    Status: 'open',
    OwnerId: MOCK_ADMIN_USER_ID,
    Cause: null,
    ImpactScope: null,
    RectificationMeasures: null,
    PlannedCompletionDate: null,
    CompletionResult: null,
    VerificationOpinion: null,
    Attachments: [],
    DisposalLog: [
      {
        At: hoursAgo(8),
        Actor: 'System',
        Action: 'Alert triggered',
        Detail: 'KPI achievement dropped below threshold',
      },
    ],
  },
  {
    Id: '71000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    RuleId: '70000000-0000-0000-0000-000000000002',
    RuleName: 'Project milestone overdue',
    Type: 'project',
    MonitoredObjectLabel: 'Spring Collection Launch',
    Level: 'urgent',
    EffectiveLevel: 'urgent',
    TriggeredAt: hoursAgo(30),
    DeadlineAt: hoursAgo(6),
    IsOverdue: true,
    EscalationHistory: [
      {
        At: hoursAgo(6),
        FromLevel: 'important',
        ToLevel: 'urgent',
        Reason: 'Deadline missed without disposal',
      },
    ],
    Status: 'investigating',
    OwnerId: MOCK_ADMIN_USER_ID,
    Cause: 'Supplier delay on fabric delivery',
    ImpactScope: 'Cutting and sewing milestones',
    RectificationMeasures: null,
    PlannedCompletionDate: null,
    CompletionResult: null,
    VerificationOpinion: null,
    Attachments: [],
    DisposalLog: [
      {
        At: hoursAgo(30),
        Actor: 'System',
        Action: 'Alert triggered',
        Detail: 'Milestone overdue by 3 days',
      },
      {
        At: hoursAgo(20),
        Actor: 'System Administrator',
        Action: 'Draft saved',
        Detail: 'Root cause investigation in progress',
      },
    ],
  },
  {
    Id: '71000000-0000-0000-0000-000000000003',
    OrganizationId: MOCK_ORGANIZATION_ID,
    RuleId: '70000000-0000-0000-0000-000000000003',
    RuleName: 'Filing submission overdue',
    Type: 'filing',
    MonitoredObjectLabel: 'Q1 Production Report',
    Level: 'general',
    TriggeredAt: hoursAgo(72),
    DeadlineAt: hoursFromNow(12),
    IsOverdue: false,
    EscalationHistory: [],
    Status: 'rectifying',
    OwnerId: MOCK_ADMIN_USER_ID,
    Cause: 'Data consolidation delayed across plants',
    ImpactScope: 'Q1 compliance reporting',
    RectificationMeasures: 'Expedite plant data exports and assign backup reviewer',
    PlannedCompletionDate: hoursFromNow(48),
    CompletionResult: null,
    VerificationOpinion: null,
    Attachments: ['plant-export-checklist.pdf'],
    DisposalLog: [
      {
        At: hoursAgo(72),
        Actor: 'System',
        Action: 'Alert triggered',
        Detail: 'Filing past due date',
      },
      {
        At: hoursAgo(48),
        Actor: 'System Administrator',
        Action: 'Root cause submitted',
        Detail: 'Moved to rectifying',
      },
    ],
  },
  {
    Id: '71000000-0000-0000-0000-000000000004',
    OrganizationId: MOCK_ORGANIZATION_ID,
    RuleId: '70000000-0000-0000-0000-000000000002',
    RuleName: 'Project milestone overdue',
    Type: 'project',
    MonitoredObjectLabel: 'Warehouse Automation',
    Level: 'important',
    TriggeredAt: hoursAgo(96),
    DeadlineAt: hoursAgo(24),
    IsOverdue: true,
    EscalationHistory: [],
    Status: 'pending_verification',
    OwnerId: MOCK_ADMIN_USER_ID,
    Cause: 'Vendor API integration blocked',
    ImpactScope: 'Automation go-live',
    RectificationMeasures: 'Switched to manual reconciliation bridge',
    PlannedCompletionDate: hoursAgo(12),
    CompletionResult: 'Bridge deployed; monitoring for 48h',
    VerificationOpinion: null,
    Attachments: ['bridge-runbook.docx'],
    DisposalLog: [
      {
        At: hoursAgo(96),
        Actor: 'System',
        Action: 'Alert triggered',
        Detail: 'Budget variance exceeded',
      },
      {
        At: hoursAgo(36),
        Actor: 'System Administrator',
        Action: 'Submitted for verification',
        Detail: 'Awaiting manager review',
      },
    ],
  },
  {
    Id: '71000000-0000-0000-0000-000000000005',
    OrganizationId: MOCK_ORGANIZATION_ID,
    RuleId: '70000000-0000-0000-0000-000000000001',
    RuleName: 'KPI achievement below 80%',
    Type: 'kpi',
    MonitoredObjectLabel: 'Quality Yield KPI',
    Level: 'general',
    TriggeredAt: hoursAgo(240),
    DeadlineAt: hoursAgo(120),
    IsOverdue: false,
    EscalationHistory: [],
    Status: 'closed',
    OwnerId: MOCK_ADMIN_USER_ID,
    Cause: 'Temporary equipment calibration drift',
    ImpactScope: 'Line B output',
    RectificationMeasures: 'Recalibrated sensors and retrained operators',
    PlannedCompletionDate: hoursAgo(150),
    CompletionResult: 'Yield restored above 92%',
    VerificationOpinion: 'Verified — root cause addressed',
    Attachments: [],
    DisposalLog: [
      {
        At: hoursAgo(240),
        Actor: 'System',
        Action: 'Alert triggered',
        Detail: 'Yield below threshold',
      },
      {
        At: hoursAgo(130),
        Actor: 'System Administrator',
        Action: 'Verification passed',
        Detail: 'Alert closed',
      },
    ],
  },
]

let records: AlertRecord[] = [...DEFAULT_RECORDS]

function appendLog(
  record: AlertRecord,
  action: string,
  detail: string,
  actor = 'System Administrator',
): void {
  record.DisposalLog.push({
    At: new Date().toISOString(),
    Actor: actor,
    Action: action,
    Detail: detail,
  })
}

export const alertRecordsStore = {
  list(): AlertRecord[] {
    return records.map((r) => ({ ...r, DisposalLog: [...r.DisposalLog] }))
  },

  getById(id: string): AlertRecord | undefined {
    const r = records.find((x) => x.Id === id)
    return r ? { ...r, DisposalLog: [...r.DisposalLog] } : undefined
  },

  save(record: AlertRecord): AlertRecord {
    const idx = records.findIndex((r) => r.Id === record.Id)
    if (idx >= 0) records[idx] = record
    else records.push(record)
    return record
  },

  appendLog,

  reset(): void {
    records = [...DEFAULT_RECORDS]
  },
}
