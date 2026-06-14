import { useCallback, useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatusColorDot } from '@/components/pms/cockpit/StatusColorDot'
import { fetchDrillDown } from '@/services/pms/cockpit/cockpit-service'
import type { DrillDownNode, DrillDownRequest } from '@/models/pms/operations'

interface DrillDownSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceWidgetId: string
  dataPointId: string
  metricLabel: string
}

interface BreadcrumbItem {
  label: string
  level: number
  parentId: string | null
}

export function DrillDownSheet({
  open,
  onOpenChange,
  sourceWidgetId,
  dataPointId,
  metricLabel,
}: DrillDownSheetProps) {
  const [level, setLevel] = useState(1)
  const [parentId, setParentId] = useState<string | null>(null)
  const [nodes, setNodes] = useState<DrillDownNode[]>([])
  const [title, setTitle] = useState(metricLabel)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'Cockpit', level: 0, parentId: null },
    { label: metricLabel, level: 1, parentId: null },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileNode, setProfileNode] = useState<DrillDownNode | null>(null)

  const loadLevel = useCallback(
    async (req: DrillDownRequest) => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchDrillDown(req)
        setNodes(result.nodes)
        if (req.Level === 1) {
          setTitle(result.title)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load drill-down')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!open) return
    setLevel(1)
    setParentId(null)
    setBreadcrumbs([
      { label: 'Cockpit', level: 0, parentId: null },
      { label: metricLabel, level: 1, parentId: null },
    ])
    void loadLevel({
      SourceWidgetId: sourceWidgetId,
      DataPointId: dataPointId,
      Level: 1,
      ParentId: null,
    })
  }, [open, sourceWidgetId, dataPointId, metricLabel, loadLevel])

  const goToLevel = (item: BreadcrumbItem) => {
    if (item.level === 0) {
      onOpenChange(false)
      return
    }
    setLevel(item.level)
    setParentId(item.parentId)
    setBreadcrumbs((prev) => prev.slice(0, prev.findIndex((b) => b.level === item.level) + 1))
    void loadLevel({
      SourceWidgetId: sourceWidgetId,
      DataPointId: dataPointId,
      Level: item.level,
      ParentId: item.parentId,
    })
  }

  const drillInto = (node: DrillDownNode) => {
    if (node.Level === 'individual') return
    const nextLevel = level + 1
    if (!node.Children?.length) {
      toast.info('No further breakdown for this selection')
      return
    }
    setLevel(nextLevel)
    setParentId(node.Id)
    setBreadcrumbs((prev) => [...prev, { label: node.Label, level: nextLevel, parentId: node.Id }])
    void loadLevel({
      SourceWidgetId: sourceWidgetId,
      DataPointId: dataPointId,
      Level: nextLevel,
      ParentId: node.Id,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl lg:max-w-4xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
            {breadcrumbs.map((item, i) => (
              <span key={`${item.label}-${item.level}`} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-3.5" /> : null}
                <button
                  type="button"
                  className="hover:text-primary hover:underline"
                  onClick={() => goToLevel(item)}
                >
                  {item.label}
                </button>
              </span>
            ))}
          </nav>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between gap-2">
                <span>{error}</span>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() =>
                    void loadLevel({
                      SourceWidgetId: sourceWidgetId,
                      DataPointId: dataPointId,
                      Level: level,
                      ParentId: parentId,
                    })
                  }
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {!loading && !error && nodes.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No detail data for this selection.
            </p>
          ) : null}

          {!loading && !error && nodes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {nodes[0]?.Metrics.map((m) => (
                    <TableHead key={m.Name}>{m.Name}</TableHead>
                  ))}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodes.map((node) => (
                  <TableRow
                    key={node.Id}
                    className={node.Level !== 'individual' ? 'cursor-pointer hover:bg-muted/50' : undefined}
                    tabIndex={node.Level !== 'individual' ? 0 : undefined}
                    onClick={() => drillInto(node)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && node.Level !== 'individual') {
                        e.preventDefault()
                        drillInto(node)
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      {node.Level === 'individual' ? (
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setProfileNode(node)
                          }}
                        >
                          {node.Label}
                        </button>
                      ) : (
                        node.Label
                      )}
                    </TableCell>
                    {node.Metrics.map((m) => (
                      <TableCell key={m.Name}>
                        <span className="inline-flex items-center gap-2">
                          <StatusColorDot color={m.StatusColor} />
                          {m.Value}
                          {m.Unit}
                        </span>
                      </TableCell>
                    ))}
                    <TableCell>
                      {node.Level !== 'individual' ? (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </div>

        <SheetFooter>
          <Button variant="light" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>

      <Dialog open={!!profileNode} onOpenChange={(o) => !o && setProfileNode(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{profileNode?.Label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{profileNode?.EmployeeTitle}</p>
            <p>{profileNode?.EmployeeEmail}</p>
            <p className="text-xs">Employee ID: {profileNode?.EmployeeId}</p>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
