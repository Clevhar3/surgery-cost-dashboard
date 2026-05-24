import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowsDownUp, ArrowDown, ArrowUp, ArrowRight, MagnifyingGlassMinus } from '@phosphor-icons/react'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
import { Reveal } from '../components/ui/Reveal'
import { SearchInput } from '../components/ui/SearchInput'
import { Select } from '../components/ui/Select'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { groupBy } from '../lib/transforms'
import { mean } from '../lib/statistics'
import { formatCurrencyFull, titleCase } from '../lib/formatters'
import { CHART_COLORS } from '../lib/colors'

interface ProcedureRow {
  name: string
  code: string
  specialty: string
  avgCost: number
  costLow: number
  costHigh: number
  range: number
  regionCosts: number[]
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) {
    return <ArrowsDownUp weight="bold" className="ml-1 inline h-3 w-3 text-ink-5" />
  }
  return dir === 'asc' ? (
    <ArrowUp weight="bold" className="ml-1 inline h-3 w-3 text-coral-500" />
  ) : (
    <ArrowDown weight="bold" className="ml-1 inline h-3 w-3 text-coral-500" />
  )
}

function MiniSparkline({ values, gradientId }: { values: number[]; gradientId: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 96
  const h = 28
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 6) - 3
    return [x, y] as const
  })

  const path = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(' ')

  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg width={w} height={h} className="inline-block overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.22} />
          <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={CHART_COLORS.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.5} fill={CHART_COLORS.primary} opacity={i === points.length - 1 ? 1 : 0} />
      ))}
    </svg>
  )
}

