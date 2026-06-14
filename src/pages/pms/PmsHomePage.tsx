import { Link } from 'react-router-dom'
import { BarChart3, Building2, ChevronRight, ClipboardList, FolderKanban } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'

const modules = [
  {
    title: 'System Basic Management',
    description: 'Organization, accounts, roles, dictionaries, audit logs, and parameters.',
    to: '/pms/admin/org',
    section: '3.1.1',
    icon: Building2,
  },
  {
    title: 'KPI Indicator Library',
    description: 'Define indicators, formulas, versions, and lifecycle management.',
    to: '/pms/kpi/indicators',
    section: '3.1.2',
    icon: BarChart3,
  },
  {
    title: 'Project Management',
    description: 'Initiation, tasks, progress, issues, Gantt, and acceptance workflows.',
    to: '/pms/projects',
    section: '3.1.3',
    icon: FolderKanban,
  },
  {
    title: 'Data Collection & Filling',
    description: 'Periodic filling tasks, manual entry forms, and multi-level data review.',
    to: '/pms/data-collection/my-tasks',
    section: '3.1.4',
    icon: ClipboardList,
  },
]

export default function PmsHomePage() {
  return (
    <div>
      <PageHeader
        title="Performance Management (PMS)"
        description="KPI and project management subsystem — implemented section by section."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
          <Link key={mod.to} to={mod.to} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-5 text-primary" />
                  {mod.title}
                </CardTitle>
                <CardDescription>Section {mod.section}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-primary">
                Open module
                <ChevronRight className="size-4" />
              </CardContent>
            </Card>
          </Link>
          )
        })}
      </div>
    </div>
  )
}
