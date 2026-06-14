import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmFinalization } from '@/services/pdm/pdm-service'

export default function PdmFinalizationPage() {
  return (
    <EntityListPage
      title="Product finalization"
      description="Product archival and mass-production authorization."
      fetchItems={fetchPdmFinalization}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'style', header: 'Style', cell: (r) => r.StyleNumber },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
        {
          key: 'mp',
          header: 'Mass production',
          cell: (r) => (r.MassProductionAuthorized ? 'Authorized' : 'Pending'),
        },
      ]}
    />
  )
}
