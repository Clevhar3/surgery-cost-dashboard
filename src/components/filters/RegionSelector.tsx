import { useState, useRef, useEffect } from 'react'
import { useFilters } from '../../context/FilterContext'
import { regionDisplayName } from '../../lib/formatters'

export function RegionSelector({ allRegions }: { allRegions: string[] }) {
  const { selectedRegions, setSelectedRegions } = useFilters()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (region: string) => {
    setSelectedRegions(
      selectedRegions.includes(region)
        ? selectedRegions.filter((r) => r !== region)
        : [...selectedRegions, region]
    )
  }

  const label = selectedRegions.length === 0
    ? 'All Regions'
    : selectedRegions.length === 1
    ? regionDisplayName(selectedRegions[0])
    : `${selectedRegions.length} Regions`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
        {label}
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg shadow-lg py-1 z-50">
          {allRegions.map((region) => (
            <label
              key={region}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedRegions.includes(region)}
                onChange={() => toggle(region)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              {regionDisplayName(region)}
            </label>
          ))}
          {selectedRegions.length > 0 && (
            <button
              onClick={() => setSelectedRegions([])}
              className="w-full text-left px-3 py-2 text-xs text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-700 border-t border-border dark:border-border-dark"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  )
}
