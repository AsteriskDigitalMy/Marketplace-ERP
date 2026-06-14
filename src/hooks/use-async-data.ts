import { useCallback, useEffect, useState } from 'react'

interface UseAsyncDataOptions<T> {
  fetcher: () => Promise<T>
  deps?: unknown[]
  initialLoading?: boolean
}

export function useAsyncData<T>({
  fetcher,
  deps = [],
  initialLoading = true,
}: UseAsyncDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      setData(await fetcher())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...deps])

  return { data, loading, error, reload: load }
}
