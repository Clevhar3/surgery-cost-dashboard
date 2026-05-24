import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}

const easeOutSpring = (t: number) => {
  if (t >= 1) return 1
  const c = 1.10
  return 1 - Math.cos((t * Math.PI) / 2) * (1 - c * t * (1 - t) * 0.18)
}

export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  duration = 900,
  className = '',
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(value)
  const prevValueRef = useRef(value)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const from = prevValueRef.current
    const to = value
    if (from === to) return
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = easeOutSpring(t)
      setDisplayed(from + (to - from) * eased)
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        prevValueRef.current = to
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  return <span className={`tnum ${className}`}>{format(displayed)}</span>
}
