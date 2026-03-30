import { useState, useRef, useEffect } from 'react'
import { useFilters } from '../../context/FilterContext'
import { gpoDisplayName } from '../../lib/formatters'
import { GPO_COLORS } from '../../lib/colors'

export function GPOSelector({ allGPOs }: { allGPOs: string[] }) {
  const { selectedGPOs, setSelectedGPOs } = useFilters()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (gpo: string) => {
    setSelectedGPOs(
      selectedGPOs.includes(gpo)
        ? selectedGPOs.filter((g) => g !== gpo)
        : [...selectedGPOs, gpo]
    )
  }

  const label = selectedGPOs.length === 0
    ? 'All GPOs'
    : selectedGPOs.length === 1
    ? gpoDisplayName(selectedGPOs[0])
    : `${selectedGPOs.length} GPOs`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {label}
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg shadow-lg py-1 z-50">
          {allGPOs.map((gpo) => (
            <label
              key={gpo}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedGPOs.includes(gpo)}
                onChange={() => toggle(gpo)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: GPO_COLORS[gpo] || '#94A3B8' }}
              />
              {gpoDisplayName(gpo)}
            </label>
          ))}
          {selectedGPOs.length > 0 && (
            <button
              onClick={() => setSelectedGPOs([])}
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
