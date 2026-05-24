import { useEffect, useState } from 'react'

function read(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return false
  }
  return window.matchMedia(query).matches
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => read(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return
    const m = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [query])

  return matches
}
