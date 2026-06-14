import { useAsyncData } from '@/hooks/use-async-data'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { BiChartCard } from '@/components/bi/BiChartCard'
import { BiKpiCardView } from '@/components/bi/BiKpiCardView'
import { fetchBiDashboard } from '@/services/bi/bi-service'

interface BiDashboardPageProps {
  dashboardKey: string
  title: string
  description: string
}

export function BiDashboardPage({ dashboardKey, title, description }: BiDashboardPageProps) {
  const { data, loading, error, reload } = useAsyncData({
    fetcher: () => fetchBiDashboard(dashboardKey),
    deps: [dashboardKey],
  })

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <AsyncState loading={loading} error={error} onRetry={reload} empty={!data}>
        {data ? (
          <div className="space-y-6">
            <p className="text-xs text-muted-foreground">
              Last refreshed: {new Date(data.LastRefreshedAt).toLocaleString()}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {data.KpiCards.map((kpi) => (
                <BiKpiCardView key={kpi.Id} kpi={kpi} />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.Charts.map((chart) => (
                <BiChartCard key={chart.Id} title={chart.Title} series={chart.Series} />
              ))}
            </div>
          </div>
        ) : null}
      </AsyncState>
    </div>
  )
}
