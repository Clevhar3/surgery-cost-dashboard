import type { ReactNode, HTMLAttributes } from 'react'

interface BezelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  innerClassName?: string
  tone?: 'paper' | 'ink' | 'coral'
  size?: 'sm' | 'md' | 'lg'
}

const outerToneClass = {
  paper: 'bezel-outer',
  ink: 'bezel-outer bg-ink/[0.02]',
  coral: 'bezel-outer bg-coral-50/60',
} as const

const innerToneClass = {
  paper: 'bezel-inner',
  ink: 'bezel-inner bg-paper',
  coral: 'bezel-inner',
} as const

const padding = {
  sm: 'p-5',
  md: 'p-7',
  lg: 'p-10',
} as const

export function Bezel({
  children,
  className = '',
  innerClassName = '',
  tone = 'paper',
  size = 'md',
  ...rest
}: BezelProps) {
  return (
    <div className={`${outerToneClass[tone]} ${className}`} {...rest}>
      <div className={`${innerToneClass[tone]} ${padding[size]} ${innerClassName}`}>
        {children}
      </div>
    </div>
  )
}
