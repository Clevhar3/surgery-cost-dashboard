import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="relative min-h-[100dvh] grain">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={[
          'transition-[padding] duration-500',
          collapsed ? 'pl-[96px]' : 'pl-[268px]',
        ].join(' ')}
      >
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}
