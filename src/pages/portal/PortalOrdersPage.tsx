import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { PageHeader } from '@/components/pms/PageHeader'
import { fetchPortalOrders } from '@/services/scm/scm-service'

export default function PortalOrdersPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <PageHeader
        title="My orders"
        description="Track your order progress (customer portal — read only)."
      />
      <EntityListPage
        title="Order tracking"
        description="View status and shipment progress for your orders."
        fetchItems={fetchPortalOrders}
        rowKey={(r) => r.Id}
        columns={[
          { key: 'order', header: 'Order', cell: (r) => r.OrderNumber },
          { key: 'amount', header: 'Amount', cell: (r) => `$${r.TotalAmount.toLocaleString()}` },
          { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
        ]}
      />
    </div>
  )
}
