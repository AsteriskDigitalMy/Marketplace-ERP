import { Navigate, Route } from 'react-router-dom'
import PdmLayout from '@/components/pdm/PdmLayout'
import ScmLayout from '@/components/scm/ScmLayout'
import MesLayout from '@/components/mes/MesLayout'
import WmsLayout from '@/components/wms/WmsLayout'
import SapLayout from '@/components/sap/SapLayout'
import BiLayout from '@/components/bi/BiLayout'
import PdmHomePage from '@/pages/pdm/PdmHomePage'
import PdmProjectsPage from '@/pages/pdm/PdmProjectsPage'
import PdmDesignsPage from '@/pages/pdm/PdmDesignsPage'
import PdmSamplingPage from '@/pages/pdm/PdmSamplingPage'
import PdmFinalizationPage from '@/pages/pdm/PdmFinalizationPage'
import PdmProcessesPage from '@/pages/pdm/PdmProcessesPage'
import PdmWorkingHoursPage from '@/pages/pdm/PdmWorkingHoursPage'
import PdmRoutingPage from '@/pages/pdm/PdmRoutingPage'
import PdmBomPage from '@/pages/pdm/PdmBomPage'
import PdmCostPricingPage from '@/pages/pdm/PdmCostPricingPage'
import PdmChangesPage from '@/pages/pdm/PdmChangesPage'
import ScmHomePage from '@/pages/scm/ScmHomePage'
import {
  ScmCustomersPage,
  ScmImportExportPage,
  ScmOrdersPage,
  ScmProcurementPage,
  ScmPurchaseOrdersPage,
  ScmReportsPage,
  ScmSchedulingPage,
  ScmSubcontractingPage,
  ScmSuppliersPage,
} from '@/pages/scm/ScmFeaturePages'
import MesHomePage, { MesPadHomePage } from '@/pages/mes/MesHomePage'
import {
  MesCostsPage,
  MesEquipmentPage,
  MesPersonnelPage,
  MesQualityPage,
  MesReportsPage,
  MesReworkPage,
  MesSchedulingPage,
  MesToolingPage,
  MesTraceabilityPage,
  MesWagesPage,
  MesWorkOrdersPage,
} from '@/pages/mes/MesFeaturePages'
import MesCuttingPage from '@/pages/mes/MesCuttingPage'
import MesSewingPage from '@/pages/mes/MesSewingPage'
import MesPostProcessingPage from '@/pages/mes/MesPostProcessingPage'
import WmsHomePage, { WmsPdaHomePage } from '@/pages/wms/WmsHomePage'
import {
  WmsAlertsPage,
  WmsBatchesPage,
  WmsInboundPage,
  WmsLocationsPage,
  WmsMaterialsPage,
  WmsOutboundPage,
  WmsReportsPage,
  WmsReservationsPage,
  WmsStockTakingPage,
  WmsStrategiesPage,
  WmsTraceabilityPage,
  WmsTransfersPage,
} from '@/pages/wms/WmsFeaturePages'
import SapHomePage from '@/pages/sap/SapHomePage'
import {
  SapConfigPage,
  SapCostingPage,
  SapExceptionsPage,
  SapInventoryPage,
  SapLogsPage,
  SapMasterDataPage,
  SapO2cPage,
  SapP2pPage,
} from '@/pages/sap/SapFeaturePages'
import BiHomePage, {
  BiAlertsPage,
  BiExecutivePage,
  BiFinanceDashboardPage,
  BiKpiDashboardPage,
  BiMesDashboardPage,
  BiMyReportsPage,
  BiReportDesignerPage,
  BiScmDashboardPage,
  BiWarehouseKanbanPage,
  BiWmsDashboardPage,
  BiWorkshopKanbanPage,
} from '@/pages/bi/BiPages'
import PortalOrdersPage from '@/pages/portal/PortalOrdersPage'

