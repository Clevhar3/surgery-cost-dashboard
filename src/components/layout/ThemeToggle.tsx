import { Sun, MoonStars } from '@phosphor-icons/react'
import { useTheme } from '../../hooks/useTheme'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : MoonStars

  if (variant === 'full') {
    return (
      <button
        onClick={toggle}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={[
          'press flex w-full items-center gap-2 rounded-xl bg-paper-2 px-3 py-2 text-[12px] font-medium text-ink-3 hover:text-ink',
          className,
        ].join(' ')}
      >
        <Icon weight="bold" className="h-3.5 w-3.5" />
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={[
        'press inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper-2 text-ink ring-1 ring-ink/[0.06] hover:ring-ink/15',
        className,
      ].join(' ')}
    >
      <Icon weight="bold" className="h-4 w-4" />
    </button>
  )
}
