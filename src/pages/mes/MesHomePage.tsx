import { Link } from 'react-router-dom'
import { ClipboardList, Factory, ScanLine, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'
import { ModuleDashboard } from '@/components/shared/ModuleDashboard'
import { fetchMesDashboard } from '@/services/mes/mes-service'

export default function MesHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manufacturing Execution"
        description="Work orders, shop-floor reporting, quality, and equipment."
      />
      <ModuleDashboard fetchDashboard={fetchMesDashboard} />
    </div>
  )
}

export function MesPadHomePage() {
  const tiles = [
    { to: '/mes/work-orders', label: 'My work orders', icon: ClipboardList },
    { to: '/mes/cutting', label: 'Report production', icon: Factory },
    { to: '/mes/quality', label: 'Inspect', icon: ScanLine },
    { to: '/mes/equipment', label: 'Equipment fault', icon: Wrench },
    { to: '/mes/wages', label: 'Wage detail', icon: ClipboardList },
  ]

  return (
    <div className="mx-auto max-w-[360px] space-y-4 p-4">
      <PageHeader title="MES Pad" description="Shop-floor quick actions." />
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Link key={tile.to} to={tile.to}>
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
