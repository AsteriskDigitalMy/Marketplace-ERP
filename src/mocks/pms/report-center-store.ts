import type { GeneratedReport, ReportCatalogItem } from '@/models/pms/operations'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

const DEFAULT_CATALOG: ReportCatalogItem[] = [
  {
    Id: 'a1000000-0000-0000-0000-000000000001',
    Name: 'Daily Production Output',
    Category: 'production',
    Description: 'Line-by-line output, downtime, and shift attainment for leather cutting and sewing.',
    SupportedCycles: ['daily'],
    LastGeneratedAt: hoursAgo(8),
  },
  {
    Id: 'a1000000-0000-0000-0000-000000000002',
    Name: 'Weekly OEE Summary',
    Category: 'production',
    Description: 'Equipment effectiveness by work center with availability, performance, and quality factors.',
    SupportedCycles: ['weekly'],
    LastGeneratedAt: hoursAgo(30),
  },
  {
    Id: 'a1000000-0000-0000-0000-000000000003',
    Name: 'Daily Defect Log',
    Category: 'quality',
    Description: 'Defect counts by type, line, and disposition for IQC and in-process inspection.',
    SupportedCycles: ['daily', 'weekly'],
    LastGeneratedAt: hoursAgo(12),
  },
  {
    Id: 'a1000000-0000-0000-0000-000000000004',
    Name: 'Monthly Defect Pareto',
    Category: 'quality',
    Description: 'Pareto analysis of top defect modes with cumulative contribution percentages.',
    SupportedCycles: ['monthly'],
    LastGeneratedAt: hoursAgo(72),
  },
  {
    Id: 'a1000000-0000-0000-0000-000000000005',
    Name: 'Weekly Inbound Logistics',
    Category: 'supply_chain',
    Description: 'Inbound ASN adherence, dock-to-stock time, and supplier on-time delivery.',
    SupportedCycles: ['weekly', 'monthly'],
    LastGeneratedAt: hoursAgo(48),
  },
  {
    Id: 'a1000000-0000-0000-0000-000000000006',
    Name: 'Monthly KPI Achievement',
    Category: 'performance',
    Description: 'Department KPI attainment vs targets from published calculation jobs.',
    SupportedCycles: ['monthly'],
    LastGeneratedAt: hoursAgo(96),
  },
  {
    Id: 'a1000000-0000-0000-0000-000000000007',
    Name: 'Quarterly Appraisal Summary',
    Category: 'performance',
    Description: 'Grade distribution and cycle completion from executive-published appraisal results.',
    SupportedCycles: ['quarterly'],
    LastGeneratedAt: null,
  },
  {
    Id: 'a1000000-0000-0000-0000-000000000008',
    Name: 'Monthly Cost Variance',
    Category: 'cost',
    Description: 'Material, labor, and overhead variance against standard cost for finishing operations.',
    SupportedCycles: ['monthly', 'quarterly'],
    LastGeneratedAt: hoursAgo(120),
  },
]

let catalog: ReportCatalogItem[] = [...DEFAULT_CATALOG]
const lastGenerated: Record<string, string> = {}

/** Mock archived data readiness by report + cycle + period key */
const NOT_READY_KEYS = new Set([
  'a1000000-0000-0000-0000-000000000007:quarterly:2026-Q2',
])

