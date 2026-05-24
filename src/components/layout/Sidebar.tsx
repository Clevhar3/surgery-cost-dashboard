import { NavLink } from 'react-router-dom'
import {
  ChartLineUp,
  Scales,
  ChartBar,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  FirstAidKit,
} from '@phosphor-icons/react'

const navItems = [
  { to: '/', label: 'Overview', icon: ChartLineUp, code: '01' },
  { to: '/gpo-comparison', label: 'GPO comparison', icon: Scales, code: '02' },
  { to: '/analysis', label: 'Statistical analysis', icon: ChartBar, code: '03' },
  { to: '/procedures', label: 'Procedure explorer', icon: MagnifyingGlass, code: '04' },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={[
        'fixed top-6 bottom-6 left-6 z-40 transition-[width] duration-500',
        collapsed ? 'w-[72px]' : 'w-[236px]',
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
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="font-display text-[14px] font-semibold tracking-tight text-ink">
                  Procyon
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
                  cost atlas
                </p>
              </div>
            )}
          </header>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
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
                      {!collapsed && (
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
                      {collapsed && (
                        <span
                          className="pointer-events-none absolute left-[calc(100%+12px)] z-50 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-medium text-paper opacity-0 ring-1 ring-white/10 transition-opacity duration-200 group-hover:opacity-100"
                        >
                          {item.label}
                          <span className="ml-2 font-mono text-[9px] text-coral-300">{item.code}</span>
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <footer className="mt-4 space-y-3 border-t border-ink/[0.06] pt-4">
            {!collapsed && (
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
            <button
              onClick={onToggle}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="press flex w-full items-center justify-center gap-2 rounded-xl bg-paper-2 px-3 py-2 text-[11px] font-medium text-ink-3 hover:text-ink"
            >
              {collapsed ? <CaretRight weight="bold" className="h-3 w-3" /> : <CaretLeft weight="bold" className="h-3 w-3" />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </footer>
        </div>
      </div>
    </aside>
  )
}
