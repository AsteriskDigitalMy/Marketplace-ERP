import { PageHeader } from '@/components/pms/PageHeader'
import { ModuleDashboard } from '@/components/shared/ModuleDashboard'
import { fetchSapDashboard } from '@/services/sap/sap-service'

export default function SapHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="SAP Integration"
        description="Monitor sync health across P2P, O2C, costing, and inventory valuation."
      />
      <ModuleDashboard fetchDashboard={fetchSapDashboard} />
    </div>
  )
}
