import { PageHeader } from '@/components/pms/PageHeader'
import { ModuleDashboard } from '@/components/shared/ModuleDashboard'
import { BiDashboardPage } from '@/components/bi/BiDashboardPage'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchBiHomeDashboard } from '@/services/bi/bi-service'

export default function BiHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence"
        description="Role-based dashboards and analytics across all ERP modules."
      />
      <ModuleDashboard fetchDashboard={fetchBiHomeDashboard} />
    </div>
  )
}

export function BiExecutivePage() {
  return <BiDashboardPage dashboardKey="executive" title="Executive cockpit" description="Strategic KPIs for group leadership." />
}

export function BiScmDashboardPage() {
  return <BiDashboardPage dashboardKey="scm" title="SCM dashboard" description="Supply chain operational analytics." />
}

export function BiMesDashboardPage() {
  return <BiDashboardPage dashboardKey="mes" title="MES dashboard" description="Production execution analytics." />
}

export function BiWmsDashboardPage() {
  return <BiDashboardPage dashboardKey="wms" title="WMS dashboard" description="Warehouse and inventory analytics." />
}

export function BiFinanceDashboardPage() {
  return <BiDashboardPage dashboardKey="finance" title="SAP financial dashboard" description="Financial sync and AR/AP metrics." />
}

export function BiKpiDashboardPage() {
  return <BiDashboardPage dashboardKey="kpi" title="KPI / PMS dashboard" description="Performance management analytics." />
}

export function BiWorkshopKanbanPage() {
  return <BiDashboardPage dashboardKey="workshop" title="Workshop kanban" description="Execution-tier production display." />
}

export function BiWarehouseKanbanPage() {
  return <BiDashboardPage dashboardKey="warehouse" title="Warehouse kanban" description="Execution-tier warehouse display." />
}

export function BiReportDesignerPage() {
  return (
    <EntityListPage
      title="Report designer"
      description="Self-service report builder (mock)."
      fetchItems={async () => [
        { Id: '1', Name: 'Monthly sales by customer', Status: 'draft' },
        { Id: '2', Name: 'WO completion trend', Status: 'published' },
      ]}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'name', header: 'Report', cell: (r) => r.Name },
        { key: 'status', header: 'Status', cell: (r) => r.Status },
      ]}
    />
  )
}

export function BiMyReportsPage() {
  return (
    <EntityListPage
      title="My reports"
      description="Saved custom reports."
      fetchItems={async () => [{ Id: '1', Name: 'Q2 production summary', LastRun: '2026-06-14' }]}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'name', header: 'Report', cell: (r) => r.Name },
        { key: 'last', header: 'Last run', cell: (r) => r.LastRun },
      ]}
    />
  )
}

export function BiAlertsPage() {
  return (
    <EntityListPage
      title="BI alerts"
      description="Threshold alerts and forecasting notifications."
      fetchItems={async () => [
        { Id: '1', Message: 'OEE below target on SEW-L01', Severity: 'warning' },
        { Id: '2', Message: 'Inventory turnover declining', Severity: 'info' },
      ]}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'msg', header: 'Alert', cell: (r) => r.Message },
        { key: 'sev', header: 'Severity', cell: (r) => r.Severity },
      ]}
    />
  )
}
