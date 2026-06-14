import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmProjects } from '@/services/pdm/pdm-service'

export default function PdmProjectsPage() {
  return (
    <EntityListPage
      title="Product projects"
      description="Product lifecycle and project initiation."
      fetchItems={fetchPdmProjects}
      rowKey={(r) => r.Id}
      searchPlaceholder="Search projects…"
      filterFn={(r, q) =>
        r.ProjectCode.toLowerCase().includes(q.toLowerCase()) ||
        r.ProductName.toLowerCase().includes(q.toLowerCase())
      }
      columns={[
        { key: 'code', header: 'Project code', cell: (r) => r.ProjectCode },
        { key: 'name', header: 'Product', cell: (r) => r.ProductName },
        { key: 'category', header: 'Category', cell: (r) => r.Category },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
        { key: 'version', header: 'Version', cell: (r) => r.CurrentVersion },
      ]}
    />
  )
}
