import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState, SubmitSpinner } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { fetchDictionaries, updateDictionary } from '@/services/pms/admin/config-service'
import type { DictionaryCategory } from '@/models/pms/configuration'

type DictionaryItem = DictionaryCategory['Items'][number]

export default function DictionariesPage() {
  const { hasPermission } = usePmsAuth()
  const [categories, setCategories] = useState<DictionaryCategory[]>([])
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null)
  const [itemIndex, setItemIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [enabled, setEnabled] = useState(true)

  const selected = categories.find((c) => c.Code === selectedCode) ?? categories[0]

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDictionaries()
      setCategories(data)
      if (!selectedCode && data[0]) {
        setSelectedCode(data[0].Code)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dictionaries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openItemEditor = (item: DictionaryItem | null, index: number | null) => {
    setEditingItem(item)
    setItemIndex(index)
    setCode(item?.Code ?? '')
    setDisplayName(item?.DisplayName ?? '')
    setSortOrder(item?.SortOrder ?? 0)
    setEnabled(item?.IsEnabled ?? true)
    setEditorOpen(true)
  }

  const saveItem = async () => {
    if (!selected) {
      return
    }
    if (!code.trim() || !displayName.trim()) {
      toast.error('Code and display name are required')
      return
    }
    setSubmitting(true)
    try {
      const items = [...selected.Items]
      const next: DictionaryItem = {
        Code: code.trim(),
        DisplayName: displayName.trim(),
        SortOrder: sortOrder,
        IsEnabled: enabled,
      }
      if (itemIndex === null) {
        items.push(next)
      } else {
        items[itemIndex] = next
      }
      const updated = await updateDictionary(selected.Code, items)
      setCategories((prev) => prev.map((c) => (c.Code === updated.Code ? updated : c)))
      toast.success('Dictionary saved')
      setEditorOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleEnabled = async (index: number, value: boolean) => {
    if (!selected) {
      return
    }
    const items = selected.Items.map((item, i) =>
      i === index ? { ...item, IsEnabled: value } : item,
    )
    const updated = await updateDictionary(selected.Code, items)
    setCategories((prev) => prev.map((c) => (c.Code === updated.Code ? updated : c)))
  }

  return (
    <PermissionGate allowed={hasPermission('dictionary.manage')}>
      <PageHeader title="Global Dictionaries" description="Enumeration values used across PMS forms" />
      <AsyncState loading={loading} error={error} onRetry={() => void load()}>
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <nav className="space-y-1 rounded-lg border p-2">
            {categories.map((cat) => (
              <button
                key={cat.Code}
                type="button"
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  selected?.Code === cat.Code ? 'bg-accent font-medium' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedCode(cat.Code)}
              >
                {cat.Name}
                {cat.IsBuiltin ? (
                  <span className="ml-2 text-xs text-muted-foreground">(builtin)</span>
                ) : null}
              </button>
            ))}
          </nav>
          {selected ? (
            <div>
              <div className="mb-3 flex justify-end">
                <Button type="button" size="sm" onClick={() => openItemEditor(null, null)}>
                  Add item
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Display name</TableHead>
                      <TableHead>Sort</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.Items.map((item, index) => (
                      <TableRow key={item.Code} className={!item.IsEnabled ? 'opacity-60' : ''}>
                        <TableCell className="font-mono text-sm">{item.Code}</TableCell>
                        <TableCell>{item.DisplayName}</TableCell>
                        <TableCell>{item.SortOrder}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.IsEnabled}
                            onCheckedChange={(v) => void toggleEnabled(index, v)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openItemEditor(item, index)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </div>
      </AsyncState>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit dictionary item' : 'Add dictionary item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dcode">Code</Label>
              <Input id="dcode" value={code} onChange={(e) => setCode(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dname">Display name</Label>
              <Input id="dname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort order</Label>
              <Input
                id="sort"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={enabled} onCheckedChange={setEnabled} id="enabled" />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveItem()} disabled={submitting}>
              {submitting ? <SubmitSpinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
