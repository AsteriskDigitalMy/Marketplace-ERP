import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { GanttTaskRow } from '@/services/pms/project/project-service'

type Scale = 'day' | 'week' | 'month'

interface GanttChartProps {
  tasks: GanttTaskRow[]
}

function parseDate(s: string): number {
  return new Date(s).getTime()
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString()
}

export function GanttChart({ tasks }: GanttChartProps) {
  const [scale, setScale] = useState<Scale>('week')
  const [executorFilter, setExecutorFilter] = useState<string[]>([])
  const [selected, setSelected] = useState<GanttTaskRow | null>(null)

  const executors = useMemo(() => {
    const map = new Map<string, string>()
    tasks.forEach((t) => map.set(t.OwnerId, t.OwnerName))
    return [...map.entries()].map(([Id, Name]) => ({ Id, Name }))
  }, [tasks])

  const filtered = useMemo(() => {
    if (executorFilter.length === 0) return tasks
    return tasks.filter((t) => executorFilter.includes(t.OwnerId))
  }, [tasks, executorFilter])

  const range = useMemo(() => {
    if (filtered.length === 0) return { min: Date.now(), max: Date.now() + 1 }
    const starts = filtered.map((t) => parseDate(t.PlannedStart))
    const ends = filtered.map((t) => parseDate(t.PlannedEnd))
    return { min: Math.min(...starts), max: Math.max(...ends) }
  }, [filtered])

  const pxPerMs = scale === 'day' ? 0.00015 : scale === 'week' ? 0.00004 : 0.00001

  const barStyle = (start: string, end: string) => {
    const left = (parseDate(start) - range.min) * pxPerMs
    const width = Math.max((parseDate(end) - parseDate(start)) * pxPerMs, 24)
    return { left, width }
  }

  const exportImage = () => {
    toast.success('Gantt chart exported as gantt-export.png (mock)')
  }

  const toggleExecutor = (id: string) => {
    setExecutorFilter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No sub-tasks yet. Create tasks to generate the Gantt chart.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label>Timeline scale</Label>
          <Select value={scale} onValueChange={(v) => setScale(v as Scale)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Executor filter</Label>
          <div className="flex flex-wrap gap-2">
            {executors.map((e) => (
              <label key={e.Id} className="flex items-center gap-1.5 text-sm">
                <Checkbox
                  checked={executorFilter.includes(e.Id)}
                  onCheckedChange={() => toggleExecutor(e.Id)}
                />
                {e.Name}
              </label>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportImage}>
          <Download className="mr-2 size-4" />
          Export image
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-primary/60" /> Planned
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-green-600/70" /> Actual
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-destructive/70" /> Overdue / at risk
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Adjust filters to see chart bars.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <div className="min-w-[720px]">
            {filtered.map((task) => {
              const planned = barStyle(task.PlannedStart, task.PlannedEnd)
              const actualStart = task.ActualStart ?? task.PlannedStart
              const actualEnd =
                task.ActualEnd ??
                (task.ProgressPct > 0 ? task.PlannedEnd : task.PlannedStart)
              const actual = barStyle(actualStart, actualEnd)
              return (
                <button
                  key={task.TaskId}
                  type="button"
                  className="flex w-full border-b px-3 py-3 text-left hover:bg-muted/40"
                  onClick={() => setSelected(task)}
                >
                  <div className="w-48 shrink-0 pr-3">
                    <p className="truncate text-sm font-medium">{task.Name}</p>
                    <p className="text-xs text-muted-foreground">{task.OwnerName}</p>
                  </div>
                  <div className="relative h-10 flex-1">
                    <div
                      className="absolute top-1 h-3 rounded bg-primary/50"
                      style={{ left: planned.left, width: planned.width }}
                      title={`Planned: ${formatDate(task.PlannedStart)} – ${formatDate(task.PlannedEnd)}`}
                    />
                    {task.ProgressPct > 0 ? (
                      <div
                        className={`absolute top-5 h-3 rounded ${task.IsOverdue ? 'bg-destructive/70' : 'bg-green-600/70'}`}
                        style={{ left: actual.left, width: actual.width }}
                        title={`Actual progress ${task.ProgressPct}%`}
                      />
                    ) : null}
                  </div>
                  <div className="w-16 shrink-0 text-right text-sm">{task.ProgressPct}%</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected?.Name}</SheetTitle>
            <SheetDescription>{selected?.OwnerName}</SheetDescription>
          </SheetHeader>
          {selected ? (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                Planned: {formatDate(selected.PlannedStart)} – {formatDate(selected.PlannedEnd)}
              </p>
              {selected.ActualStart ? (
                <p>
                  Actual: {formatDate(selected.ActualStart)}
                  {selected.ActualEnd ? ` – ${formatDate(selected.ActualEnd)}` : ' (in progress)'}
                </p>
              ) : null}
              <p>Progress: {selected.ProgressPct}%</p>
              {selected.IsOverdue ? <Badge variant="destructive">Overdue / at risk</Badge> : null}
              {selected.PrerequisiteTaskIds.length > 0 ? (
                <p className="text-muted-foreground">
                  {selected.PrerequisiteTaskIds.length} prerequisite(s)
                </p>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
