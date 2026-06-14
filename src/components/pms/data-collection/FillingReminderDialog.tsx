import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import {
  fetchDueFillingTasks,
  getDueCountdownLabel,
} from '@/services/pms/data-collection/data-collection-service'
import type { FillingTaskRecord } from '@/services/pms/data-collection/data-collection-service'

const SESSION_KEY = 'pms-filling-reminder-dismissed'

export function FillingReminderDialog() {
  const { userId } = usePmsAuth()
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState<FillingTaskRecord[]>([])
  const [dontShowToday, setDontShowToday] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY)
    if (dismissed === new Date().toDateString()) return

    void fetchDueFillingTasks(userId).then((due) => {
      if (due.length > 0) {
        setTasks(due.slice(0, 5))
        setOpen(true)
      }
    })
  }, [userId])

  const dismiss = () => {
    if (dontShowToday) {
      sessionStorage.setItem(SESSION_KEY, new Date().toDateString())
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Filling tasks due</DialogTitle>
          <DialogDescription>
            You have {tasks.length} filling task(s) requiring attention.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Indicator</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => {
              const countdown = getDueCountdownLabel(t.DueAt)
              return (
                <TableRow key={t.Id}>
                  <TableCell>{t.IndicatorName}</TableCell>
                  <TableCell>{t.PeriodLabel}</TableCell>
                  <TableCell>
                    <Badge variant={countdown.variant}>{countdown.label}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={dontShowToday}
            onCheckedChange={(c) => setDontShowToday(c === true)}
          />
          Don&apos;t show again today
        </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="light" onClick={dismiss}>
            Remind me later
          </Button>
          <Button asChild onClick={dismiss}>
            <Link to="/pms/data-collection/my-tasks">Go to my tasks</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
