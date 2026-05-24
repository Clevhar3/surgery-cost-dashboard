import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyTheme(next: Theme) {
  const root = document.documentElement
  if (next === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* storage unavailable */
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem('theme')) return
      } catch {
        /* ignore */
      }
      const next: Theme = e.matches ? 'dark' : 'light'
      applyTheme(next)
      setTheme(next)
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const set = (next: Theme) => {
    applyTheme(next)
    setTheme(next)
  }

  const toggle = () => set(theme === 'dark' ? 'light' : 'dark')

  return { theme, set, toggle }
}
