import { CROSS_LINKS } from '@/mocks/shared/cross-links'
import { MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import type {
  IntegrationConfig,
  IntegrationException,
  InventoryValuationSync,
  MasterDataSyncRecord,
  O2cSyncDocument,
  P2pSyncDocument,
  ProductionCostSync,
  SyncLogEntry,
} from '@/models/sap'

export const sapConfig: IntegrationConfig = {
  Id: '50000000-0000-0000-0000-000000000010',
  OrganizationId: MOCK_ORGANIZATION_ID,
  SapEndpoint: 'https://sap.example.com/odata/v4',
  ClientId: 'ERP-PROD-01',
  IsEnabled: true,
  LastHealthCheckAt: '2026-06-14T08:00:00Z',
  LastHealthStatus: 'healthy',
}

export const sapSyncLogs: SyncLogEntry[] = [
  {
    Id: CROSS_LINKS.syncLogId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    DocumentType: 'p2p',
    DocumentId: CROSS_LINKS.purchaseOrderId,
    DocumentNumber: 'PO-2026-0088',
    Direction: 'erp_to_sap',
    Status: 'synced',
    AttemptedAt: '2026-06-14T07:30:00Z',
    CompletedAt: '2026-06-14T07:30:45Z',
    ErrorMessage: null,
    PayloadHash: 'a'.repeat(64),
  },
  {
    Id: '50000000-0000-0000-0000-000000000002',
    OrganizationId: MOCK_ORGANIZATION_ID,
    DocumentType: 'o2c',
    DocumentId: CROSS_LINKS.salesOrderId,
    DocumentNumber: 'SO-2026-10482',
    Direction: 'erp_to_sap',
    Status: 'pending',
    AttemptedAt: '2026-06-14T08:00:00Z',
    CompletedAt: null,
    ErrorMessage: null,
    PayloadHash: 'b'.repeat(64),
  },
  {
    Id: '50000000-0000-0000-0000-000000000003',
    OrganizationId: MOCK_ORGANIZATION_ID,
    DocumentType: 'inventory_valuation',
    DocumentId: CROSS_LINKS.materialId,
    DocumentNumber: 'FAB-NYL-210',
    Direction: 'erp_to_sap',
    Status: 'failed',
    AttemptedAt: '2026-06-14T06:00:00Z',
    CompletedAt: null,
    ErrorMessage: 'SAP MM valuation lock',
    PayloadHash: 'c'.repeat(64),
  },
]

export const sapP2p: P2pSyncDocument[] = [
  {
    Id: '50000000-0000-0000-0000-000000000020',
    OrganizationId: MOCK_ORGANIZATION_ID,
    PurchaseOrderId: CROSS_LINKS.purchaseOrderId,
    PoNumber: 'PO-2026-0088',
    SapDocumentNumber: '4500012345',
    SyncStatus: 'synced',
    LastSyncedAt: '2026-06-14T07:30:45Z',
  },
]

export const sapO2c: O2cSyncDocument[] = [
  {
    Id: '50000000-0000-0000-0000-000000000030',
    OrganizationId: MOCK_ORGANIZATION_ID,
    SalesOrderId: CROSS_LINKS.salesOrderId,
    OrderNumber: 'SO-2026-10482',
    SapDocumentNumber: null,
    SyncStatus: 'pending',
    LastSyncedAt: null,
  },
]

export const sapCosting: ProductionCostSync[] = [
  {
    Id: '50000000-0000-0000-0000-000000000040',
    OrganizationId: MOCK_ORGANIZATION_ID,
    WorkOrderId: CROSS_LINKS.workOrderId,
    WorkOrderNumber: 'WO-2026-00142',
    TotalCost: 13640,
    SyncStatus: 'pending',
    LastSyncedAt: null,
  },
]

export const sapInventory: InventoryValuationSync[] = [
  {
    Id: '50000000-0000-0000-0000-000000000050',
    OrganizationId: MOCK_ORGANIZATION_ID,
    MaterialCode: 'FAB-NYL-210',
    ValuationAmount: 46250,
    SyncStatus: 'failed',
    LastSyncedAt: null,
  },
]

export const sapMasterData: MasterDataSyncRecord[] = [
  {
    Id: '50000000-0000-0000-0000-000000000060',
    OrganizationId: MOCK_ORGANIZATION_ID,
    EntityType: 'product',
    EntityId: CROSS_LINKS.productStyleId,
    EntityCode: 'STY-JKT-001',
    SyncStatus: 'synced',
    LastSyncedAt: '2026-06-13T10:00:00Z',
  },
]

export const sapExceptions: IntegrationException[] = [
  {
    Id: '50000000-0000-0000-0000-000000000070',
    OrganizationId: MOCK_ORGANIZATION_ID,
    DocumentType: 'inventory_valuation',
    DocumentNumber: 'FAB-NYL-210',
    ErrorCode: 'MM_LOCK',
    ErrorMessage: 'SAP MM valuation period locked',
    Status: 'open',
    CreatedAt: '2026-06-14T06:00:00Z',
  },
]

export const sapStore = {
  getConfig: () => ({ ...sapConfig }),
  getSyncLogs: () => [...sapSyncLogs],
  getP2p: () => [...sapP2p],
  getO2c: () => [...sapO2c],
  getCosting: () => [...sapCosting],
  getInventory: () => [...sapInventory],
  getMasterData: () => [...sapMasterData],
  getExceptions: () => [...sapExceptions],
}
