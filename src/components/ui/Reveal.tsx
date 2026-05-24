import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  once?: boolean
  threshold?: number
}

const staggerClass: Record<number, string> = {
  0: '',
  1: 'stagger-1',
  2: 'stagger-2',
  3: 'stagger-3',
  4: 'stagger-4',
  5: 'stagger-5',
  6: 'stagger-6',
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  once = true,
  threshold = 0.12,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined'
  )

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) obs.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [once, threshold])

  return (
    <div
      ref={ref}
      className={['reveal', staggerClass[delay], visible ? 'is-visible' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
