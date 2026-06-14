import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchKpiLibraryForPicker } from '@/services/pms/appraisal/appraisal-scheme-service'

interface KpiIndicatorPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludeIds: string[]
  onAdd: (items: { KpiId: string; KpiName: string }[]) => void
}

export function KpiIndicatorPickerDialog({
  open,
  onOpenChange,
  excludeIds,
  onAdd,
}: KpiIndicatorPickerDialogProps) {
  const [options, setOptions] = useState<
    { Id: string; Code: string; Name: string; Category: string }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setSelected(new Set())
    setSearch('')
    void fetchKpiLibraryForPicker(excludeIds)
      .then(setOptions)
      .finally(() => setLoading(false))
  }, [open, excludeIds])

  const filtered = options.filter(
    (o) =>
      o.Name.toLowerCase().includes(search.toLowerCase()) ||
      o.Code.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add KPI indicators</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <Input
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading indicators…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No indicators available.</p>
            ) : (
              filtered.map((o) => (
                <label key={o.Id} className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={selected.has(o.Id)}
                    onCheckedChange={(c) => {
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (c) next.add(o.Id)
                        else next.delete(o.Id)
                        return next
                      })
                    }}
                  />
                  <span>
                    <span className="font-medium">{o.Name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {o.Code} · {o.Category}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground">{selected.size} selected</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="light" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={selected.size === 0}
            onClick={() => {
              const items = options
                .filter((o) => selected.has(o.Id))
                .map((o) => ({ KpiId: o.Id, KpiName: o.Name }))
              onAdd(items)
              onOpenChange(false)
            }}
          >
            Add selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
