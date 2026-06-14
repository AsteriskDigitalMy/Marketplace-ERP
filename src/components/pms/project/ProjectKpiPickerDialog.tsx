import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
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

interface KpiOption {
  Id: string
  Code: string
  Name: string
  Category: string
  TargetValue: number
}

interface ProjectKpiPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: KpiOption[]
  selectedIds: string[]
  onConfirm: (ids: string[]) => void
}

export function ProjectKpiPickerDialog({
  open,
  onOpenChange,
  options,
  selectedIds,
  onConfirm,
}: ProjectKpiPickerDialogProps) {
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<string[]>(selectedIds)

  const filtered = options.filter((o) => {
    const q = search.toLowerCase()
    return (
      !q ||
      o.Code.toLowerCase().includes(q) ||
      o.Name.toLowerCase().includes(q) ||
      o.Category.toLowerCase().includes(q)
    )
  })

  const toggle = (id: string) => {
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setDraft(selectedIds)
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select KPI indicators</DialogTitle>
          <DialogDescription>Only enabled indicators from the KPI library are shown.</DialogDescription>
        </DialogHeader>

        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No enabled KPIs found.{' '}
            <Link to="/pms/kpi/indicators/new" className="underline">
              Create an indicator
            </Link>
          </p>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search KPIs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-72 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((kpi) => (
                    <TableRow key={kpi.Id}>
                      <TableCell>
                        <Checkbox
                          checked={draft.includes(kpi.Id)}
                          onCheckedChange={() => toggle(kpi.Id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <Link
                          to={`/pms/kpi/indicators/${kpi.Id}`}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {kpi.Code}
                        </Link>
                      </TableCell>
                      <TableCell>{kpi.Name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{kpi.Category}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => { onConfirm(draft); onOpenChange(false) }} disabled={draft.length === 0}>
            Add {draft.length} KPI{draft.length === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
