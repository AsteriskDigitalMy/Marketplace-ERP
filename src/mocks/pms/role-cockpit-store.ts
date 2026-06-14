import type { CockpitRole } from '@/models/common/enums'
import type { RoleCockpit } from '@/models/pms/operations'
import { getStatusColor } from '@/lib/pms/traffic-light'

function nowIso(): string {
  return new Date().toISOString()
}

function card(
  id: string,
  label: string,
  value: number,
  unit: string,
  category: 'progress' | 'delay' | 'performance',
  trend: number | null,
) {
  return {
    Id: id,
    Label: label,
    Value: value,
    Unit: unit,
    StatusColor: getStatusColor(value, category),
    TrendPct: trend,
    Category: category,
  }
}

const COCKPITS: Record<CockpitRole, RoleCockpit> = {
  executive: {
    Role: 'executive',
    CockpitTitle: 'Executive Cockpit',
    LastRefreshedAt: nowIso(),
    RefreshIntervalSec: 60,
    Cards: [
      card('c-exec-1', 'Group KPI Achievement', 92.4, '%', 'progress', 2.1),
      card('c-exec-2', 'Open Alerts', 14, 'items', 'delay', -3),
      card('c-exec-3', 'Projects On Track', 87, '%', 'progress', 1.4),
      card('c-exec-4', 'Avg Appraisal Score', 88.2, 'pts', 'performance', 0.8),
    ],
    Charts: [
      {
        Id: 'ch-exec-1',
        Title: 'KPI achievement trend',
        Type: 'line',
        Category: 'progress',
        Series: [
          { Label: 'Jan', Value: 86 },
          { Label: 'Feb', Value: 88 },
          { Label: 'Mar', Value: 90 },
          { Label: 'Apr', Value: 92 },
        ],
      },
      {
        Id: 'ch-exec-2',
        Title: 'Portfolio health',
        Type: 'donut',
        Category: 'progress',
        Series: [
          { Label: 'On track', Value: 62 },
          { Label: 'At risk', Value: 24 },
          { Label: 'Delayed', Value: 14 },
        ],
      },
    ],
    Table: {
      Columns: ['Department', 'KPI %', 'Projects', 'Status'],
      Rows: [
        { Department: 'Cutting', 'KPI %': 94, Projects: 12, Status: 'Green' },
        { Department: 'Sewing', 'KPI %': 88, Projects: 18, Status: 'Yellow' },
        { Department: 'Finishing', 'KPI %': 91, Projects: 9, Status: 'Green' },
        { Department: 'Logistics', 'KPI %': 76, Projects: 6, Status: 'Red' },
      ],
    },
  },
  department_manager: {
    Role: 'department_manager',
    CockpitTitle: 'Department Manager Cockpit',
    LastRefreshedAt: nowIso(),
    RefreshIntervalSec: 60,
    Cards: [
      card('c-dept-1', 'Dept Completion', 89.5, '%', 'progress', 1.2),
      card('c-dept-2', 'Overdue Tasks', 5, 'tasks', 'delay', -2),
      card('c-dept-3', 'Team Members', 42, 'people', 'progress', null),
      card('c-dept-4', 'Open Issues', 3, 'issues', 'delay', 0),
    ],
    Charts: [
      {
        Id: 'ch-dept-1',
        Title: 'Team progress by group',
        Type: 'bar',
        Category: 'progress',
        Series: [
          { Label: 'Line A', Value: 92 },
          { Label: 'Line B', Value: 85 },
          { Label: 'Line C', Value: 78 },
          { Label: 'Support', Value: 95 },
        ],
      },
      {
        Id: 'ch-dept-2',
        Title: 'Weekly output trend',
        Type: 'line',
        Category: 'progress',
        Series: [
          { Label: 'W1', Value: 820 },
          { Label: 'W2', Value: 860 },
          { Label: 'W3', Value: 840 },
          { Label: 'W4', Value: 910 },
        ],
      },
    ],
    Table: {
      Columns: ['Team', 'Lead', 'Progress %', 'Tasks'],
      Rows: [
        { Team: 'Line A', Lead: 'Wei Lin', 'Progress %': 92, Tasks: 24 },
        { Team: 'Line B', Lead: 'Sarah Chen', 'Progress %': 85, Tasks: 31 },
        { Team: 'Line C', Lead: 'James Wu', 'Progress %': 78, Tasks: 19 },
      ],
    },
  },
  auditor: {
    Role: 'auditor',
    CockpitTitle: 'Audit Cockpit',
    LastRefreshedAt: nowIso(),
    RefreshIntervalSec: 120,
    Cards: [
      card('c-aud-1', 'Pending Reviews', 18, 'items', 'delay', 4),
      card('c-aud-2', 'Data Exceptions', 7, 'records', 'performance', -1),
      card('c-aud-3', 'Overdue Filings', 4, 'tasks', 'delay', 2),
      card('c-aud-4', 'Compliance Score', 96, '%', 'performance', 0.5),
    ],
    Charts: [
      {
        Id: 'ch-aud-1',
        Title: 'Exception heatmap',
        Type: 'bar',
        Category: 'performance',
        Series: [
          { Label: 'KPI', Value: 3 },
          { Label: 'Project', Value: 2 },
          { Label: 'Filing', Value: 4 },
          { Label: 'Appraisal', Value: 1 },
        ],
      },
      {
        Id: 'ch-aud-2',
        Title: 'Review backlog trend',
        Type: 'line',
        Category: 'delay',
        Series: [
          { Label: 'W1', Value: 22 },
          { Label: 'W2', Value: 20 },
          { Label: 'W3', Value: 19 },
          { Label: 'W4', Value: 18 },
        ],
      },
    ],
    Table: {
      Columns: ['Queue', 'Pending', 'Oldest (days)', 'Owner'],
      Rows: [
        { Queue: 'Data review L2', Pending: 8, 'Oldest (days)': 5, Owner: 'Audit pool' },
        { Queue: 'KPI exceptions', Pending: 4, 'Oldest (days)': 3, Owner: 'KPI team' },
        { Queue: 'Filing overdue', Pending: 6, 'Oldest (days)': 9, Owner: 'Ops admin' },
      ],
    },
  },
  hr: {
    Role: 'hr',
    CockpitTitle: 'HR Cockpit',
    LastRefreshedAt: nowIso(),
    RefreshIntervalSec: 60,
    Cards: [
      card('c-hr-1', 'Low Performers', 12, 'people', 'performance', -2),
      card('c-hr-2', 'PDCA Pending', 8, 'proposals', 'delay', 1),
      card('c-hr-3', 'Appraisals Due', 34, 'reviews', 'progress', 5),
      card('c-hr-4', 'Training Gaps', 6, 'roles', 'performance', 0),
    ],
    Charts: [
      {
        Id: 'ch-hr-1',
        Title: 'Performance distribution',
        Type: 'donut',
        Category: 'performance',
        Series: [
          { Label: 'A/B', Value: 45 },
          { Label: 'C', Value: 38 },
          { Label: 'D', Value: 17 },
        ],
      },
      {
        Id: 'ch-hr-2',
        Title: 'PDCA pipeline',
        Type: 'bar',
        Category: 'progress',
        Series: [
          { Label: 'Submitted', Value: 8 },
          { Label: 'Approved', Value: 5 },
          { Label: 'In execution', Value: 3 },
          { Label: 'Completed', Value: 12 },
        ],
      },
    ],
    Table: {
      Columns: ['Employee', 'Dept', 'Score', 'Grade'],
      Rows: [
        { Employee: 'Alex Kim', Dept: 'Sewing', Score: 62, Grade: 'D' },
        { Employee: 'Maria Lopez', Dept: 'Cutting', Score: 68, Grade: 'D' },
        { Employee: 'Tom Nguyen', Dept: 'Finishing', Score: 71, Grade: 'C' },
      ],
    },
  },
  employee: {
    Role: 'employee',
    CockpitTitle: 'My Performance Cockpit',
    LastRefreshedAt: nowIso(),
    RefreshIntervalSec: 60,
    Cards: [
      card('c-emp-1', 'My KPI Progress', 86, '%', 'progress', 3.2),
      card('c-emp-2', 'Appraisal Status', 1, 'pending', 'progress', null),
      card('c-emp-3', 'Tasks Due', 4, 'tasks', 'delay', -1),
      card('c-emp-4', 'PDCA Assigned', 2, 'items', 'progress', 0),
    ],
    Charts: [
      {
        Id: 'ch-emp-1',
        Title: 'My KPI trend',
        Type: 'line',
        Category: 'progress',
        Series: [
          { Label: 'Jan', Value: 78 },
          { Label: 'Feb', Value: 82 },
          { Label: 'Mar', Value: 84 },
          { Label: 'Apr', Value: 86 },
        ],
      },
      {
        Id: 'ch-emp-2',
        Title: 'Task completion',
        Type: 'bar',
        Category: 'progress',
        Series: [
          { Label: 'Done', Value: 18 },
          { Label: 'In progress', Value: 4 },
          { Label: 'Overdue', Value: 1 },
        ],
      },
    ],
    Table: {
      Columns: ['KPI', 'Target', 'Actual', 'Achievement %'],
      Rows: [
        { KPI: 'Output rate', Target: 100, Actual: 92, 'Achievement %': 92 },
        { KPI: 'Quality pass', Target: 98, Actual: 96, 'Achievement %': 98 },
        { KPI: 'On-time delivery', Target: 95, Actual: 88, 'Achievement %': 93 },
      ],
    },
  },
}

export type CockpitWidgetSection = 'Cards' | 'Charts' | 'Table'

let simulateSectionError: CockpitWidgetSection | null = null

export const roleCockpitStore = {
  getCockpit(role: CockpitRole): RoleCockpit {
    const base = COCKPITS[role]
    return {
      ...base,
      LastRefreshedAt: nowIso(),
      Cards: base.Cards.map((c) => ({
        ...c,
        StatusColor: getStatusColor(c.Value, c.Category ?? 'progress'),
      })),
    }
  },

  getSection(role: CockpitRole, section: CockpitWidgetSection): RoleCockpit[CockpitWidgetSection] {
    if (simulateSectionError === section) {
      throw new Error(`Mock failure loading ${section}`)
    }
    const cockpit = this.getCockpit(role)
    return cockpit[section]
  },

  setSimulateSectionError(section: CockpitWidgetSection | null): void {
    simulateSectionError = section
  },
}
