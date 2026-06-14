import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmWorkingHours } from '@/services/pdm/pdm-service'

export default function PdmWorkingHoursPage() {
  return (
    <EntityListPage
      title="Operation standard working hours"
      description="Standard minutes by process and style category."
      fetchItems={fetchPdmWorkingHours}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'process', header: 'Process', cell: (r) => r.ProcessName },
        { key: 'category', header: 'Style category', cell: (r) => r.StyleCategory },
        { key: 'minutes', header: 'Std minutes', cell: (r) => r.StandardMinutes },
        { key: 'effective', header: 'Effective', cell: (r) => r.EffectiveDate },
      ]}
    />
  )
}
