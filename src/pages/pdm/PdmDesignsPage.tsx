import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmDesigns } from '@/services/pdm/pdm-service'

export default function PdmDesignsPage() {
  return (
    <EntityListPage
      title="Product designs"
      description="Style library and design documents."
      fetchItems={fetchPdmDesigns}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'name', header: 'Document', cell: (r) => r.DocumentName },
        { key: 'type', header: 'Type', cell: (r) => r.DocumentType },
        { key: 'version', header: 'Version', cell: (r) => r.Version },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}
