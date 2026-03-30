import { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import type { SurgeryCostRow } from '../types/database'

interface UseSurgeryCostsResult {
  data: SurgeryCostRow[]
  loading: boolean
  error: string | null
}

export function useSurgeryCosts(): UseSurgeryCostsResult {
  const [data, setData] = useState<SurgeryCostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      setError(null)

      // Supabase defaults to 1000 rows; fetch all 4,608 in batches
      const PAGE_SIZE = 1000
      let allRows: SurgeryCostRow[] = []
      let from = 0
      let hasMore = true

      while (hasMore) {
        const { data: rows, error: err } = await supabase
          .from('surgery_costs_full')
          .select('*')
          .range(from, from + PAGE_SIZE - 1)

        if (cancelled) return

        if (err) {
          setError(err.message)
          setLoading(false)
          return
        }

        allRows = allRows.concat(rows as SurgeryCostRow[])
        hasMore = rows.length === PAGE_SIZE
        from += PAGE_SIZE
      }

      setData(allRows)
      setLoading(false)
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
