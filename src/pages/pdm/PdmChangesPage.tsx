import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmChanges } from '@/services/pdm/pdm-service'

export default function PdmChangesPage() {
  return (
    <EntityListPage
      title="Version & change management"
      description="Change requests for products, BOM, routing, and processes."
      fetchItems={fetchPdmChanges}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'entity', header: 'Entity type', cell: (r) => r.EntityType },
        { key: 'reason', header: 'Reason', cell: (r) => r.Reason },
        { key: 'from', header: 'From', cell: (r) => r.VersionFrom },
        { key: 'to', header: 'To', cell: (r) => r.VersionTo },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}
