import { Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { PmsAuthProvider } from '@/contexts/pms-auth-context'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import PmsHomePage from './pages/pms/PmsHomePage'
import PmsAdminLayout from './components/pms/PmsAdminLayout'
import OrgStructurePage from './pages/pms/admin/OrgStructurePage'
import OrgEditPage from './pages/pms/admin/OrgEditPage'
import OrgHistoryPage from './pages/pms/admin/OrgHistoryPage'
import AccountsPage from './pages/pms/admin/AccountsPage'
import AccountCreatePage from './pages/pms/admin/AccountCreatePage'
import AccountImportPage from './pages/pms/admin/AccountImportPage'
import AccountDetailPage from './pages/pms/admin/AccountDetailPage'
import AccountRolesPage from './pages/pms/admin/AccountRolesPage'
import RolesPage from './pages/pms/admin/RolesPage'
import DictionariesPage from './pages/pms/admin/DictionariesPage'
import OperationLogsPage from './pages/pms/admin/OperationLogsPage'
import ParametersPage from './pages/pms/admin/ParametersPage'
import PmsKpiLayout from './components/pms/kpi/PmsKpiLayout'
import KpiIndicatorsPage from './pages/pms/kpi/KpiIndicatorsPage'
import KpiIndicatorCreatePage from './pages/pms/kpi/KpiIndicatorCreatePage'
import KpiIndicatorDetailPage from './pages/pms/kpi/KpiIndicatorDetailPage'
import KpiFormulaEditorPage from './pages/pms/kpi/KpiFormulaEditorPage'
import PmsProjectLayout from './components/pms/project/PmsProjectLayout'
import ProjectsListPage from './pages/pms/project/ProjectsListPage'
import ProjectCreatePage from './pages/pms/project/ProjectCreatePage'
import { ProjectDetailLayout } from './components/pms/project/ProjectDetailLayout'
import ProjectOverviewPage from './pages/pms/project/ProjectOverviewPage'
import ProjectApprovalInboxPage from './pages/pms/project/ProjectApprovalInboxPage'
import ProjectApprovalReviewPage from './pages/pms/project/ProjectApprovalReviewPage'
import ProjectTasksPage from './pages/pms/project/ProjectTasksPage'
import MyTasksPage from './pages/pms/project/MyTasksPage'
import ProjectProgressPage from './pages/pms/project/ProjectProgressPage'
import ProjectProgressImportPage from './pages/pms/project/ProjectProgressImportPage'
import TaskDurationChangePage from './pages/pms/project/TaskDurationChangePage'
import ProjectDurationRequestsPage from './pages/pms/project/ProjectDurationRequestsPage'
import ProjectIssuesPage from './pages/pms/project/ProjectIssuesPage'
import ProjectKpiSyncPage from './pages/pms/project/ProjectKpiSyncPage'
import ProjectGanttPage from './pages/pms/project/ProjectGanttPage'
import ProjectAcceptancePage from './pages/pms/project/ProjectAcceptancePage'
import ProjectAcceptanceReviewInboxPage from './pages/pms/project/ProjectAcceptanceReviewInboxPage'
import ProjectAcceptanceReviewDetailPage from './pages/pms/project/ProjectAcceptanceReviewDetailPage'
import PmsDataCollectionLayout from './components/pms/data-collection/PmsDataCollectionLayout'
import FillingRulesPage from './pages/pms/data-collection/FillingRulesPage'
import AdminTaskMonitorPage from './pages/pms/data-collection/AdminTaskMonitorPage'
import MyFillingTasksPage from './pages/pms/data-collection/MyFillingTasksPage'
import DataFillPage from './pages/pms/data-collection/DataFillPage'
import DataReviewQueuePage from './pages/pms/data-collection/DataReviewQueuePage'
import DataReviewDetailPage from './pages/pms/data-collection/DataReviewDetailPage'
import { FillingReminderDialog } from './components/pms/data-collection/FillingReminderDialog'

export default function App() {
  return (
    <PmsAuthProvider>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />

            <Route path="pms" element={<PmsHomePage />} />
            <Route path="pms/kpi" element={<PmsKpiLayout />}>
              <Route index element={<Navigate to="indicators" replace />} />
              <Route path="indicators" element={<KpiIndicatorsPage />} />
              <Route path="indicators/new" element={<KpiIndicatorCreatePage />} />
              <Route path="indicators/:id" element={<KpiIndicatorDetailPage />} />
              <Route path="indicators/:id/formula" element={<KpiFormulaEditorPage />} />
            </Route>

            <Route path="pms/projects" element={<PmsProjectLayout />}>
              <Route index element={<ProjectsListPage />} />
              <Route path="new" element={<ProjectCreatePage />} />
              <Route path="approvals" element={<ProjectApprovalInboxPage />} />
              <Route path="approvals/:projectId" element={<ProjectApprovalReviewPage />} />
              <Route path="acceptance-reviews" element={<ProjectAcceptanceReviewInboxPage />} />
              <Route
                path="acceptance-reviews/:projectId"
                element={<ProjectAcceptanceReviewDetailPage />}
              />
              <Route path=":id" element={<ProjectDetailLayout />}>
                <Route index element={<ProjectOverviewPage />} />
                <Route path="edit" element={<ProjectCreatePage />} />
                <Route path="tasks" element={<ProjectTasksPage />} />
                <Route path="progress" element={<ProjectProgressPage />} />
                <Route path="progress/import" element={<ProjectProgressImportPage />} />
                <Route path="duration-requests" element={<ProjectDurationRequestsPage />} />
                <Route path="issues" element={<ProjectIssuesPage />} />
                <Route path="kpi-sync" element={<ProjectKpiSyncPage />} />
                <Route path="gantt" element={<ProjectGanttPage />} />
                <Route path="acceptance" element={<ProjectAcceptancePage />} />
              </Route>
            </Route>

            <Route path="pms/tasks/my" element={<MyTasksPage />} />
            <Route path="pms/tasks/:id/duration-change" element={<TaskDurationChangePage />} />

            <Route path="pms/data-collection" element={<PmsDataCollectionLayout />}>
              <Route index element={<Navigate to="my-tasks" replace />} />
              <Route path="rules" element={<FillingRulesPage />} />
              <Route path="tasks" element={<AdminTaskMonitorPage />} />
              <Route path="my-tasks" element={<MyFillingTasksPage />} />
              <Route path="fill/:taskId" element={<DataFillPage />} />
              <Route path="reviews" element={<DataReviewQueuePage />} />
              <Route path="reviews/:recordId" element={<DataReviewDetailPage />} />
            </Route>

            <Route path="pms/admin" element={<PmsAdminLayout />}>
              <Route index element={<Navigate to="org" replace />} />
              <Route path="org" element={<OrgStructurePage />} />
              <Route path="org/:id/edit" element={<OrgEditPage />} />
              <Route path="org/:id/history" element={<OrgHistoryPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="accounts/new" element={<AccountCreatePage />} />
              <Route path="accounts/import" element={<AccountImportPage />} />
              <Route path="accounts/:id" element={<AccountDetailPage />} />
              <Route path="accounts/:id/roles" element={<AccountRolesPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="dictionaries" element={<DictionariesPage />} />
              <Route path="logs" element={<OperationLogsPage />} />
              <Route path="parameters" element={<ParametersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
        <FillingReminderDialog />
      </TooltipProvider>
    </PmsAuthProvider>
  )
}
