import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/shared/EntityListPage'
import { fetchPdmCostPricing } from '@/services/pdm/pdm-service'

export default function PdmCostPricingPage() {
  return (
    <EntityListPage
      title="Cost & pricing"
      description="Cost accounting and quotation management."
      fetchItems={fetchPdmCostPricing}
      rowKey={(r) => r.Id}
      columns={[
        { key: 'style', header: 'Style', cell: (r) => r.StyleNumber },
        { key: 'material', header: 'Material', cell: (r) => `$${r.MaterialCost.toFixed(2)}` },
        { key: 'labor', header: 'Labor', cell: (r) => `$${r.LaborCost.toFixed(2)}` },
        { key: 'quote', header: 'Quoted', cell: (r) => `$${r.QuotedPrice.toFixed(2)}` },
        { key: 'margin', header: 'Margin', cell: (r) => `${r.MarginPct.toFixed(1)}%` },
        { key: 'status', header: 'Status', cell: (r) => <Badge variant="secondary">{r.Status}</Badge> },
      ]}
    />
  )
}
