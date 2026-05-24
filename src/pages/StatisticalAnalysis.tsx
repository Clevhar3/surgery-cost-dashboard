import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { ChartBar, Sparkle, Equals } from '@phosphor-icons/react'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
import { Reveal } from '../components/ui/Reveal'
import { Select } from '../components/ui/Select'
import { Segmented } from '../components/ui/Button'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  mean, stddev, coefficientOfVariation, boxPlotStats,
  computeCorrelationMatrix, factorDecomposition,
} from '../lib/statistics'
import { feeBreakdownByGroup, groupBy, getUniqueValues } from '../lib/transforms'
import { generateVarianceNarrative } from '../lib/narratives'
import {
  formatCurrency, formatCurrencyFull,
  titleCase, regionDisplayName, gpoDisplayName,
} from '../lib/formatters'
import { FEE_COLORS, CHART_COLORS } from '../lib/colors'

function NarrativeText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <p className="text-[14px] sm:text-[15px] leading-relaxed text-ink-2 text-pretty">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </p>
  )
}

export function StatisticalAnalysis({
  data,
  allRegions,
  allGPOs,
}: {
  data: SurgeryCostRow[]
  allRegions: string[]
  allGPOs: string[]
}) {
  const [searchParams] = useSearchParams()
  const [selectedProc, setSelectedProc] = useState<string>(searchParams.get('procedure') || '')
  const [compareBy, setCompareBy] = useState<'region' | 'gpo'>('region')
  const isMobile = useMediaQuery('(max-width: 640px)')

  const procedures = useMemo(() => getUniqueValues(data, 'procedure_name'), [data])

  useEffect(() => {
    const p = searchParams.get('procedure')
    if (p) setSelectedProc(p)
  }, [searchParams])

  const procData = useMemo(
    () => selectedProc ? data.filter((d) => d.procedure_name === selectedProc) : [],
    [data, selectedProc]
  )

  const displayFn = compareBy === 'region' ? regionDisplayName : gpoDisplayName

  const feeData = useMemo(() => {
    if (procData.length === 0) return []
    return feeBreakdownByGroup(procData, (r) => compareBy === 'region' ? r.region : r.gpo)
      .map((d) => ({ ...d, name: displayFn(d.name) }))
  }, [procData, compareBy, displayFn])

  const tornadoData = useMemo(() => {
    if (procData.length === 0) return []
    return factorDecomposition(procData, compareBy).map((f) => ({
      ...f,
      label: titleCase(f.factor.replace('_fee', '').replace('_cost', '')),
    }))
  }, [procData, compareBy])

  const boxData = useMemo(() => {
    if (procData.length === 0) return []
    const groups = groupBy(procData, (r) => compareBy === 'region' ? r.region : r.gpo)
    return [...groups.entries()].map(([name, rows]) => {
      const stats = boxPlotStats(displayFn(name), rows.map((r) => Number(r.estimated_cost_median)))
      return {
        name: stats.name,
        min: stats.min,
        q1: stats.q1,
        median: stats.median,
        q3: stats.q3,
        max: stats.max,
      }
    })
  }, [procData, compareBy, displayFn])

  const corrData = useMemo(() => computeCorrelationMatrix(procData.length > 0 ? procData : data), [procData, data])

  const corrLabels = useMemo(() => {
    const labels = new Set<string>()
    corrData.forEach((c) => { labels.add(c.x); labels.add(c.y) })
    return [...labels]
  }, [corrData])

  const medians = useMemo(() => procData.map((d) => Number(d.estimated_cost_median)), [procData])
  const statsCards = useMemo(() => {
    if (medians.length === 0) return null
    const sorted = [...medians].sort((a, b) => a - b)
    return {
      mean: mean(medians),
      stdDev: stddev(medians),
      cv: coefficientOfVariation(medians),
      iqr: sorted[Math.floor(sorted.length * 0.75)] - sorted[Math.floor(sorted.length * 0.25)],
      range: sorted[sorted.length - 1] - sorted[0],
      count: medians.length,
    }
  }, [medians])

  const narrative = useMemo(
    () => generateVarianceNarrative(procData, compareBy),
    [procData, compareBy]
  )

  return (
    <>
      <Header
        title={selectedProc ? selectedProc.toLowerCase() : 'Decompose any procedure into its drivers.'}
        eyebrow="section 03 — statistical analysis"
        lede={selectedProc
          ? `Cost decomposition across ${compareBy === 'region' ? 'regions' : 'GPOs'} for the selected procedure. Pulls fee-level breakdowns, variance drivers, distribution shape, and a correlation matrix.`
          : 'Pick a procedure to see what actually drives its cost — fee category, geography, contracting partner — instead of relying on a single sticker price.'}
        allRegions={allRegions}
        allGPOs={allGPOs}
      />

      <section className="space-y-6 sm:space-y-8 pb-16 sm:pb-24">
        <Reveal>
          <div className="bezel-outer">
            <div className="bezel-inner p-5 sm:p-6">
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-7">
                  <Select
                    label="Procedure"
                    placeholder="Choose a procedure to analyze..."
                    searchable
                    value={selectedProc}
                    onChange={setSelectedProc}
                    options={procedures.map((p) => ({ value: p, label: p }))}
                  />
                </div>
                <div className="col-span-12 md:col-span-5 md:flex md:justify-end">
                  <div>
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-4">
                      Compare across
                    </p>
                    <Segmented
                      options={[
                        { value: 'region', label: 'Regions' },
                        { value: 'gpo', label: 'GPOs' },
                      ]}
                      value={compareBy}
                      onChange={(v) => setCompareBy(v as 'region' | 'gpo')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {!selectedProc ? (
          <EmptyAnalysisState />
        ) : (
          <>
            <Reveal delay={1}>
              <div className="bezel-outer">
                <div className="bezel-inner relative overflow-hidden p-6 sm:p-8 md:p-10">
                  <div
                    aria-hidden
                    className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-coral-100/70 dark:bg-coral-900/30 blur-3xl"
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Sparkle weight="duotone" className="h-4 w-4 text-coral-500" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                        variance summary
                      </p>
                    </div>
                    <div className="mt-4 max-w-3xl">
                      <NarrativeText text={narrative} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {statsCards && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <StatCard delay={1} label="Mean" value={formatCurrencyFull(statsCards.mean)} />
                <StatCard delay={2} label="Std dev" value={formatCurrencyFull(statsCards.stdDev)} />
                <StatCard delay={3} label="CV" value={`${statsCards.cv.toFixed(1)}%`} />
                <StatCard delay={4} label="IQR" value={formatCurrencyFull(statsCards.iqr)} />
                <StatCard delay={5} label="Range" value={formatCurrencyFull(statsCards.range)} />
                <StatCard delay={6} label="Observations" value={String(statsCards.count)} />
              </div>
            )}

            <div className="grid grid-cols-12 gap-4 sm:gap-6">
              <Reveal className="col-span-12 lg:col-span-6" delay={1}>
                <ChartCard
                  eyebrow={`fee-level · by ${compareBy === 'region' ? 'region' : 'GPO'}`}
                  title="Cost composition"
                  height={isMobile ? 300 : 360}
                >
                  <BarChart data={feeData} margin={{ left: isMobile ? -10 : 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'var(--color-tint-coral)' }}
                      formatter={(value, name) => [formatCurrencyFull(Number(value)), titleCase(String(name).replace('_', ' '))]}
                    />
                    <Legend formatter={(v) => titleCase(v.replace('_', ' '))} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    {Object.entries(FEE_COLORS).map(([key, color], i, arr) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="fees"
                        fill={color}
                        radius={i === arr.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ChartCard>
              </Reveal>

              <Reveal className="col-span-12 lg:col-span-6" delay={2}>
                <ChartCard
                  eyebrow="variance attribution"
                  title="What drives the spread"
                  height={isMobile ? 300 : 360}
                >
                  <BarChart
                    data={tornadoData}
                    layout="vertical"
                    margin={{ left: isMobile ? 80 : 120, right: isMobile ? 16 : 32, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" width={isMobile ? 76 : 115} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'var(--color-tint-coral)' }}
                      formatter={(v) => [formatCurrencyFull(Number(v)), 'Impact']}
                    />
                    <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
                      {tornadoData.map((_, i) => (
                        <Cell key={i} fill={Object.values(FEE_COLORS)[i] || CHART_COLORS.muted} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartCard>
              </Reveal>

              <Reveal className="col-span-12 lg:col-span-6" delay={1}>
                <ChartCard
                  eyebrow={`distribution · by ${compareBy === 'region' ? 'region' : 'GPO'}`}
                  title="Cost distribution"
                  height={isMobile ? 300 : 360}
                >
                  <BarChart data={boxData} margin={{ left: isMobile ? -10 : 8, right: 8, top: 20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'var(--color-tint-coral)' }}
                      formatter={(value, name) => [formatCurrencyFull(Number(value)), String(name)]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Bar dataKey="min" name="min" fill="#B8B3A4" maxBarSize={26} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="q1" name="Q1" fill="#FFA688" maxBarSize={26} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="median" name="median" fill={CHART_COLORS.primary} maxBarSize={26} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="q3" name="Q3" fill="#B22F1F" maxBarSize={26} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="max" name="max" fill="#5E1810" maxBarSize={26} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ChartCard>
              </Reveal>

              <Reveal className="col-span-12 lg:col-span-6" delay={2}>
                <div className="bezel-outer h-full">
                  <div className="bezel-inner p-5 sm:p-7 h-full">
                    <div className="mb-5 sm:mb-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                        pairwise · pearson
                      </p>
                      <h3 className="mt-2 font-display text-[18px] sm:text-[22px] font-medium tracking-tight text-ink">
                        Correlation matrix
                      </h3>
                    </div>
                    <div className="overflow-x-auto -mx-2 px-2 no-scrollbar">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr>
                            <th className="p-1"></th>
                            {corrLabels.map((l) => (
                              <th
                                key={l}
                                className="p-1 text-center font-mono font-medium text-ink-4"
                                style={{ writingMode: 'vertical-rl', maxHeight: '90px' }}
                              >
                                {l}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {corrLabels.map((row) => (
                            <tr key={row}>
                              <td className="whitespace-nowrap p-1 pr-3 text-right font-mono text-[10px] text-ink-4">
                                {row}
                              </td>
                              {corrLabels.map((col) => {
                                const pair = corrData.find((c) => c.x === row && c.y === col)
                                const r = pair?.r ?? 0
                                const absR = Math.abs(r)
                                const bg = r > 0
                                  ? `rgba(244, 93, 72, ${absR * 0.85})`
                                  : `rgba(123, 139, 150, ${absR * 0.85})`
                                const textColor = absR > 0.5 ? '#FCFBF8' : 'inherit'
                                return (
                                  <td
                                    key={col}
                                    className="p-1 text-center tnum font-mono text-[10px] text-ink-2"
                                    style={{ backgroundColor: bg, color: textColor, minWidth: '38px', borderRadius: 4 }}
                                    title={`${row} vs ${col}: r=${r.toFixed(3)}`}
                                  >
                                    {r.toFixed(2)}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </>
        )}
      </section>
    </>
  )
}

interface StatCardProps {
  label: string
  value: string
  delay: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

function StatCard({ label, value, delay }: StatCardProps) {
  return (
    <Reveal delay={delay}>
      <div className="bezel-outer h-full">
        <div className="bezel-inner flex flex-col gap-2 p-4 sm:p-5 h-full">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
            {label}
          </span>
          <span className="font-display text-[18px] sm:text-[22px] font-medium tracking-tight text-ink tnum">
            {value}
          </span>
        </div>
      </div>
    </Reveal>
  )
}

interface ChartCardProps {
  eyebrow: string
  title: string
  height: number
  children: React.ReactElement
}

function ChartCard({ eyebrow, title, height, children }: ChartCardProps) {
  return (
    <div className="bezel-outer h-full">
      <div className="bezel-inner p-5 sm:p-7 h-full">
        <div className="mb-5 sm:mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
            {eyebrow}
          </p>
          <h3 className="mt-2 font-display text-[18px] sm:text-[22px] font-medium tracking-tight text-ink">
            {title}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function EmptyAnalysisState() {
  return (
    <Reveal delay={1}>
      <div className="bezel-outer">
        <div className="bezel-inner relative overflow-hidden p-6 sm:p-10 md:p-14">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-coral-100/60 dark:bg-coral-900/25 blur-3xl"
          />
          <div className="relative grid grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center gap-2">
                <Equals weight="bold" className="h-4 w-4 text-coral-500" />
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                  getting started
                </p>
              </div>
              <h2 className="mt-4 sm:mt-5 font-display text-[28px] sm:text-[36px] md:text-[44px] leading-[0.96] tracking-[-0.03em] text-ink text-balance">
                Pick a procedure to begin the decomposition.
              </h2>
              <p className="mt-4 sm:mt-5 max-w-md text-[13px] sm:text-[14px] leading-relaxed text-ink-3">
                Once selected, this page will show six summary statistics, a fee-level cost
                composition, a tornado of variance drivers, the distribution shape across
                groups, and a Pearson correlation matrix.
              </p>
              <ul className="mt-5 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Total knee arthroplasty',
                  'Carpal tunnel release',
                  'Laparoscopic cholecystectomy',
                  'Cataract surgery',
                ].map((p) => (
                  <li key={p} className="flex items-center gap-2 font-mono text-[11px] text-ink-3">
                    <span className="h-1 w-1 rounded-full bg-coral-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-12 md:col-span-5">
              <div className="grid grid-cols-2 gap-3 opacity-70">
                {[
                  { l: 'mean', v: '$—' },
                  { l: 'std dev', v: '$—' },
                  { l: 'CV', v: '—%' },
                  { l: 'IQR', v: '$—' },
                ].map((s, i) => (
                  <div key={s.l} className="bezel-outer pulse-soft" style={{ animationDelay: `${i * 200}ms` }}>
                    <div className="bezel-inner p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-4">{s.l}</p>
                      <p className="mt-2 font-display text-[20px] font-medium tracking-tight text-ink-5 tnum">
                        {s.v}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 bezel-outer pulse-soft" style={{ animationDelay: '800ms' }}>
                <div className="bezel-inner flex items-center gap-3 p-4">
                  <ChartBar weight="duotone" className="h-5 w-5 text-coral-500" />
                  <p className="font-mono text-[11px] text-ink-3">
                    Four charts will materialize here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
