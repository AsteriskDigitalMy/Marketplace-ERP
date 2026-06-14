import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PageHeader } from '@/components/pms/PageHeader'
import { PermissionGate } from '@/components/pms/PermissionGate'
import { AsyncState } from '@/components/pms/AsyncState'
import { usePmsAuth } from '@/contexts/pms-auth-context'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { OrgTree, countOrgUnits, findOrgNode, collectAncestorIds } from '@/components/pms/admin/OrgTree'
import { CreateOrgUnitDialog } from '@/components/pms/admin/CreateOrgUnitDialog'
import {
  fetchOrgTree,
  type OrgUnitTreeNode,
} from '@/services/pms/admin/org-service'

export default function OrgStructurePage() {
  const { hasPermission } = usePmsAuth()
  const [tree, setTree] = useState<OrgUnitTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [createOpen, setCreateOpen] = useState(false)
  const [createParent, setCreateParent] = useState<OrgUnitTreeNode | null>(null)

  const loadTree = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrgTree()
      setTree(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].Id)
        setExpandedIds(new Set([data[0].Id]))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization tree')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    void loadTree()
  }, [loadTree])

  useEffect(() => {
    if (!debouncedSearch || tree.length === 0) {
      return
    }
    const expand = new Set(expandedIds)
    const walk = (nodes: OrgUnitTreeNode[]) => {
      nodes.forEach((n) => {
        if (
          n.Name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          n.Code.toLowerCase().includes(debouncedSearch.toLowerCase())
        ) {
          const ancestors = collectAncestorIds(tree, n.Id)
          ancestors?.forEach((id) => expand.add(id))
          expand.add(n.Id)
        }
        walk(n.Children)
      })
    }
    walk(tree)
    setExpandedIds(expand)
  }, [debouncedSearch, tree])

  const selectedNode = selectedId ? findOrgNode(tree, selectedId) : null
  const totalUnits = countOrgUnits(tree)
  const canManage = hasPermission('org.manage')
  const canAdd =
    canManage &&
    selectedNode &&
    !selectedNode.IsDisabled

  const openCreate = (parent: OrgUnitTreeNode | null) => {
    setCreateParent(parent)
    setCreateOpen(true)
  }

  return (
    <PermissionGate allowed={canManage}>
      <PageHeader
        title="Organizational Structure"
        description={`${totalUnits} unit${totalUnits === 1 ? '' : 's'} in hierarchy`}
        actions={
          <>
            <Button type="button" variant="light" size="sm" onClick={() => void loadTree()}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!canAdd && tree.length > 0}
                    onClick={() => openCreate(selectedNode)}
                  >
                    <Plus className="mr-2 size-4" />
                    Add
                  </Button>
                </span>
              </TooltipTrigger>
              {!canAdd && tree.length > 0 ? (
                <TooltipContent>
                  {selectedNode?.IsDisabled
                    ? 'Cannot add children under a disabled unit'
                    : 'Select an active parent node'}
                </TooltipContent>
              ) : null}
            </Tooltip>
          </>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search organization tree"
        />
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void loadTree()}
        empty={!loading && tree.length === 0}
        emptyTitle="No organizational units yet"
        emptyDescription="Create the root company to start building your structure."
        emptyAction={
          <Button type="button" onClick={() => openCreate(null)}>
            Create root company
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <OrgTree
            nodes={tree}
            selectedId={selectedId}
            searchQuery={debouncedSearch}
            expandedIds={expandedIds}
            onToggleExpand={(id) => {
              setExpandedIds((prev) => {
                const next = new Set(prev)
                if (next.has(id)) {
                  next.delete(id)
                } else {
                  next.add(id)
                }
                return next
              })
            }}
            onSelect={setSelectedId}
          />

          {selectedNode ? (
            <aside className="rounded-lg border p-4 text-sm">
              <h3 className="font-semibold">{selectedNode.Name}</h3>
              <dl className="mt-3 space-y-2 text-muted-foreground">
                <div>
                  <dt className="text-xs uppercase">Code</dt>
                  <dd className="text-foreground">{selectedNode.Code}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase">Tier</dt>
                  <dd className="text-foreground">{selectedNode.TierType}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase">Status</dt>
                  <dd className="text-foreground">{selectedNode.IsDisabled ? 'Disabled' : 'Active'}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/pms/admin/org/${selectedNode.Id}/edit`}>Edit / Disable</Link>
                </Button>
                <Button asChild variant="light" size="sm">
                  <Link to={`/pms/admin/org/${selectedNode.Id}/history`}>Version history</Link>
                </Button>
              </div>
            </aside>
          ) : null}
        </div>
      </AsyncState>

      <CreateOrgUnitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parent={createParent}
        onCreated={() => void loadTree()}
      />
    </PermissionGate>
  )
}
