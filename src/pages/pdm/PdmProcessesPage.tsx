import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmProcesses } from '@/services/pdm/pdm-service'

export default function PdmProcessesPage() {
  return (
    <EntityListPage
      title="Standard process library"
      description="GST standard process definitions."
      fetchItems={fetchPdmProcesses}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'code', header: 'Code', cell: (r) => r.ProcessCode },
        { key: 'name', header: 'Process', cell: (r) => r.ProcessName },
        { key: 'category', header: 'Category', cell: (r) => r.Category },
        { key: 'minutes', header: 'Std minutes', cell: (r) => r.StandardMinutes },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}
