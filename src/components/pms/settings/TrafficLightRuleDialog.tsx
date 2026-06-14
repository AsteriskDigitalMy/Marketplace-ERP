import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { getStatusColor } from '@/lib/pms/traffic-light'
import type { TrafficLightRule } from '@/models/pms/configuration'
import {
  saveTrafficLightRule,
  TRAFFIC_LIGHT_METRIC_OPTIONS,
  validateBandOverlap,
} from '@/services/pms/settings/traffic-light-service'

interface TrafficLightRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: TrafficLightRule | null
  onSaved: () => void
}

type BandForm = { Min: string; Max: string }

const PREVIEW_VALUES = [95, 80, 50]

export function TrafficLightRuleDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: TrafficLightRuleDialogProps) {
  const [category, setCategory] = useState<TrafficLightRule['Category']>('progress')
  const [metricScope, setMetricScope] = useState<string[]>([])
  const [green, setGreen] = useState<BandForm>({ Min: '90', Max: '100' })
  const [yellow, setYellow] = useState<BandForm>({ Min: '70', Max: '89.99' })
  const [red, setRed] = useState<BandForm>({ Min: '0', Max: '69.99' })
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setDirty(false)
    setError(null)
    if (initial) {
      setCategory(initial.Category)
      setMetricScope(initial.MetricScope)
      const g = initial.Bands.find((b) => b.Color === 'green')
      const y = initial.Bands.find((b) => b.Color === 'yellow')
      const r = initial.Bands.find((b) => b.Color === 'red')
      setGreen({ Min: String(g?.Min ?? 0), Max: String(g?.Max ?? 0) })
      setYellow({ Min: String(y?.Min ?? 0), Max: String(y?.Max ?? 0) })
      setRed({ Min: String(r?.Min ?? 0), Max: String(r?.Max ?? 0) })
    } else {
      setCategory('progress')
      setMetricScope([])
      setGreen({ Min: '90', Max: '100' })
      setYellow({ Min: '70', Max: '89.99' })
      setRed({ Min: '0', Max: '69.99' })
    }
  }, [open, initial])

  const markDirty = () => setDirty(true)

  const toggleMetric = (name: string) => {
    markDirty()
    setMetricScope((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    )
  }

  const handleSave = async () => {
    const bands = [
      { Color: 'green' as const, Min: Number(green.Min), Max: Number(green.Max) },
      { Color: 'yellow' as const, Min: Number(yellow.Min), Max: Number(yellow.Max) },
      { Color: 'red' as const, Min: Number(red.Min), Max: Number(red.Max) },
    ]
    const validation = validateBandOverlap(bands)
    if (!validation.ok) {
      setError(validation.message ?? 'Invalid bands')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await saveTrafficLightRule({
        Id: initial?.Id,
        Category: category,
        MetricScope: metricScope,
        Bands: bands,
      })
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const requestClose = () => {
    if (dirty) {
      setDiscardOpen(true)
      return
    }
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && requestClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{initial ? 'Edit rule' : 'Add rule'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  markDirty()
                  setCategory(v as TrafficLightRule['Category'])
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="delay">Delay</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metric scope (optional)</Label>
              <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border p-3">
                {TRAFFIC_LIGHT_METRIC_OPTIONS.map((name) => (
                  <label key={name} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={metricScope.includes(name)}
                      onCheckedChange={() => toggleMetric(name)}
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>

            {(
              [
                ['Green', green, setGreen, 'default'] as const,
                ['Yellow', yellow, setYellow, 'secondary'] as const,
                ['Red', red, setRed, 'destructive'] as const,
              ] as const
            ).map(([label, band, setter, variant]) => (
              <div key={label} className="grid grid-cols-[80px_1fr_1fr] items-center gap-2">
                <Badge variant={variant}>{label}</Badge>
                <Input
                  type="number"
                  placeholder="Min"
                  value={band.Min}
                  onChange={(e) => {
                    markDirty()
                    setter({ ...band, Min: e.target.value })
                  }}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={band.Max}
                  onChange={(e) => {
                    markDirty()
                    setter({ ...band, Max: e.target.value })
                  }}
                />
              </div>
            ))}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Live preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {PREVIEW_VALUES.map((v) => (
                  <Badge
                    key={v}
                    variant={
                      getStatusColor(v, category) === 'green'
                        ? 'default'
                        : getStatusColor(v, category) === 'yellow'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {v}% → {getStatusColor(v, category)}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="light" onClick={requestClose}>
              Cancel
            </Button>
            <Button type="button" disabled={submitting} onClick={() => void handleSave()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false)
                setDirty(false)
                onOpenChange(false)
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
