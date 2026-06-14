import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  ClipboardList,
  FolderKanban,
  Gauge,
  Bell,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'

const modules = [
  {
    title: 'System Basic Management',
    description: 'Organization, accounts, roles, dictionaries, audit logs, and parameters.',
    to: '/pms/admin/org',
    section: '3.1.1',
    icon: Building2,
    accent: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'KPI Indicator Library',
    description: 'Define indicators, formulas, versions, and lifecycle management.',
    to: '/pms/kpi/indicators',
    section: '3.1.2',
    icon: BarChart3,
    accent: 'bg-violet-500/10 text-violet-600',
  },
  {
    title: 'Project Management',
    description: 'Initiation, tasks, progress, issues, Gantt, and acceptance workflows.',
    to: '/pms/projects',
    section: '3.1.3',
    icon: FolderKanban,
    accent: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    title: 'Data Collection & Filling',
    description: 'Periodic filling tasks, manual entry forms, and multi-level data review.',
    to: '/pms/data-collection/my-tasks',
    section: '3.1.4',
    icon: ClipboardList,
    accent: 'bg-amber-500/10 text-amber-600',
  },
  {
    title: 'KPI Calculation',
    description: 'Scheduled batch calculation, anomaly monitoring, and manual re-calculation.',
    to: '/pms/kpi/calculation/jobs',
    section: '3.1.5',
    icon: Calculator,
    accent: 'bg-rose-500/10 text-rose-600',
  },
  {
    title: 'KPI Visualization Cockpit',
    description: 'Role-specific dashboards, drill-down analytics, and traffic-light thresholds.',
    to: '/pms/cockpit',
    section: '3.1.6',
    icon: Gauge,
    accent: 'bg-cyan-500/10 text-cyan-600',
  },
  {
    title: 'Exception Alerts',
    description: 'Alert rule configuration, inbox triage, and closed-loop disposal workflows.',
    to: '/pms/alerts',
    section: '3.1.7',
    icon: Bell,
    accent: 'bg-orange-500/10 text-orange-600',
  },
]

export default function PmsHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Management"
        description="Central hub for KPI and project management modules."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <Link key={mod.to} to={mod.to} className="group block h-full">
              <Card className="h-full border-border/80 shadow-[var(--shadow-card)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:shadow-[var(--shadow-card-hover)]">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`metronic-stat-icon ${mod.accent}`}>
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="text-[0.65rem] font-medium">
                      {mod.section}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold leading-snug">
                      {mod.title}
                    </CardTitle>
                    <CardDescription className="mt-2 leading-relaxed">
                      {mod.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Open module
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
