import { NavLink } from 'react-router-dom'
import {
  ChartLineUp,
  Scales,
  ChartBar,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  FirstAidKit,
  X,
} from '@phosphor-icons/react'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { to: '/', label: 'Overview', icon: ChartLineUp, code: '01' },
  { to: '/gpo-comparison', label: 'GPO comparison', icon: Scales, code: '02' },
  { to: '/analysis', label: 'Statistical analysis', icon: ChartBar, code: '03' },
  { to: '/procedures', label: 'Procedure explorer', icon: MagnifyingGlass, code: '04' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <div
        aria-hidden
        onClick={onMobileClose}
        className={[
          'fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      <aside
        aria-label="Primary navigation"
        className={[
          'fixed z-50 transition-[transform,width] duration-500',
          'top-3 bottom-3 left-3 w-[280px] max-w-[calc(100vw-24px)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-[110%]',
          'md:translate-x-0 md:top-6 md:bottom-6 md:left-6 md:max-w-none',
          collapsed ? 'md:w-[72px]' : 'md:w-[236px]',
        ].join(' ')}
      >
        <div className="bezel-outer h-full">
          <div className="bezel-inner relative flex h-full flex-col overflow-hidden p-3">
            <header className="flex items-center gap-2 px-2 pt-2 pb-5">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-paper"
                aria-hidden
              >
                <FirstAidKit weight="bold" className="h-4 w-4" />
              </span>
              {(!collapsed || mobileOpen) && (
                <div className="min-w-0 leading-tight">
                  <p className="font-display text-[14px] font-semibold tracking-tight text-ink">
                    Procyon
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
                    cost atlas
                  </p>
                </div>
              )}

              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="press ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-paper-2 text-ink-3 hover:text-ink md:hidden"
              >
                <X weight="bold" className="h-3.5 w-3.5" />
              </button>
            </header>

            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      [
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium tracking-tight transition-all duration-300',
                        isActive
                          ? 'bg-ink text-paper'
                          : 'text-ink-3 hover:bg-paper-2 hover:text-ink',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          weight={isActive ? 'fill' : 'regular'}
                          className="h-[18px] w-[18px] shrink-0"
                        />
                        {(!collapsed || mobileOpen) && (
                          <>
                            <span className="truncate">{item.label}</span>
                            <span
                              className={[
                                'ml-auto font-mono text-[10px] tracking-wider',
                                isActive ? 'text-coral-300' : 'text-ink-5',
                              ].join(' ')}
                            >
                              {item.code}
                            </span>
                          </>
                        )}
                        {collapsed && !mobileOpen && (
                          <span
                            className="pointer-events-none absolute left-[calc(100%+12px)] z-50 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-medium text-paper opacity-0 ring-1 ring-white/10 transition-opacity duration-200 group-hover:opacity-100 md:block"
                          >
                            {item.label}
                            <span className="ml-2 font-mono text-[9px] text-coral-300">
                              {item.code}
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>

            <footer className="mt-4 space-y-3 border-t border-ink/[0.06] pt-4">
              {(!collapsed || mobileOpen) && (
                <div className="px-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                    Records
                  </p>
                  <p className="mt-1 font-display text-[20px] font-medium tracking-tight text-ink tnum">
                    4,608
                  </p>
                  <p className="font-mono text-[10px] text-ink-4">surgery cost rows</p>
                </div>
              )}

              {(!collapsed || mobileOpen) ? (
                <div className="flex items-center gap-2">
                  <ThemeToggle variant="full" className="flex-1" />
                  <button
                    onClick={onToggle}
                    aria-label="Collapse sidebar"
                    className="press hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper-2 text-ink-3 hover:text-ink md:inline-flex"
                  >
                    <CaretLeft weight="bold" className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ThemeToggle className="h-9 w-9" />
                  <button
                    onClick={onToggle}
                    aria-label="Expand sidebar"
                    className="press inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper-2 text-ink-3 hover:text-ink"
                  >
                    <CaretRight weight="bold" className="h-3 w-3" />
                  </button>
                </div>
              )}
            </footer>
          </div>
        </div>
      </aside>
    </>
  )
}