export function ProcedureExplorer({
  data,
  allRegions,
  allGPOs,
}: {
  data: SurgeryCostRow[]
  allRegions: string[]
  allGPOs: string[]
}) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'name' | 'avgCost' | 'range'>('avgCost')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('')
  const isMobile = useMediaQuery('(max-width: 640px)')

  const procedures = useMemo(() => {
    const groups = groupBy(data, (r) => r.procedure_name)
    return [...groups.entries()].map(([name, rows]): ProcedureRow => {
      const medians = rows.map((r) => Number(r.estimated_cost_median))
      const byRegion = groupBy(rows, (r) => r.region)
      const regionCosts = allRegions.map((reg) => {
        const regRows = byRegion.get(reg) || []
        return regRows.length > 0 ? mean(regRows.map((r) => Number(r.estimated_cost_median))) : 0
      })

      return {
        name,
        code: rows[0].procedure_code,
        specialty: rows[0].specialty,
        avgCost: mean(medians),
        costLow: Math.min(...medians),
        costHigh: Math.max(...medians),
        range: Math.max(...medians) - Math.min(...medians),
        regionCosts,
      }
    })
  }, [data, allRegions])

  const specialties = useMemo(() =>
    [...new Set(procedures.map((p) => p.specialty))].sort(),
    [procedures]
  )

  const filtered = useMemo(() => {
    let result = procedures
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      )
    }
    if (specialtyFilter) {
      result = result.filter((p) => p.specialty === specialtyFilter)
    }
    result = [...result].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortField === 'name') return mul * a.name.localeCompare(b.name)
      return mul * (a[sortField] - b[sortField])
    })
    return result
  }, [procedures, search, specialtyFilter, sortField, sortDir])

  const handleSort = (field: 'name' | 'avgCost' | 'range') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const clearAll = () => {
    setSearch('')
    setSpecialtyFilter('')
  }

  return (
    <>
      <Header
        title="Browse every procedure in the warehouse."
        eyebrow="section 04 — procedure explorer"
        lede={`${procedures.length.toLocaleString()} procedures, ${data.length.toLocaleString()} cost observations. Search by name or CPT code, filter by specialty, then tap any row to open its full statistical decomposition.`}
        allRegions={allRegions}
        allGPOs={allGPOs}
      />

      <section className="space-y-6 pb-16 sm:pb-24">
        <Reveal>
          <div className="bezel-outer">
            <div className="bezel-inner p-5 sm:p-6">
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-7">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-4">
                    Search
                  </p>
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Procedure name or CPT code..."
                  />
                </div>
                <div className="col-span-12 md:col-span-5">
                  <Select
                    label="Specialty"
                    placeholder="All specialties"
                    value={specialtyFilter}
                    onChange={setSpecialtyFilter}
                    align="right"
                    options={[
                      { value: '', label: 'All specialties' },
                      ...specialties.map((s) => ({ value: s, label: titleCase(s) })),
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="bezel-outer">
            <div className="bezel-inner overflow-hidden">
              <div className="grid grid-cols-12 items-end gap-3 sm:gap-4 p-5 sm:p-7 pb-4">
                <div className="col-span-12 md:col-span-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                    catalog · sorted by {sortField === 'name' ? 'name' : sortField === 'avgCost' ? 'average cost' : 'range'}
                  </p>
                  <h2 className="mt-2 font-display text-[22px] sm:text-[28px] md:text-[32px] font-medium tracking-[-0.02em] text-ink tnum">
                    {filtered.length.toLocaleString()} procedures
                  </h2>
                </div>
                <div className="col-span-12 md:col-span-4 md:text-right">
                  <p className="font-mono text-[10px] text-ink-4">
                    {isMobile ? 'tap any card →' : 'click any row → analysis'}
                  </p>
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptySearchState
                  search={search}
                  hasSpecialty={!!specialtyFilter}
                  onClear={clearAll}
                />
              ) : isMobile ? (
                <MobileProcedureList
                  procedures={filtered}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                  onSelect={(name) => navigate(`/analysis?procedure=${encodeURIComponent(name)}`)}
                />
              ) : (
                <div className="overflow-x-auto px-2 pb-4">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-ink/[0.08]">
                        <th
                          className="cursor-pointer select-none px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4 transition-colors duration-150 hover:text-ink"
                          onClick={() => handleSort('name')}
                        >
                          Procedure <SortIcon active={sortField === 'name'} dir={sortDir} />
                        </th>
                        <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4">
                          CPT
                        </th>
                        <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4">
                          Specialty
                        </th>
                        <th
                          className="cursor-pointer select-none px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4 transition-colors duration-150 hover:text-ink"
                          onClick={() => handleSort('avgCost')}
                        >
                          Avg cost <SortIcon active={sortField === 'avgCost'} dir={sortDir} />
                        </th>
                        <th
                          className="cursor-pointer select-none px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4 transition-colors duration-150 hover:text-ink"
                          onClick={() => handleSort('range')}
                        >
                          Range <SortIcon active={sortField === 'range'} dir={sortDir} />
                        </th>
                        <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4">
                          By region
                        </th>
                        <th className="w-12 px-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((proc, idx) => (
                        <tr
                          key={proc.name}
                          onClick={() => navigate(`/analysis?procedure=${encodeURIComponent(proc.name)}`)}
                          className="group cursor-pointer border-b border-ink/[0.04] transition-colors duration-150 hover:bg-coral-50/40 dark:hover:bg-coral-900/15"
                        >
                          <td className="max-w-[280px] truncate px-4 py-3 font-medium text-ink">
                            {proc.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-ink-4">
                            {proc.code}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-0.5 text-[11px] text-ink-3">
                              <span className="h-1 w-1 rounded-full bg-coral-500" />
                              {titleCase(proc.specialty)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[12px] font-medium text-ink tnum">
                            {formatCurrencyFull(proc.avgCost)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[12px] text-ink-3 tnum">
                            {formatCurrencyFull(proc.range)}
                          </td>
                          <td className="px-4 py-2 text-center align-middle">
                            <MiniSparkline values={proc.regionCosts} gradientId={`spark-${idx}`} />
                          </td>
                          <td className="px-2 align-middle">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper-2 text-ink-4 opacity-0 transition-all duration-300 group-hover:bg-coral-500 group-hover:text-white group-hover:opacity-100">
                              <ArrowRight weight="bold" className="h-3 w-3" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}

interface MobileListProps {
  procedures: ProcedureRow[]
  sortField: 'name' | 'avgCost' | 'range'
  sortDir: 'asc' | 'desc'
  onSort: (field: 'name' | 'avgCost' | 'range') => void
  onSelect: (name: string) => void
}

function MobileProcedureList({ procedures, sortField, sortDir, onSort, onSelect }: MobileListProps) {
  return (
    <div className="px-4 pb-5">
      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto no-scrollbar px-1">
        {(['avgCost', 'range', 'name'] as const).map((f) => {
          const isActive = sortField === f
          const label = f === 'name' ? 'Name' : f === 'avgCost' ? 'Avg cost' : 'Range'
          return (
            <button
              key={f}
              onClick={() => onSort(f)}
              className={[
                'press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap',
                isActive
                  ? 'bg-ink text-paper'
                  : 'bg-paper-2 text-ink-3 ring-1 ring-ink/[0.06]',
              ].join(' ')}
            >
              {label}
              <SortIcon active={isActive} dir={sortDir} />
            </button>
          )
        })}
      </div>

      <ul className="space-y-2.5">
        {procedures.map((proc, idx) => (
          <li key={proc.name}>
            <button
              onClick={() => onSelect(proc.name)}
              className="press w-full text-left"
            >
              <div className="rounded-2xl bg-paper-2/60 p-4 ring-1 ring-ink/[0.05] transition-colors duration-150 hover:bg-coral-50/60 dark:hover:bg-coral-900/15">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug text-ink line-clamp-2">
                      {proc.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-4">
                      <span className="font-mono">{proc.code}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-coral-500" />
                        {titleCase(proc.specialty)}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-500 text-white">
                    <ArrowRight weight="bold" className="h-3 w-3" />
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-4">
                      avg
                    </p>
                    <p className="font-display text-[18px] font-medium tracking-tight text-ink tnum">
                      {formatCurrencyFull(proc.avgCost)}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-ink-4 tnum">
                      range {formatCurrencyFull(proc.range)}
                    </p>
                  </div>
                  <MiniSparkline values={proc.regionCosts} gradientId={`m-spark-${idx}`} />
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface EmptyProps {
  search: string
  hasSpecialty: boolean
  onClear: () => void
}

function EmptySearchState({ search, hasSpecialty, onClear }: EmptyProps) {
  return (
    <div className="px-5 sm:px-7 pb-10 sm:pb-12 pt-4">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-7">
          <div className="flex items-center gap-2">
            <MagnifyingGlassMinus weight="duotone" className="h-4 w-4 text-coral-500" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
              no matches
            </p>
          </div>
          <h3 className="mt-3 font-display text-[22px] sm:text-[28px] md:text-[32px] leading-tight tracking-tight text-ink">
            {search ? (
              <>Nothing matches &ldquo;<span className="text-coral-600">{search}</span>&rdquo;.</>
            ) : (
              <>This specialty has no procedures in the current filter.</>
            )}
          </h3>
          <p className="mt-4 max-w-md text-[13px] sm:text-[14px] leading-relaxed text-ink-3">
            Try a shorter query, switch the specialty filter, or clear everything to see the
            full catalog.
          </p>
          <button
            onClick={onClear}
            className="press group mt-6 inline-flex items-center gap-3 rounded-full bg-ink pl-5 pr-[6px] py-[6px] text-[13px] font-medium text-paper"
          >
            <span className="leading-none">Clear {hasSpecialty && search ? 'all filters' : hasSpecialty ? 'specialty' : 'search'}</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-coral-500 transition-transform duration-300 group-hover:-rotate-[18deg]">
              <ArrowRight weight="bold" className="h-4 w-4 text-white" />
            </span>
          </button>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="bezel-outer">
            <div className="bezel-inner space-y-2 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                try one of these
              </p>
              {[
                'arthroplasty',
                'laparoscopic',
                'cataract',
                'cardiac catheterization',
              ].map((s) => (
                <p key={s} className="font-mono text-[12px] text-ink-2">
                  &mdash; {s}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
