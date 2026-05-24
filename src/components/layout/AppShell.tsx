import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { List, X, FirstAidKit } from '@phosphor-icons/react'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="relative min-h-[100dvh] grain">
      <MobileTopBar onMenuClick={() => setMobileOpen(true)} />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main
        className={[
          'transition-[padding] duration-500 pl-0',
          collapsed ? 'md:pl-[96px]' : 'md:pl-[268px]',
        ].join(' ')}
      >
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}

function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="md:hidden sticky top-0 z-30 safe-top">
      <div className="flex items-center justify-between gap-3 border-b border-ink/[0.06] bg-paper/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper"
          >
            <FirstAidKit weight="bold" className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-[13px] font-semibold tracking-tight text-ink">
              Procyon
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
              cost atlas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="press inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper-2 text-ink ring-1 ring-ink/[0.06] hover:ring-ink/15"
          >
            <List weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function CloseDrawerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close menu"
      className="press inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper-2 text-ink ring-1 ring-ink/[0.06] hover:ring-ink/15 md:hidden"
    >
      <X weight="bold" className="h-4 w-4" />
    </button>
  )
}
