import { Link } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/pms/PageHeader'

const modules = [
  {
    title: 'System Basic Management',
    description: 'Organization, accounts, roles, dictionaries, audit logs, and parameters.',
    to: '/pms/admin/org',
    section: '3.1.1',
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
        {modules.map((mod) => (
          <Link key={mod.to} to={mod.to} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="size-5 text-primary" />
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
        ))}
      </div>
    </div>
  )
}
