import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/pms/PageHeader'
import { AsyncState } from '@/components/pms/AsyncState'
import { DataTable } from '@/components/layout/DataTable'

export interface EntityColumn<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
}

interface EntityListPageProps<T> {
  title: string
  description: string
  fetchItems: () => Promise<T[]>
  columns: EntityColumn<T>[]
  rowKey: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
  actions?: React.ReactNode
  searchPlaceholder?: string
  filterFn?: (row: T, query: string) => boolean
}

export function EntityListPage<T>({
  title,
  description,
  fetchItems,
  columns,
  rowKey,
  emptyTitle = 'No records yet',
  emptyDescription,
  actions,
  searchPlaceholder = 'Search…',
  filterFn,
}: EntityListPageProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setError(null)
    try {
      setItems(await fetchItems())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void load()
  }, [])

  const filtered = filterFn
    ? items.filter((row) => filterFn(row, search))
    : items

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={actions} />

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => {
          setLoading(true)
          void load()
        }}
        empty={!loading && !error && filtered.length === 0}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      >
        <DataTable
          title={title}
          count={filtered.length}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={searchPlaceholder}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </AsyncState>
    </div>
  )
}
