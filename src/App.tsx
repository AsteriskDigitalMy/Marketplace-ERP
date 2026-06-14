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
      </TooltipProvider>
    </PmsAuthProvider>
  )
}
