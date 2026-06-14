import { BarChart3, Download, Percent, RefreshCw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'

const reports = [
  { name: 'Sales by Region', period: 'June 2026', value: '$428,900', icon: TrendingUp, color: 'bg-primary/10 text-primary' },
  { name: 'Fulfillment SLA', period: 'Last 30 days', value: '96.2%', icon: Percent, color: 'bg-emerald-500/10 text-emerald-600' },
  { name: 'Return Rate', period: 'Last 30 days', value: '2.1%', icon: RefreshCw, color: 'bg-amber-500/10 text-amber-600' },
  { name: 'Inventory Turnover', period: 'Q2 2026', value: '4.8x', icon: BarChart3, color: 'bg-violet-500/10 text-violet-600' },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Key business metrics and downloadable summaries."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.name} className="shadow-[var(--shadow-card)]">
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold">{report.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">{report.period}</p>
                </div>
                <div className={`metronic-stat-icon ${report.color}`}>
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-2xl font-semibold tracking-tight">{report.value}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 size-3.5" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
