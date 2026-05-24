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
    <header className="pt-10 pb-10 sm:pt-16 sm:pb-12 md:pt-24">
      <Reveal>
        <div className="grid grid-cols-12 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 items-end">
          <div className="col-span-12 md:col-span-7">
            <div className="flex items-center gap-3 text-ink-4">
              <span aria-hidden className="h-px w-6 bg-ink-5 sm:w-8" />
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em]">
                {eyebrow}
              </p>
            </div>
            <h1 className="mt-4 font-display text-[34px] sm:text-[48px] md:text-[64px] lg:text-[80px] leading-[0.94] tracking-[-0.04em] text-ink text-balance">
              {title}
            </h1>
            {lede && (
              <p className="mt-5 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-ink-3 text-pretty">
                {lede}
              </p>
            )}
          </div>

          <div className="col-span-12 md:col-span-5 md:col-start-8 flex flex-col gap-3 md:items-end">
            <div className="-mx-4 sm:mx-0 overflow-x-auto no-scrollbar">
              <div className="flex w-max items-center gap-2 px-4 sm:px-0 md:w-auto md:flex-wrap md:justify-end">
                <RegionSelector allRegions={allRegions} />
                <GPOSelector allGPOs={allGPOs} />
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="press inline-flex items-center gap-2 self-start md:self-end rounded-full bg-paper-2 px-3 py-1.5 text-[11px] font-medium text-ink-3 hover:text-ink"
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
