import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { fetchActiveRecalculation } from '@/services/pms/kpi/calculation-service'

export function RecalculationBanner() {
  const [active, setActive] = useState<Awaited<ReturnType<typeof fetchActiveRecalculation>>>(null)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      const req = await fetchActiveRecalculation()
      if (!cancelled) setActive(req)
    }

    void poll()
    const timer = setInterval(() => void poll(), 2000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  if (!active) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 px-4 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Alert className="mx-auto max-w-5xl border-primary/30 bg-primary/5 py-2">
        <Loader2 className="size-4 animate-spin" />
        <AlertDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span>
            Re-calculation in progress… ({active.ProgressPct}%)
          </span>
          <Progress value={active.ProgressPct} className="h-1.5 w-32" />
          <Link
            to="/pms/kpi/calculation/recalculate"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            View status
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  )
}