export function ErpModuleRoutes() {
  return (
    <>
      <Route path="portal/orders" element={<PortalOrdersPage />} />

      <Route path="pdm" element={<PdmLayout />}>
        <Route index element={<PdmHomePage />} />
        <Route path="projects" element={<PdmProjectsPage />} />
        <Route path="designs" element={<PdmDesignsPage />} />
        <Route path="sampling" element={<PdmSamplingPage />} />
        <Route path="finalization" element={<PdmFinalizationPage />} />
        <Route path="processes" element={<PdmProcessesPage />} />
        <Route path="working-hours" element={<PdmWorkingHoursPage />} />
        <Route path="routing" element={<PdmRoutingPage />} />
        <Route path="bom" element={<PdmBomPage />} />
        <Route path="cost-pricing" element={<PdmCostPricingPage />} />
        <Route path="changes" element={<PdmChangesPage />} />
      </Route>

      <Route path="scm" element={<ScmLayout />}>
        <Route index element={<ScmHomePage />} />
        <Route path="customers" element={<ScmCustomersPage />} />
        <Route path="orders" element={<ScmOrdersPage />} />
        <Route path="suppliers" element={<ScmSuppliersPage />} />
        <Route path="procurement" element={<ScmProcurementPage />} />
        <Route path="purchase-orders" element={<ScmPurchaseOrdersPage />} />
        <Route path="scheduling" element={<ScmSchedulingPage />} />
        <Route path="subcontracting" element={<ScmSubcontractingPage />} />
        <Route path="import-export" element={<ScmImportExportPage />} />
        <Route path="reports" element={<ScmReportsPage />} />
      </Route>

      <Route path="mes" element={<MesLayout />}>
        <Route index element={<MesHomePage />} />
        <Route path="work-orders" element={<MesWorkOrdersPage />} />
        <Route path="scheduling" element={<MesSchedulingPage />} />
        <Route path="cutting" element={<MesCuttingPage />} />
        <Route path="sewing" element={<MesSewingPage />} />
        <Route path="post-processing" element={<MesPostProcessingPage />} />
        <Route path="traceability" element={<MesTraceabilityPage />} />
        <Route path="quality" element={<MesQualityPage />} />
        <Route path="rework" element={<MesReworkPage />} />
        <Route path="equipment" element={<MesEquipmentPage />} />
        <Route path="tooling" element={<MesToolingPage />} />
        <Route path="personnel" element={<MesPersonnelPage />} />
        <Route path="wages" element={<MesWagesPage />} />
        <Route path="costs" element={<MesCostsPage />} />
        <Route path="reports" element={<MesReportsPage />} />
        <Route path="pad" element={<MesPadHomePage />} />
      </Route>

      <Route path="wms" element={<WmsLayout />}>
        <Route index element={<WmsHomePage />} />
        <Route path="locations" element={<WmsLocationsPage />} />
        <Route path="materials" element={<WmsMaterialsPage />} />
        <Route path="strategies" element={<WmsStrategiesPage />} />
        <Route path="inbound" element={<WmsInboundPage />} />
        <Route path="outbound" element={<WmsOutboundPage />} />
        <Route path="transfers" element={<WmsTransfersPage />} />
        <Route path="alerts" element={<WmsAlertsPage />} />
        <Route path="batches" element={<WmsBatchesPage />} />
        <Route path="reservations" element={<WmsReservationsPage />} />
        <Route path="stock-taking" element={<WmsStockTakingPage />} />
        <Route path="traceability" element={<WmsTraceabilityPage />} />
        <Route path="reports" element={<WmsReportsPage />} />
        <Route path="pda" element={<WmsPdaHomePage />} />
      </Route>

      <Route path="sap" element={<SapLayout />}>
        <Route index element={<SapHomePage />} />
        <Route path="config" element={<SapConfigPage />} />
        <Route path="master-data" element={<SapMasterDataPage />} />
        <Route path="p2p" element={<SapP2pPage />} />
        <Route path="o2c" element={<SapO2cPage />} />
        <Route path="costing" element={<SapCostingPage />} />
        <Route path="inventory" element={<SapInventoryPage />} />
        <Route path="logs" element={<SapLogsPage />} />
        <Route path="exceptions" element={<SapExceptionsPage />} />
      </Route>

      <Route path="bi" element={<BiLayout />}>
        <Route index element={<BiHomePage />} />
        <Route path="executive" element={<BiExecutivePage />} />
        <Route path="operations/scm" element={<BiScmDashboardPage />} />
        <Route path="operations/mes" element={<BiMesDashboardPage />} />
        <Route path="operations/wms" element={<BiWmsDashboardPage />} />
        <Route path="operations/finance" element={<BiFinanceDashboardPage />} />
        <Route path="operations/kpi" element={<BiKpiDashboardPage />} />
        <Route path="kanban/workshop" element={<BiWorkshopKanbanPage />} />
        <Route path="kanban/warehouse" element={<BiWarehouseKanbanPage />} />
        <Route path="reports/designer" element={<BiReportDesignerPage />} />
        <Route path="reports" element={<BiMyReportsPage />} />
        <Route path="alerts" element={<BiAlertsPage />} />
      </Route>
    </>
  )
}

export function LegacyRedirects() {
  return (
    <>
      <Route path="inventory" element={<Navigate to="/wms/materials" replace />} />
      <Route path="orders" element={<Navigate to="/scm/orders" replace />} />
      <Route path="customers" element={<Navigate to="/scm/customers" replace />} />
      <Route path="reports" element={<Navigate to="/bi/reports" replace />} />
    </>
  )
}
