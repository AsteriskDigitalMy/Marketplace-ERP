import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmRouting } from '@/services/pdm/pdm-service'

export default function PdmRoutingPage() {
  return (
    <EntityListPage
      title="Product routing"
      description="Product routing configuration and operation sequences."
      fetchItems={fetchPdmRouting}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'style', header: 'Style', cell: (r) => r.StyleNumber },
        { key: 'version', header: 'Version', cell: (r) => r.Version },
        { key: 'ops', header: 'Operations', cell: (r) => r.OperationCount },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}
