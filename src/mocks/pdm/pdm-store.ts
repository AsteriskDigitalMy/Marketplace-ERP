import { CROSS_LINKS } from '@/mocks/shared/cross-links'
import { MOCK_ADMIN_USER_ID, MOCK_ORGANIZATION_ID } from '@/lib/pms/constants'
import type {
  BomHeader,
  ChangeRequest,
  CostPricingRecord,
  DesignDocument,
  FinalizationRecord,
  ProcessDefinition,
  ProcessRoute,
  ProductProject,
  ProductStyle,
  SamplingTask,
  WorkingHoursStandard,
} from '@/models/pdm'

const audit = {
  CreatedBy: MOCK_ADMIN_USER_ID,
  CreatedDatetime: '2026-06-01T08:00:00Z',
  ModifiedBy: MOCK_ADMIN_USER_ID,
  ModifiedDatetime: '2026-06-10T14:00:00Z',
}

export const pdmProjects: ProductProject[] = [
  {
    Id: CROSS_LINKS.productProjectId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    ProjectCode: 'PRJ-2026-001',
    ProductName: 'Summit Trail Jacket',
    Category: 'Outerwear',
    CustomerName: 'Northwind Traders',
    Status: 'Approved',
    DevelopmentLeadId: MOCK_ADMIN_USER_ID,
    CurrentVersion: 'v1.2',
    ...audit,
  },
  {
    Id: '10000000-0000-0000-0000-000000000099',
    OrganizationId: MOCK_ORGANIZATION_ID,
    ProjectCode: 'PRJ-2026-002',
    ProductName: 'Pacific Linen Shirt',
    Category: 'Tops',
    CustomerName: 'Blue Ocean LLC',
    Status: 'In Review',
    DevelopmentLeadId: MOCK_ADMIN_USER_ID,
    CurrentVersion: 'v0.3',
    ...audit,
  },
]

export const pdmStyles: ProductStyle[] = [
  {
    Id: CROSS_LINKS.productStyleId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    StyleNumber: 'STY-JKT-001',
    StyleName: 'Summit Trail Jacket',
    Category: 'Outerwear',
    Version: 'v1.2',
    Status: 'Approved',
    ProjectId: CROSS_LINKS.productProjectId,
    ...audit,
  },
]

export const pdmDesigns: DesignDocument[] = [
  {
    Id: '10000000-0000-0000-0000-000000000020',
    OrganizationId: MOCK_ORGANIZATION_ID,
    StyleId: CROSS_LINKS.productStyleId,
    DocumentName: 'Tech pack v1.2',
    DocumentType: 'tech_pack',
    Version: 'v1.2',
    Status: 'Approved',
    UploadedAt: '2026-06-05T10:00:00Z',
  },
]

export const pdmSampling: SamplingTask[] = [
  {
    Id: '10000000-0000-0000-0000-000000000030',
    OrganizationId: MOCK_ORGANIZATION_ID,
    StyleId: CROSS_LINKS.productStyleId,
    SampleType: 'pp',
    Status: 'in_progress',
    DueDate: '2026-06-20',
    AssignedToId: MOCK_ADMIN_USER_ID,
  },
]

export const pdmFinalization: FinalizationRecord[] = [
  {
    Id: '10000000-0000-0000-0000-000000000040',
    OrganizationId: MOCK_ORGANIZATION_ID,
    StyleId: CROSS_LINKS.productStyleId,
    StyleNumber: 'STY-JKT-001',
    Status: 'approved',
    ApprovedAt: '2026-06-08T16:00:00Z',
    MassProductionAuthorized: true,
  },
]

export const pdmProcesses: ProcessDefinition[] = [
  {
    Id: '10000000-0000-0000-0000-000000000050',
    OrganizationId: MOCK_ORGANIZATION_ID,
    ProcessCode: 'CUT-001',
    ProcessName: 'Fabric cutting',
    Category: 'Cutting',
    StandardMinutes: 12,
    Status: 'active',
  },
  {
    Id: '10000000-0000-0000-0000-000000000051',
    OrganizationId: MOCK_ORGANIZATION_ID,
    ProcessCode: 'SEW-001',
    ProcessName: 'Main seam assembly',
    Category: 'Sewing',
    StandardMinutes: 25,
    Status: 'active',
  },
]

export const pdmWorkingHours: WorkingHoursStandard[] = [
  {
    Id: '10000000-0000-0000-0000-000000000060',
    OrganizationId: MOCK_ORGANIZATION_ID,
    ProcessId: '10000000-0000-0000-0000-000000000050',
    ProcessName: 'Fabric cutting',
    StyleCategory: 'Outerwear',
    StandardMinutes: 12,
    EffectiveDate: '2026-01-01',
  },
]

export const pdmRouting: ProcessRoute[] = [
  {
    Id: CROSS_LINKS.processRouteId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    StyleId: CROSS_LINKS.productStyleId,
    StyleNumber: 'STY-JKT-001',
    Version: 'v1.0',
    Status: 'Approved',
    OperationCount: 8,
  },
]

export const pdmBoms: BomHeader[] = [
  {
    Id: CROSS_LINKS.bomHeaderId,
    OrganizationId: MOCK_ORGANIZATION_ID,
    StyleNumber: 'STY-JKT-001',
    StyleId: CROSS_LINKS.productStyleId,
    Version: 'v1.0',
    Status: 'Approved',
    Lines: [
      {
        LineNumber: 1,
        MaterialId: CROSS_LINKS.materialId,
        MaterialCode: 'FAB-NYL-210',
        Quantity: 2.5,
        Unit: 'm',
        ScrapPct: 3,
      },
    ],
  },
]

export const pdmCostPricing: CostPricingRecord[] = [
  {
    Id: '10000000-0000-0000-0000-000000000070',
    OrganizationId: MOCK_ORGANIZATION_ID,
    StyleId: CROSS_LINKS.productStyleId,
    StyleNumber: 'STY-JKT-001',
    MaterialCost: 28.5,
    LaborCost: 12.0,
    OverheadCost: 4.5,
    QuotedPrice: 65.0,
    MarginPct: 31.5,
    Status: 'approved',
  },
]

export const pdmChanges: ChangeRequest[] = [
  {
    Id: '10000000-0000-0000-0000-000000000080',
    OrganizationId: MOCK_ORGANIZATION_ID,
    EntityType: 'bom',
    EntityId: CROSS_LINKS.bomHeaderId,
    Reason: 'Reduce lining weight for cost optimization',
    Status: 'In Review',
    VersionFrom: 'v1.0',
    VersionTo: 'v1.1',
    SubmittedAt: '2026-06-11T09:00:00Z',
  },
]

export const pdmStore = {
  getProjects: () => [...pdmProjects],
  getStyles: () => [...pdmStyles],
  getDesigns: () => [...pdmDesigns],
  getSampling: () => [...pdmSampling],
  getFinalization: () => [...pdmFinalization],
  getProcesses: () => [...pdmProcesses],
  getWorkingHours: () => [...pdmWorkingHours],
  getRouting: () => [...pdmRouting],
  getBoms: () => [...pdmBoms],
  getCostPricing: () => [...pdmCostPricing],
  getChanges: () => [...pdmChanges],
}
