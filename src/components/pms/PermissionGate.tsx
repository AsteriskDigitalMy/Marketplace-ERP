import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

interface PermissionGateProps {
  allowed: boolean
  children: ReactNode
}

export function PermissionGate({ allowed, children }: PermissionGateProps) {
  if (allowed) {
    return <>{children}</>
  }
  return (
    <Card className="mx-auto mt-8 max-w-lg border-border shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="size-5" />
          Access denied
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>You do not have permission to view this page. Contact your system administrator.</p>
        <Button asChild variant="outline">
          <Link to="/pms">Back to PMS</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
