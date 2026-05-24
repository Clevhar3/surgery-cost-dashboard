import { TrendUp, TrendDown } from '@phosphor-icons/react'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { Reveal } from '../ui/Reveal'

export type KPITone = 'ink' | 'coral' | 'olive' | 'ochre' | 'graphite'

interface KPICardProps {
  label: string
  value: string
  sublabel?: string
  numeric?: number
  numericFormat?: (n: number) => string
  tone?: KPITone
  delta?: { value: number; label: string; positive?: boolean }
  code?: string
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

const toneAccent: Record<KPITone, string> = {
  ink: 'bg-ink',
  coral: 'bg-coral-500',
  olive: 'bg-olive-500',
  ochre: 'bg-ochre-500',
  graphite: 'bg-graphite-500',
}

export function KPICard({
  label,
  value,
  sublabel,
  numeric,
  numericFormat,
  tone = 'ink',
  delta,
  code,
  delay = 0,
}: KPICardProps) {
  return (
    <Reveal delay={delay}>
      <div className="bezel-outer h-full">
        <div className="bezel-inner relative flex h-full flex-col p-7 overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
              {label}
            </p>
            {code && (
              <span className="font-mono text-[10px] tracking-wider text-ink-5">{code}</span>
            )}
          </div>

          <div className="mt-7 flex items-baseline gap-2">
            <span className={`inline-block h-3 w-1 rounded-full ${toneAccent[tone]}`} aria-hidden />
            <span className="font-display text-[44px] sm:text-[52px] font-medium tracking-[-0.04em] text-ink leading-none tnum">
              {numeric !== undefined && numericFormat ? (
                <AnimatedNumber value={numeric} format={numericFormat} />
              ) : (
                value
              )}
            </span>
          </div>

          {sublabel && (
            <p className="mt-3 text-[12px] leading-relaxed text-ink-3 text-pretty">
              {sublabel}
            </p>
          )}

          {delta && (
            <div className="mt-5 flex items-center gap-1.5">
              <span
                className={[
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tnum',
                  delta.positive
                    ? 'bg-[#E8F0E5] text-[#3A5C36]'
                    : 'bg-coral-50 text-coral-700',
                ].join(' ')}
              >
                {delta.positive ? (
                  <TrendUp weight="bold" className="h-3 w-3" />
                ) : (
                  <TrendDown weight="bold" className="h-3 w-3" />
                )}
                {delta.value >= 0 ? '+' : ''}
                {delta.value.toFixed(1)}%
              </span>
              <span className="text-[11px] text-ink-4">{delta.label}</span>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )
}