export const reportCenterStore = {
  listCatalog(): ReportCatalogItem[] {
    return catalog.map((item) => ({
      ...item,
      LastGeneratedAt: lastGenerated[item.Id] ?? item.LastGeneratedAt,
    }))
  },

  getCatalogItem(id: string): ReportCatalogItem | undefined {
    return this.listCatalog().find((r) => r.Id === id)
  },

  checkReadiness(reportId: string, cycle: string, periodKey: string): {
    ready: boolean
    readinessPct: number
    missingSources: string[]
  } {
    const key = `${reportId}:${cycle}:${periodKey}`
    if (NOT_READY_KEYS.has(key)) {
      return {
        ready: false,
        readinessPct: 62,
        missingSources: [
          'Appraisal cycle not published (executive final review)',
          'Employee grade confirmations pending',
        ],
      }
    }
    if (periodKey.includes('2099')) {
      return {
        ready: false,
        readinessPct: 0,
        missingSources: ['Period not archived in data warehouse'],
      }
    }
    return { ready: true, readinessPct: 100, missingSources: [] }
  },

  markGenerated(reportId: string, generatedAt: string): void {
    lastGenerated[reportId] = generatedAt
    const idx = catalog.findIndex((r) => r.Id === reportId)
    if (idx >= 0) catalog[idx] = { ...catalog[idx], LastGeneratedAt: generatedAt }
  },

  buildMockReport(
    item: ReportCatalogItem,
    cycle: GeneratedReport['Cycle'],
    periodLabel: string,
  ): GeneratedReport {
    const generatedAt = new Date().toISOString()
    const base = {
      ReportId: item.Id,
      ReportName: item.Name,
      Cycle: cycle,
      PeriodLabel: periodLabel,
      GeneratedAt: generatedAt,
    }

    if (item.Id === 'a1000000-0000-0000-0000-000000000007') {
      return {
        ...base,
        Sections: [
          {
            Title: 'Grade distribution',
            Columns: ['Grade', 'Headcount', 'Share %'],
            Rows: [
              ['A', 2, 33],
              ['B', 1, 17],
              ['C', 1, 17],
              ['D', 2, 33],
            ],
            Summary: { TotalEmployees: 6, AvgScore: 74.2 },
          },
          {
            Title: 'Department breakdown',
            Columns: ['Department', 'Avg score', 'Published'],
            Rows: [
              ['Cutting', 71.5, 'Yes'],
              ['Sewing', 76.8, 'Yes'],
              ['Logistics', 78.0, 'Yes'],
            ],
            Summary: null,
          },
        ],
      }
    }

    if (item.Category === 'production') {
      return {
        ...base,
        Sections: [
          {
            Title: 'Output by line',
            Columns: ['Line', 'Planned', 'Actual', 'Attainment %'],
            Rows: [
              ['Cutting A', 1200, 1156, 96.3],
              ['Sewing B', 980, 942, 96.1],
              ['Finishing C', 640, 610, 95.3],
            ],
            Summary: { TotalOutput: 2708, AvgAttainment: 95.9 },
          },
        ],
      }
    }

    if (item.Category === 'quality') {
      return {
        ...base,
        Sections: [
          {
            Title: 'Defect summary',
            Columns: ['Defect type', 'Count', 'PPM'],
            Rows: [
              ['Surface scratch', 42, 310],
              ['Color mismatch', 18, 133],
              ['Stitch skip', 11, 81],
            ],
            Summary: { TotalDefects: 71, YieldPct: 98.2 },
          },
        ],
      }
    }

    if (item.Category === 'supply_chain') {
      return {
        ...base,
        Sections: [
          {
            Title: 'Inbound performance',
            Columns: ['Supplier', 'ASN on-time %', 'Dock-to-stock (hrs)'],
            Rows: [
              ['Leather Co. A', 94, 4.2],
              ['Thread Supply B', 88, 6.1],
              ['Hardware C', 91, 3.8],
            ],
            Summary: { AvgOnTime: 91, AvgDockToStock: 4.7 },
          },
        ],
      }
    }

    if (item.Category === 'performance') {
      return {
        ...base,
        Sections: [
          {
            Title: 'KPI attainment',
            Columns: ['KPI', 'Target', 'Actual', 'Status'],
            Rows: [
              ['Monthly output', 100, 96.3, 'Yellow'],
              ['First-pass yield', 98, 98.2, 'Green'],
              ['On-time delivery', 95, 92.1, 'Yellow'],
            ],
            Summary: { Green: 1, Yellow: 2, Red: 0 },
          },
        ],
      }
    }

    return {
      ...base,
      Sections: [
        {
          Title: 'Cost variance',
          Columns: ['Category', 'Standard', 'Actual', 'Variance %'],
          Rows: [
            ['Material', 125000, 128400, 2.7],
            ['Labor', 89000, 87200, -2.0],
            ['Overhead', 34000, 35100, 3.2],
          ],
          Summary: { TotalVariancePct: 1.1 },
        },
      ],
    }
  },

  reset(): void {
    catalog = [...DEFAULT_CATALOG]
    Object.keys(lastGenerated).forEach((k) => delete lastGenerated[k])
  },
}

export const REPORT_ORGANIZATION_ID = MOCK_ORGANIZATION_ID
