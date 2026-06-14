import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmSampling } from '@/services/pdm/pdm-service'

export default function PdmSamplingPage() {
  return (
    <EntityListPage
      title="Sampling management"
      description="End-to-end sampling pipeline from proto to TOP."
      fetchItems={fetchPdmSampling}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'type', header: 'Sample type', cell: (r) => r.SampleType.toUpperCase() },
        { key: 'due', header: 'Due date', cell: (r) => r.DueDate },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}
