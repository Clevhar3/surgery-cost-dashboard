import { MagnifyingGlass, X } from '@phosphor-icons/react'
import type { InputHTMLAttributes } from 'react'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...rest
}: SearchInputProps) {
  return (
    <div
      className={[
        'group relative flex items-center gap-3 rounded-2xl bg-paper px-4 py-3 ring-1 ring-ink/10 transition-all duration-300',
        'focus-within:ring-2 focus-within:ring-coral-500/60',
        className,
      ].join(' ')}
    >
      <MagnifyingGlass
        weight="regular"
        className="h-4 w-4 shrink-0 text-ink-4 transition-colors duration-300 group-focus-within:text-coral-500"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-4 focus:outline-none"
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('')
            onClear?.()
          }}
          className="press inline-flex h-6 w-6 items-center justify-center rounded-full bg-paper-2 text-ink-3 hover:text-ink"
          aria-label="Clear search"
        >
          <X weight="bold" className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
