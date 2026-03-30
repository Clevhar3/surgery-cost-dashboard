import { useFilters } from '../../context/FilterContext'
import { RegionSelector } from '../filters/RegionSelector'
import { GPOSelector } from '../filters/GPOSelector'

export function Header({
  title,
  allRegions,
  allGPOs,
}: {
  title: string
  allRegions: string[]
  allGPOs: string[]
}) {
  const { resetFilters, selectedRegions, selectedGPOs } = useFilters()
  const hasFilters = selectedRegions.length > 0 || selectedGPOs.length > 0

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border dark:border-border-dark">
      <div className="flex items-center justify-between px-6 h-16">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        <div className="flex items-center gap-3">
          <RegionSelector allRegions={allRegions} />
          <GPOSelector allGPOs={allGPOs} />
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
            >
              Clear filters
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function ThemeToggle() {
  const toggle = () => {
    document.documentElement.classList.toggle('dark')
    const isDark = document.documentElement.classList.contains('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
      title="Toggle theme"
    >
      <svg className="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg className="w-5 h-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  )
}
