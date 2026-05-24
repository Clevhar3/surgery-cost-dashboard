import { useState, useRef, useEffect } from 'react'
import { Buildings, CaretDown, Check } from '@phosphor-icons/react'
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
        className={[
          'press inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-medium',
          'bg-paper ring-1 ring-ink/10 hover:ring-ink/25',
          selectedGPOs.length > 0 ? 'text-ink' : 'text-ink-3',
          open ? 'ring-2 ring-coral-500/60' : '',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Buildings weight="regular" className="h-3.5 w-3.5 text-ink-4" />
        <span className="leading-none">{label}</span>
        <CaretDown
          weight="bold"
          className={`h-3 w-3 text-ink-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-60 rounded-2xl bg-paper p-2 shadow-[var(--shadow-float-md)] ring-1 ring-ink/10"
        >
          <div className="px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
              Group purchasing org
            </p>
          </div>
          {allGPOs.map((gpo) => {
            const isActive = selectedGPOs.includes(gpo)
            return (
              <button
                key={gpo}
                role="option"
                aria-selected={isActive}
                onClick={() => toggle(gpo)}
                className={[
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] transition-colors duration-150',
                  isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-2',
                ].join(' ')}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: GPO_COLORS[gpo] || '#8C8779' }}
                  />
                  {gpoDisplayName(gpo)}
                </span>
                {isActive && <Check weight="bold" className="h-3.5 w-3.5" />}
              </button>
            )
          })}
          {selectedGPOs.length > 0 && (
            <button
              onClick={() => setSelectedGPOs([])}
              className="mt-1 w-full rounded-xl border-t border-ink/[0.06] px-3 pt-3 pb-2 text-left text-[11px] font-medium text-coral-600 hover:bg-paper-2"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  )
}
