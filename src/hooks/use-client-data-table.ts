import { useEffect, useMemo, useState } from 'react'

export interface ClientDataTableState {
  page: number
  setPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
  totalItems: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
}

export function useClientDataTable<T>(
  data: T[],
  options?: {
    pageSize?: number
    searchQuery?: string
    searchFilter?: (item: T, query: string) => boolean
  },
): ClientDataTableState & { pageData: T[] } {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(options?.pageSize ?? 10)

  const filtered = useMemo(() => {
    const query = options?.searchQuery?.trim().toLowerCase()
    if (!query || !options?.searchFilter) return data
    return data.filter((item) => options.searchFilter!(item, query))
  }, [data, options?.searchQuery, options?.searchFilter])

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(page, totalPages)

  const pageData = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalItems)

  useEffect(() => {
    setPage(1)
  }, [options?.searchQuery, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return {
    pageData,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
  }
}

export function textSearchFilter<T extends Record<string, unknown>>(
  item: T,
  query: string,
  keys: (keyof T)[],
): boolean {
  const q = query.toLowerCase()
  return keys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
}
