import { useEffect, useRef, useState } from 'react'
import { CaretDown, Check, MagnifyingGlass } from '@phosphor-icons/react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
  label?: string
  className?: string
  align?: 'left' | 'right'
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Choose...',
  searchable = false,
  label,
  className = '',
  align = 'left',
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    if (open) document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [open])

  const selected = options.find((o) => o.value === value)
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-ink-4">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex w-full items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-left text-[14px] press',
          'ring-1 ring-ink/10 hover:ring-ink/25',
          open ? 'ring-coral-500/60 ring-2' : '',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-ink' : 'text-ink-4'}>
          {selected?.label ?? placeholder}
        </span>
        <CaretDown
          weight="bold"
          className={`h-3.5 w-3.5 text-ink-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={[
            'absolute z-50 mt-2 w-full min-w-[260px] origin-top rounded-2xl bg-paper p-2 shadow-[var(--shadow-float-md)] ring-1 ring-ink/10',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
          role="listbox"
        >
          {searchable && (
            <div className="mb-1 flex items-center gap-2 rounded-xl bg-paper-2 px-3 py-2">
              <MagnifyingGlass weight="regular" className="h-4 w-4 text-ink-4" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-4 focus:outline-none"
              />
            </div>
          )}
          <div className="max-h-[280px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-ink-4">
                No matches for &ldquo;{query}&rdquo;
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={[
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] transition-colors duration-150',
                      isSelected
                        ? 'bg-ink text-paper'
                        : 'text-ink hover:bg-paper-2',
                    ].join(' ')}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check weight="bold" className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
