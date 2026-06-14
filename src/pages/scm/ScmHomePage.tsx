import { PageHeader } from '@/components/pms/PageHeader'
import { ModuleDashboard } from '@/components/shared/ModuleDashboard'
import { fetchScmDashboard } from '@/services/scm/scm-service'

export default function ScmHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Supply Chain Management"
        description="Sales, procurement, scheduling, and supplier collaboration."
      />
      <ModuleDashboard fetchDashboard={fetchScmDashboard} />
    </div>
  )
}
