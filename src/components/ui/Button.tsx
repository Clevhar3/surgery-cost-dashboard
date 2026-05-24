import { ArrowRight } from '@phosphor-icons/react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline' | 'soft'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  trailingIcon?: ReactNode
  active?: boolean
  children: ReactNode
}

const sizeMap: Record<Size, { wrap: string; inner: string; gap: string; text: string }> = {
  sm: { wrap: 'pl-3 pr-[4px] py-[4px]', inner: 'h-6 w-6', gap: 'gap-2', text: 'text-[12px]' },
  md: { wrap: 'pl-5 pr-[6px] py-[6px]', inner: 'h-8 w-8', gap: 'gap-3', text: 'text-[13px]' },
  lg: { wrap: 'pl-7 pr-[8px] py-[8px]', inner: 'h-11 w-11', gap: 'gap-4', text: 'text-[15px]' },
}

const variantWrap: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-2',
  soft: 'bg-paper-2 text-ink hover:bg-paper-3',
  outline: 'bg-transparent text-ink ring-1 ring-ink/15 hover:ring-ink/30 hover:bg-paper-2/60',
  ghost: 'bg-transparent text-ink-3 hover:text-ink hover:bg-paper-2/50',
}

const variantInner: Record<Variant, string> = {
  primary: 'bg-coral-500 text-white',
  soft: 'bg-ink text-paper',
  outline: 'bg-ink text-paper',
  ghost: 'bg-coral-500 text-white',
}

export function Button({
  variant = 'primary',
  size = 'md',
  trailingIcon,
  active,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const s = sizeMap[size]
  const icon = trailingIcon ?? <ArrowRight weight="bold" className="h-4 w-4" />

  return (
    <button
      className={[
        'group relative inline-flex items-center rounded-full font-medium tracking-tight press select-none',
        s.wrap,
        s.gap,
        s.text,
        variantWrap[variant],
        active ? 'ring-2 ring-coral-500 ring-offset-2 ring-offset-paper' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      <span className="leading-none">{children}</span>
      <span
        className={[
          'inline-flex items-center justify-center rounded-full transition-transform duration-300',
          s.inner,
          variantInner[variant],
          'group-hover:-rotate-[18deg]',
        ].join(' ')}
        aria-hidden
      >
        {icon}
      </span>
    </button>
  )
}

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  swatch?: string
  children: ReactNode
}

export function Pill({ active, swatch, children, className = '', ...rest }: PillProps) {
  return (
    <button
      className={[
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-tight press',
        active
          ? 'bg-ink text-paper ring-1 ring-ink'
          : 'bg-paper text-ink-3 ring-1 ring-ink/10 hover:ring-ink/25 hover:text-ink',
        className,
      ].join(' ')}
      {...rest}
    >
      {swatch && (
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: swatch }}
          aria-hidden
        />
      )}
      <span className="leading-none">{children}</span>
    </button>
  )
}

interface SegmentedProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Segmented({ options, value, onChange, className = '' }: SegmentedProps) {
  return (
    <div
      className={[
        'relative inline-flex items-center gap-1 rounded-full bg-paper-2 p-1 ring-1 ring-ink/[0.06]',
        className,
      ].join(' ')}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={[
              'relative rounded-full px-4 py-1.5 text-[12px] font-medium tracking-tight press',
              isActive
                ? 'bg-ink text-paper shadow-[0_4px_12px_-4px_rgba(22,20,15,0.3)]'
                : 'text-ink-3 hover:text-ink',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
