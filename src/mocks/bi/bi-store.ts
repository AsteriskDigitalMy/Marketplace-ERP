import { CROSS_LINKS } from '@/mocks/shared/cross-links'
import { mesStore } from '@/mocks/mes/mes-store'
import { scmStore } from '@/mocks/scm/scm-store'
import { wmsStore } from '@/mocks/wms/wms-store'
import type { BiDashboardPayload } from '@/models/bi'

const now = '2026-06-14T10:00:00Z'

export const biDashboards: Record<string, BiDashboardPayload> = {
  executive: {
    DashboardId: CROSS_LINKS.executiveDashboardId,
    Title: 'Executive cockpit',
    LastRefreshedAt: now,
    Filters: { period: 'MTD', org: 'all' },
    KpiCards: [
      { Id: '1', Label: 'Revenue (MTD)', Value: 2480000, Unit: 'USD', StatusColor: 'green', TrendPct: 8.2 },
      { Id: '2', Label: 'On-time delivery', Value: 94, Unit: '%', StatusColor: 'green', TrendPct: 2.1 },
      { Id: '3', Label: 'Production OEE', Value: 78, Unit: '%', StatusColor: 'yellow', TrendPct: -1.5 },
      { Id: '4', Label: 'Inventory turns', Value: 6.2, Unit: 'x', StatusColor: 'green', TrendPct: 0.4 },
    ],
    Charts: [
      {
        Id: 'c1',
        Title: 'Revenue by month',
        Type: 'bar',
        Series: [
          { Label: 'Jan', Value: 1800000 },
          { Label: 'Feb', Value: 1950000 },
          { Label: 'Mar', Value: 2100000 },
          { Label: 'Apr', Value: 2250000 },
          { Label: 'May', Value: 2380000 },
          { Label: 'Jun', Value: 2480000 },
        ],
      },
    ],
  },
  scm: {
    DashboardId: '60000000-0000-0000-0000-000000000002',
    Title: 'SCM dashboard',
    LastRefreshedAt: now,
    Filters: { period: 'MTD' },
    KpiCards: [
      { Id: '1', Label: 'Open orders', Value: scmStore.getOrders().length, Unit: '', StatusColor: 'green', TrendPct: null },
      { Id: '2', Label: 'Pending POs', Value: scmStore.getPurchaseOrders().length, Unit: '', StatusColor: 'yellow', TrendPct: null },
    ],
    Charts: [
      {
        Id: 'c1',
        Title: 'Order pipeline',
        Type: 'bar',
        Series: [
          { Label: 'Draft', Value: 0 },
          { Label: 'Review', Value: 0 },
          { Label: 'Effective', Value: 1 },
          { Label: 'Shipped', Value: 0 },
        ],
      },
    ],
  },
  mes: {
    DashboardId: '60000000-0000-0000-0000-000000000003',
    Title: 'MES dashboard',
    LastRefreshedAt: now,
    Filters: { period: 'today' },
    KpiCards: [
      { Id: '1', Label: 'Work orders', Value: mesStore.getWorkOrders().length, Unit: '', StatusColor: 'green', TrendPct: null },
      { Id: '2', Label: 'Avg OEE', Value: 78, Unit: '%', StatusColor: 'yellow', TrendPct: -1.5 },
    ],
    Charts: [
      {
        Id: 'c1',
        Title: 'WO completion',
        Type: 'bar',
        Series: [{ Label: 'WO-00142', Value: 35 }],
      },
    ],
  },
  wms: {
    DashboardId: '60000000-0000-0000-0000-000000000004',
    Title: 'WMS dashboard',
    LastRefreshedAt: now,
    Filters: { period: 'today' },
    KpiCards: [
      { Id: '1', Label: 'On-hand SKUs', Value: wmsStore.getMaterials().length, Unit: '', StatusColor: 'green', TrendPct: null },
      { Id: '2', Label: 'Open alerts', Value: wmsStore.getAlerts().filter((a) => !a.IsAcknowledged).length, Unit: '', StatusColor: 'red', TrendPct: null },
    ],
    Charts: [
      {
        Id: 'c1',
        Title: 'Inbound vs outbound',
        Type: 'bar',
        Series: [
          { Label: 'Inbound', Value: wmsStore.getInbound().length },
          { Label: 'Outbound', Value: wmsStore.getOutbound().length },
        ],
      },
    ],
  },
  finance: {
    DashboardId: '60000000-0000-0000-0000-000000000005',
    Title: 'SAP financial dashboard',
    LastRefreshedAt: now,
    Filters: { period: 'MTD' },
    KpiCards: [
      { Id: '1', Label: 'AP outstanding', Value: 18500, Unit: 'USD', StatusColor: 'yellow', TrendPct: null },
      { Id: '2', Label: 'AR outstanding', Value: 24800, Unit: 'USD', StatusColor: 'green', TrendPct: null },
    ],
    Charts: [{ Id: 'c1', Title: 'Sync status', Type: 'bar', Series: [{ Label: 'Synced', Value: 2 }, { Label: 'Failed', Value: 1 }] }],
  },
  kpi: {
    DashboardId: '60000000-0000-0000-0000-000000000006',
    Title: 'KPI / PMS dashboard',
    LastRefreshedAt: now,
    Filters: { period: 'Q2' },
    KpiCards: [
      { Id: '1', Label: 'Active projects', Value: 12, Unit: '', StatusColor: 'green', TrendPct: 5 },
      { Id: '2', Label: 'KPI on target', Value: 87, Unit: '%', StatusColor: 'green', TrendPct: 3 },
    ],
    Charts: [{ Id: 'c1', Title: 'Traffic lights', Type: 'bar', Series: [{ Label: 'Green', Value: 24 }, { Label: 'Yellow', Value: 5 }, { Label: 'Red', Value: 2 }] }],
  },
  workshop: {
    DashboardId: '60000000-0000-0000-0000-000000000007',
    Title: 'Workshop kanban',
    LastRefreshedAt: now,
    Filters: { line: 'SEW-L01' },
    KpiCards: [
      { Id: '1', Label: 'Today plan', Value: 400, Unit: 'pcs', StatusColor: 'green', TrendPct: null },
      { Id: '2', Label: 'Completed', Value: 140, Unit: 'pcs', StatusColor: 'yellow', TrendPct: null },
    ],
    Charts: [{ Id: 'c1', Title: 'Hourly output', Type: 'bar', Series: [{ Label: '08', Value: 20 }, { Label: '09', Value: 35 }, { Label: '10', Value: 40 }] }],
  },
  warehouse: {
    DashboardId: '60000000-0000-0000-0000-000000000008',
    Title: 'Warehouse kanban',
    LastRefreshedAt: now,
    Filters: { warehouse: 'WH-MAIN' },
    KpiCards: [
      { Id: '1', Label: 'Picks today', Value: 12, Unit: '', StatusColor: 'green', TrendPct: null },
      { Id: '2', Label: 'Receipts today', Value: 3, Unit: '', StatusColor: 'green', TrendPct: null },
    ],
    Charts: [{ Id: 'c1', Title: 'Task queue', Type: 'bar', Series: [{ Label: 'Inbound', Value: 1 }, { Label: 'Outbound', Value: 1 }] }],
  },
}

export const biStore = {
  getDashboard: (key: string) => biDashboards[key] ?? null,
  getDashboardKeys: () => Object.keys(biDashboards),
}
