import { CROSS_LINKS } from '@/mocks/shared/cross-links'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import type {
  Customer,
  ImportExportShipment,
  PurchaseOrder,
  PurchaseRequisition,
  SalesOrder,
  SchedulePlan,
  SubcontractOrder,
  Supplier,
} from '@/models/scm'

const audit = {
  CreatedBy: MOCK_ADMIN_USER_ID,
  CreatedDatetime: '2026-06-01T08:00:00Z',
  ModifiedBy: MOCK_ADMIN_USER_ID,
  ModifiedDatetime: '2026-06-10T14:00:00Z',
}

export const scmCustomers: Customer[] = [
  {
    Id: CROSS_LINKS.customerId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    CustomerCode: 'CUS-NW-001',
    CustomerName: 'Northwind Traders',
    Tier: 'strategic',
    CreditLimit: 500000,
    PaymentTermsDays: 30,
    IsActive: true,
    ...audit,
  },
]

export const scmOrders: SalesOrder[] = [
  {
    Id: CROSS_LINKS.salesOrderId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    OrderNumber: 'SO-2026-10482',
    CustomerId: CROSS_LINKS.customerId,
    CustomerName: 'Northwind Traders',
    Status: 'effective',
    IsFastTrack: false,
    TotalAmount: 24800,
    Lines: [
      {
        LineNumber: 1,
        StyleNumber: 'STY-JKT-001',
        ProductStyleId: CROSS_LINKS.productStyleId,
        Quantity: 400,
        UnitPrice: 62,
        RequestedDeliveryDate: '2026-07-15',
      },
    ],
    ...audit,
  },
]

export const scmSuppliers: Supplier[] = [
  {
    Id: CROSS_LINKS.supplierId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    SupplierCode: 'SUP-FAB-01',
    SupplierName: 'Pacific Textiles Co.',
    QualificationStatus: 'qualified',
    LeadTimeDays: 14,
    IsActive: true,
    ...audit,
  },
]

export const scmRequisitions: PurchaseRequisition[] = [
  {
    Id: '20000000-0000-0000-0000-000000000010',
    OrganizationId: MOCK_ORGANIZATION_ID,
    ReqNumber: 'PR-2026-001',
    RequestedBy: 'Procurement',
    Status: 'approved',
    MaterialCode: 'FAB-NYL-210',
    Quantity: 1200,
    NeededBy: '2026-06-25',
  },
]

export const scmPurchaseOrders: PurchaseOrder[] = [
  {
    Id: CROSS_LINKS.purchaseOrderId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    PoNumber: 'PO-2026-0088',
    SupplierId: CROSS_LINKS.supplierId,
    SupplierName: 'Pacific Textiles Co.',
    Status: 'approved',
    TotalAmount: 18500,
    ExpectedArrivalDate: '2026-06-22',
    InboundTaskId: CROSS_LINKS.inboundTaskId,
    ...audit,
  },
]

export const scmSchedules: SchedulePlan[] = [
  {
    Id: '20000000-0000-0000-0000-000000000020',
    OrganizationId: MOCK_ORGANIZATION_ID,
    PlanNumber: 'SCH-2026-001',
    SalesOrderId: CROSS_LINKS.salesOrderId,
    OrderNumber: 'SO-2026-10482',
    Status: 'in_progress',
    PlannedStart: '2026-06-15',
    PlannedEnd: '2026-07-10',
    CompletionPct: 35,
  },
]

export const scmSubcontracting: SubcontractOrder[] = [
  {
    Id: '20000000-0000-0000-0000-000000000030',
    OrganizationId: MOCK_ORGANIZATION_ID,
    OrderNumber: 'SUB-2026-001',
    SupplierId: CROSS_LINKS.supplierId,
    ProcessName: 'Embroidery',
    Quantity: 400,
    Status: 'in_progress',
  },
]

export const scmImportExport: ImportExportShipment[] = [
  {
    Id: '20000000-0000-0000-0000-000000000040',
    OrganizationId: MOCK_ORGANIZATION_ID,
    ShipmentNumber: 'SHP-EXP-001',
    Direction: 'export',
    Status: 'in_transit',
    Incoterms: 'FOB',
    Eta: '2026-07-20',
  },
]

export const scmStore = {
  getCustomers: () => [...scmCustomers],
  getOrders: () => [...scmOrders],
  getSuppliers: () => [...scmSuppliers],
  getRequisitions: () => [...scmRequisitions],
  getPurchaseOrders: () => [...scmPurchaseOrders],
  getSchedules: () => [...scmSchedules],
  getSubcontracting: () => [...scmSubcontracting],
  getImportExport: () => [...scmImportExport],
}
