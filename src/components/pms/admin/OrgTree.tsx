import { ChevronDown, ChevronRight, Factory } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatTierLabel } from '@/lib/pms/org-tier-rules'
import type { OrgUnitTreeNode } from '@/services/pms/admin/org-service'

interface OrgTreeProps {
  nodes: OrgUnitTreeNode[]
  selectedId: string | null
  searchQuery: string
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
}

function nodeMatchesSearch(node: OrgUnitTreeNode, query: string): boolean {
  const q = query.toLowerCase()
  return (
    node.Name.toLowerCase().includes(q) ||
    node.Code.toLowerCase().includes(q) ||
    node.Children.some((child) => nodeMatchesSearch(child, query))
  )
}

export function collectAncestorIds(
  nodes: OrgUnitTreeNode[],
  targetId: string,
  path: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.Id === targetId) {
      return path
    }
    const found = collectAncestorIds(node.Children, targetId, [...path, node.Id])
    if (found) {
      return found
    }
  }
  return null
}

function TreeNode({
  node,
  depth,
  selectedId,
  searchQuery,
  expandedIds,
  onToggleExpand,
  onSelect,
}: {
  node: OrgUnitTreeNode
  depth: number
  selectedId: string | null
  searchQuery: string
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
}) {
  const hasChildren = node.Children.length > 0
  const expanded = expandedIds.has(node.Id)
  const isSelected = selectedId === node.Id
  const visible =
    !searchQuery || nodeMatchesSearch(node, searchQuery)

  if (!visible) {
    return null
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md py-1.5 pr-2 hover:bg-accent',
          isSelected && 'bg-accent',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => onToggleExpand(node.Id)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ) : (
          <span className="inline-block size-7 shrink-0" />
        )}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
          onClick={() => onSelect(node.Id)}
        >
          <Factory className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn('truncate font-medium', node.IsDisabled && 'line-through opacity-60')}>
            {node.Name}
          </span>
          <span className="truncate text-xs text-muted-foreground">{node.Code}</span>
          <Badge variant={node.IsDisabled ? 'secondary' : 'default'} className="ml-auto shrink-0 text-xs">
            {node.IsDisabled ? 'Disabled' : formatTierLabel(node.TierType)}
          </Badge>
        </button>
      </div>
      {hasChildren && expanded
        ? node.Children.map((child) => (
            <TreeNode
              key={child.Id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              searchQuery={searchQuery}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  )
}

export function OrgTree({
  nodes,
  selectedId,
  searchQuery,
  expandedIds,
  onToggleExpand,
  onSelect,
}: OrgTreeProps) {
  return (
    <ScrollArea className="h-[min(60vh,520px)] rounded-md border p-2">
      {nodes.map((node) => (
        <TreeNode
          key={node.Id}
          node={node}
          depth={0}
          selectedId={selectedId}
          searchQuery={searchQuery}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
        />
      ))}
    </ScrollArea>
  )
}

export function countOrgUnits(nodes: OrgUnitTreeNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countOrgUnits(n.Children), 0)
}

export function findOrgNode(nodes: OrgUnitTreeNode[], id: string): OrgUnitTreeNode | null {
  for (const node of nodes) {
    if (node.Id === id) {
      return node
    }
    const found = findOrgNode(node.Children, id)
    if (found) {
      return found
    }
  }
  return null
}
