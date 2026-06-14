import { PageHeader } from '@/components/pms/PageHeader'
import { ModuleDashboard } from '@/components/shared/ModuleDashboard'
import { fetchPdmDashboard } from '@/services/pdm/pdm-service'

export default function PdmHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Data Management"
        description="Master data hub for products, materials, processes, BOM, and cost data."
      />
      <ModuleDashboard fetchDashboard={fetchPdmDashboard} />
    </div>
  )
}
