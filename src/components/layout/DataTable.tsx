import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

interface DataTableProps {
  title: string
  description?: string
  count?: number
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  toolbarActions?: ReactNode
  children: ReactNode
  className?: string
  footer?: ReactNode
  hideSearch?: boolean
}

export function DataTable({
  title,
  description,
  count,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  toolbarActions,
  children,
  className,
  footer,
  hideSearch,
}: DataTableProps) {
  const showToolbar = !hideSearch || filters || toolbarActions

  return (
    <Card className={cn('data-table-card overflow-hidden shadow-[var(--shadow-card)]', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div>
          <CardTitle className="type-card-title">
            {title}
            {count !== undefined ? (
              <span className="ml-1.5 font-normal text-muted-foreground">({count})</span>
            ) : null}
          </CardTitle>
          {description ? (
            <p className="type-card-description mt-1">{description}</p>
          ) : null}
        </div>
        {toolbarActions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{toolbarActions}</div>
        ) : null}
      </CardHeader>

      {showToolbar ? (
        <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          {!hideSearch && onSearchChange ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 bg-card pl-9"
              />
            </div>
          ) : (
            <div />
          )}
          {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
        </div>
      ) : null}

      <CardContent className="p-0">{children}</CardContent>

      {footer ? (
        <div className="border-t border-border/60 px-5 py-3">{footer}</div>
      ) : null}
    </Card>
  )
}

interface DataTablePaginationProps {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pages = buildPageNumbers(page, totalPages)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {totalItems === 0
          ? 'No records to display'
          : `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="light"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant={p === page ? 'default' : 'light'}
                size="sm"
                className="min-w-8 px-2"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="light"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
      </div>
    </div>
  )
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | 'ellipsis')[] = [1]
  if (current > 3) items.push('ellipsis')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let p = start; p <= end; p++) items.push(p)
  if (current < total - 2) items.push('ellipsis')
  if (total > 1) items.push(total)
  return items
}
