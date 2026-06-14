import { CROSS_LINKS } from '@/mocks/shared/cross-links'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import type {
  BaoGongReport,
  Equipment,
  IpqcInspection,
  OqcInspection,
  ReworkOrder,
  Team,
  ToolingRecord,
  WageLine,
  WorkOrder,
  WorkOrderCost,
} from '@/models/mes'

const audit = {
  CreatedBy: MOCK_ADMIN_USER_ID,
  CreatedDatetime: '2026-06-01T08:00:00Z',
  ModifiedBy: MOCK_ADMIN_USER_ID,
  ModifiedDatetime: '2026-06-10T14:00:00Z',
}

export const mesWorkOrders: WorkOrder[] = [
  {
    Id: CROSS_LINKS.workOrderId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    WorkOrderNumber: 'WO-2026-00142',
    ProductCode: 'STY-JKT-001',
    SalesOrderId: CROSS_LINKS.salesOrderId,
    SalesOrderNumber: 'SO-2026-10482',
    PlannedQty: 400,
    CompletedQty: 140,
    ScrapQty: 3,
    Status: 'in_progress',
    PlannedStart: '2026-06-12T08:00:00Z',
    PlannedEnd: '2026-07-05T17:00:00Z',
    LineId: CROSS_LINKS.productionLineId,
    ...audit,
  },
]

export const mesBaoGong: BaoGongReport[] = [
  {
    Id: '30000000-0000-0000-0000-000000000010',
    WorkOrderId: CROSS_LINKS.workOrderId,
    ProcessId: '10000000-0000-0000-0000-000000000050',
    ProcessName: 'Fabric cutting',
    OperatorId: MOCK_ADMIN_USER_ID,
    EquipmentNumber: 'CUT-L01',
    StartTime: '2026-06-12T08:00:00Z',
    CompleteTime: '2026-06-12T10:30:00Z',
    QualifiedQty: 140,
    UnqualifiedQty: 2,
    NonConformanceReason: 'Fabric defect',
    RemainingReportableQty: 258,
  },
]

export const mesIpqc: IpqcInspection[] = [
  {
    Id: '30000000-0000-0000-0000-000000000020',
    OrganizationId: MOCK_ORGANIZATION_ID,
    WorkOrderId: CROSS_LINKS.workOrderId,
    ProcessName: 'Main seam assembly',
    SampleSize: 20,
    DefectCount: 1,
    Result: 'pass',
    InspectedAt: '2026-06-13T14:00:00Z',
    InspectorId: MOCK_ADMIN_USER_ID,
  },
]

export const mesOqc: OqcInspection[] = [
  {
    Id: '30000000-0000-0000-0000-000000000021',
    OrganizationId: MOCK_ORGANIZATION_ID,
    WorkOrderId: CROSS_LINKS.workOrderId,
    BatchNumber: 'BATCH-001',
    SampleSize: 32,
    DefectCount: 0,
    Result: 'pass',
    InspectedAt: '2026-06-14T09:00:00Z',
  },
]

export const mesRework: ReworkOrder[] = [
  {
    Id: '30000000-0000-0000-0000-000000000022',
    OrganizationId: MOCK_ORGANIZATION_ID,
    WorkOrderId: CROSS_LINKS.workOrderId,
    ReworkNumber: 'RW-2026-001',
    DefectType: 'Stitch skip',
    Quantity: 5,
    Status: 'in_progress',
  },
]

export const mesEquipment: Equipment[] = [
  {
    Id: CROSS_LINKS.equipmentId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    EquipmentNumber: 'SEW-L01-M01',
    EquipmentName: 'Industrial sewing machine #1',
    LineId: CROSS_LINKS.productionLineId,
    Status: 'running',
    OeeTargetPct: 85,
    OeeActualPct: 78,
    ...audit,
  },
]

export const mesTooling: ToolingRecord[] = [
  {
    Id: '30000000-0000-0000-0000-000000000030',
    OrganizationId: MOCK_ORGANIZATION_ID,
    ToolCode: 'DIE-JKT-01',
    ToolName: 'Jacket pocket die',
    Status: 'in_use',
    LocationId: CROSS_LINKS.locationId,
  },
]

export const mesTeams: Team[] = [
  {
    Id: '30000000-0000-0000-0000-000000000040',
    OrganizationId: MOCK_ORGANIZATION_ID,
    TeamCode: 'TEAM-SEW-A',
    TeamName: 'Sewing team A',
    LineId: CROSS_LINKS.productionLineId,
    MemberCount: 12,
  },
]

export const mesWages: WageLine[] = [
  {
    Id: '30000000-0000-0000-0000-000000000050',
    OrganizationId: MOCK_ORGANIZATION_ID,
    OperatorId: MOCK_ADMIN_USER_ID,
    OperatorName: 'Operator A',
    WorkOrderId: CROSS_LINKS.workOrderId,
    ProcessName: 'Main seam assembly',
    PieceCount: 140,
    Rate: 0.85,
    Amount: 119,
    Period: '2026-06',
  },
]

export const mesCosts: WorkOrderCost[] = [
  {
    Id: '30000000-0000-0000-0000-000000000060',
    OrganizationId: MOCK_ORGANIZATION_ID,
    WorkOrderId: CROSS_LINKS.workOrderId,
    MaterialCost: 11400,
    LaborCost: 1680,
    OverheadCost: 560,
    TotalCost: 13640,
  },
]

export const mesStore = {
  getWorkOrders: () => [...mesWorkOrders],
  getBaoGong: () => [...mesBaoGong],
  getIpqc: () => [...mesIpqc],
  getOqc: () => [...mesOqc],
  getRework: () => [...mesRework],
  getEquipment: () => [...mesEquipment],
  getTooling: () => [...mesTooling],
  getTeams: () => [...mesTeams],
  getWages: () => [...mesWages],
  getCosts: () => [...mesCosts],
}
