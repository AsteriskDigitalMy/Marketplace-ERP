import { CROSS_LINKS } from '@/mocks/shared/cross-links'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import type {
  BatchRecord,
  InboundTask,
  InventoryTransfer,
  MaterialWarehouseProfile,
  OutboundTask,
  Reservation,
  StockTake,
  TraceabilityRecord,
  WarehouseAlert,
  WarehouseStrategy,
  WarehouseTreeNode,
} from '@/models/wms'

const audit = {
  CreatedBy: MOCK_ADMIN_USER_ID,
  CreatedDatetime: '2026-06-01T08:00:00Z',
  ModifiedBy: MOCK_ADMIN_USER_ID,
  ModifiedDatetime: '2026-06-10T14:00:00Z',
}

export const wmsLocations: WarehouseTreeNode[] = [
  {
    Id: CROSS_LINKS.warehouseId,
    ParentId: null,
    Code: 'WH-MAIN',
    Name: 'Main warehouse',
    NodeType: 'warehouse',
    IsActive: true,
    Children: [
      {
        Id: CROSS_LINKS.zoneId,
        ParentId: CROSS_LINKS.warehouseId,
        Code: 'Z-RM-01',
        Name: 'Raw materials zone',
        NodeType: 'zone',
        IsActive: true,
        Children: [
          {
            Id: CROSS_LINKS.locationId,
            ParentId: CROSS_LINKS.zoneId,
            Code: 'A-01-01',
            Name: 'Aisle A rack 1',
            NodeType: 'location',
            IsActive: true,
          },
        ],
      },
    ],
  },
]

export const wmsMaterials: MaterialWarehouseProfile[] = [
  {
    Id: '40000000-0000-0000-0000-000000000004',
    OrganizationId: MOCK_ORGANIZATION_ID,
    MaterialId: CROSS_LINKS.materialId,
    MaterialCode: 'FAB-NYL-210',
    MaterialName: 'Nylon fabric 210gsm',
    DefaultLocationId: CROSS_LINKS.locationId,
    MinStock: 500,
    MaxStock: 5000,
    OnHandQty: 1850,
    ShelfLifeDays: null,
    BatchControlled: true,
    ...audit,
  },
]

export const wmsStrategies: WarehouseStrategy[] = [
  {
    Id: '40000000-0000-0000-0000-000000000005',
    OrganizationId: MOCK_ORGANIZATION_ID,
    StrategyCode: 'FIFO-RM',
    StrategyName: 'FIFO for raw materials',
    StrategyType: 'fifo',
    IsActive: true,
  },
]

export const wmsInbound: InboundTask[] = [
  {
    Id: CROSS_LINKS.inboundTaskId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    TaskNumber: 'INB-2026-0088',
    TaskType: 'purchase',
    SourceDocumentId: CROSS_LINKS.purchaseOrderId,
    MaterialCode: 'FAB-NYL-210',
    ExpectedQty: 1200,
    ReceivedQty: 0,
    Status: 'open',
    CreatedAt: '2026-06-11T08:00:00Z',
  },
]

export const wmsOutbound: OutboundTask[] = [
  {
    Id: CROSS_LINKS.outboundTaskId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    TaskNumber: 'OUT-2026-00142',
    TaskType: 'production_pick',
    SourceDocumentId: CROSS_LINKS.workOrderId,
    MaterialCode: 'FAB-NYL-210',
    RequiredQty: 1000,
    PickedQty: 400,
    Status: 'picking',
    CreatedAt: '2026-06-12T07:00:00Z',
  },
]

export const wmsTransfers: InventoryTransfer[] = [
  {
    Id: '40000000-0000-0000-0000-000000000020',
    OrganizationId: MOCK_ORGANIZATION_ID,
    TransferNumber: 'TRF-2026-001',
    FromLocationId: CROSS_LINKS.locationId,
    ToLocationId: '40000000-0000-0000-0000-000000000099',
    MaterialId: CROSS_LINKS.materialId,
    Quantity: 200,
    BatchNumber: 'BATCH-2026-001',
    Status: 'completed',
    CreatedAt: '2026-06-10T10:00:00Z',
  },
]

export const wmsAlerts: WarehouseAlert[] = [
  {
    Id: '40000000-0000-0000-0000-000000000030',
    OrganizationId: MOCK_ORGANIZATION_ID,
    MaterialId: CROSS_LINKS.materialId,
    MaterialCode: 'FAB-NYL-210',
    LocationId: CROSS_LINKS.locationId,
    AlertType: 'low_stock',
    CurrentQty: 1850,
    ThresholdQty: 2000,
    TriggeredAt: '2026-06-13T06:00:00Z',
    IsAcknowledged: false,
  },
]

export const wmsBatches: BatchRecord[] = [
  {
    Id: '40000000-0000-0000-0000-000000000040',
    OrganizationId: MOCK_ORGANIZATION_ID,
    MaterialCode: 'FAB-NYL-210',
    BatchNumber: 'BATCH-2026-001',
    Quantity: 800,
    ExpiryDate: null,
    LocationId: CROSS_LINKS.locationId,
    Status: 'available',
  },
]

export const wmsReservations: Reservation[] = [
  {
    Id: '40000000-0000-0000-0000-000000000050',
    OrganizationId: MOCK_ORGANIZATION_ID,
    MaterialCode: 'FAB-NYL-210',
    ReservedQty: 1000,
    SourceDocumentType: 'work_order',
    SourceDocumentId: CROSS_LINKS.workOrderId,
    Status: 'active',
  },
]

export const wmsStockTakes: StockTake[] = [
  {
    Id: '40000000-0000-0000-0000-000000000060',
    OrganizationId: MOCK_ORGANIZATION_ID,
    CountNumber: 'CNT-2026-Q2',
    WarehouseId: CROSS_LINKS.warehouseId,
    Status: 'planned',
    PlannedDate: '2026-06-30',
    VarianceCount: 0,
  },
]

export const wmsTraceability: TraceabilityRecord[] = [
  {
    Id: '40000000-0000-0000-0000-000000000070',
    OrganizationId: MOCK_ORGANIZATION_ID,
    MaterialCode: 'FAB-NYL-210',
    BatchNumber: 'BATCH-2026-001',
    Direction: 'outbound',
    DocumentNumber: 'OUT-2026-00142',
    Quantity: 400,
    Timestamp: '2026-06-12T09:30:00Z',
  },
]

export const wmsStore = {
  getLocations: () => [...wmsLocations],
  getMaterials: () => [...wmsMaterials],
  getStrategies: () => [...wmsStrategies],
  getInbound: () => [...wmsInbound],
  getOutbound: () => [...wmsOutbound],
  getTransfers: () => [...wmsTransfers],
  getAlerts: () => [...wmsAlerts],
  getBatches: () => [...wmsBatches],
  getReservations: () => [...wmsReservations],
  getStockTakes: () => [...wmsStockTakes],
  getTraceability: () => [...wmsTraceability],
}
