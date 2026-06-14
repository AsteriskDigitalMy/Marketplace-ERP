import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { usePmsAuth } from '@/contexts/pms-auth-context'

/** Placeholder until 3.1.7.2 inbox is wired on this route. */
export default function AlertInboxPage() {
  const { hasPermission } = usePmsAuth()
  return (
    <PermissionGate allowed={hasPermission('alerts.view')}>
      <PageHeader
        title="Alerts"
        description="Exception alert inbox and closed-loop disposal."
      />
      <p className="text-sm text-muted-foreground">Loading alert inbox…</p>
    </PermissionGate>
  )
}
