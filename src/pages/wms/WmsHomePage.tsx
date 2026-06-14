import { Link } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, Boxes, MapPin, ScanLine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'
import { ModuleDashboard } from '@/components/shared/ModuleDashboard'
import { fetchWmsDashboard } from '@/services/wms/wms-service'

export default function WmsHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Management"
        description="Inbound, outbound, inventory operations, and traceability."
      />
      <ModuleDashboard fetchDashboard={fetchWmsDashboard} />
    </div>
  )
}

export function WmsPdaHomePage() {
  const tiles = [
    { to: '/wms/inbound', label: 'Receive', icon: ArrowDownToLine },
    { to: '/wms/outbound', label: 'Pick', icon: ArrowUpFromLine },
    { to: '/wms/outbound', label: 'Ship', icon: Boxes },
    { to: '/wms/transfers', label: 'Transfer', icon: MapPin },
    { to: '/wms/stock-taking', label: 'Count', icon: ScanLine },
  ]

  return (
    <div className="mx-auto max-w-[360px] space-y-4 p-4">
      <PageHeader title="WMS PDA" description="Scan-centric floor workflows." />
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Link key={tile.label} to={tile.to}>
              <Card className="h-full transition-colors hover:border-primary/30">
                <CardHeader className="pb-2">
                  <Icon className="size-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-sm font-medium">{tile.label}</CardTitle>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
