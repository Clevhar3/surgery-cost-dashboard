import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { useFilters } from '../../context/FilterContext'
import { RegionSelector } from '../filters/RegionSelector'
import { GPOSelector } from '../filters/GPOSelector'
import { Reveal } from '../ui/Reveal'

interface HeaderProps {
  title: string
  eyebrow: string
  lede?: string
  allRegions: string[]
  allGPOs: string[]
}

export function Header({ title, eyebrow, lede, allRegions, allGPOs }: HeaderProps) {
  const { resetFilters, selectedRegions, selectedGPOs } = useFilters()
  const hasFilters = selectedRegions.length > 0 || selectedGPOs.length > 0

  return (
    <header className="pt-24 pb-12">
      <Reveal>
        <div className="grid grid-cols-12 gap-x-6 gap-y-8 items-end">
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-3 text-ink-4">
              <span aria-hidden className="h-px w-8 bg-ink-5" />
              <p className="font-mono text-[11px] uppercase tracking-[0.24em]">{eyebrow}</p>
            </div>
            <h1 className="mt-5 font-display text-[44px] sm:text-[64px] md:text-[80px] leading-[0.92] tracking-[-0.04em] text-ink text-balance">
              {title}
            </h1>
            {lede && (
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-3 text-pretty">
                {lede}
              </p>
            )}
          </div>

          <div className="col-span-12 md:col-span-5 md:col-start-8 flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <RegionSelector allRegions={allRegions} />
              <GPOSelector allGPOs={allGPOs} />
            </div>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="press inline-flex items-center gap-2 self-end rounded-full bg-paper-2 px-3 py-1.5 text-[11px] font-medium text-ink-3 hover:text-ink"
              >
                <ArrowCounterClockwise weight="bold" className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </header>
  )
}
