import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmBoms } from '@/services/pdm/pdm-service'

export default function PdmBomPage() {
  return (
    <EntityListPage
      title="BOM management"
      description="Multi-level bill of materials."
      fetchItems={fetchPdmBoms}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'style', header: 'Style', cell: (r) => r.StyleNumber },
        { key: 'version', header: 'Version', cell: (r) => r.Version },
        { key: 'lines', header: 'Lines', cell: (r) => r.Lines.length },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}
