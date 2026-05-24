import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
import { Reveal } from '../components/ui/Reveal'
import { Pill, Segmented } from '../components/ui/Button'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { computeGPOBySpecialty, getUniqueValues } from '../lib/transforms'
import { mean, stddev } from '../lib/statistics'
import { formatCurrency, formatCurrencyFull, gpoDisplayName, titleCase } from '../lib/formatters'
import { GPO_COLORS } from '../lib/colors'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl bg-paper px-4 py-3 ring-1 ring-ink/10 shadow-[var(--shadow-float-md)] max-w-xs">
      <p className="mb-2 font-display text-[13px] font-medium tracking-tight text-ink">{label}</p>
      <div className="space-y-1">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="font-mono text-[12px] text-ink-3 tnum">
              {gpoDisplayName(p.dataKey)}: <span className="text-ink">{formatCurrencyFull(p.value)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GPOComparison({
  data,
  allRegions,
  allGPOs,
}: {
  data: SurgeryCostRow[]
  allRegions: string[]
  allGPOs: string[]
}) {
  const [localGPOs, setLocalGPOs] = useState<string[]>(allGPOs)
  const [mode, setMode] = useState<'absolute' | 'relative'>('absolute')
  const isMobile = useMediaQuery('(max-width: 640px)')

  const chartData = useMemo(() => {
    const raw = computeGPOBySpecialty(data, localGPOs)
    if (mode === 'absolute') {
      return raw.map((row) => ({
        ...row,
        specialty: titleCase(row.specialty as string),
      }))
    }
    return raw.map((row) => {
      const vals = localGPOs.map((g) => Number(row[g]) || 0).filter((v) => v > 0)
      const avg = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 1
      const relative: Record<string, number | string> = { specialty: titleCase(row.specialty as string) }
      for (const g of localGPOs) {
        const v = Number(row[g]) || 0
        relative[g] = v > 0 ? ((v - avg) / avg) * 100 : 0
      }
      return relative
    })
  }, [data, localGPOs, mode])

  const toggleGPO = (gpo: string) => {
    setLocalGPOs((prev) =>
      prev.includes(gpo) ? prev.filter((g) => g !== gpo) : [...prev, gpo]
    )
  }

  const tableData = useMemo(() => {
    const specialties = getUniqueValues(data, 'specialty')
    return specialties.map((spec) => {
      const rows = data.filter((d) => d.specialty === spec)
      const gpoStats = allGPOs.map((gpo) => {
        const gpoRows = rows.filter((r) => r.gpo === gpo)
        const medians = gpoRows.map((r) => Number(r.estimated_cost_median))
        return {
          gpo,
          avg: mean(medians),
          stdDev: stddev(medians),
        }
      })
      const allMedians = rows.map((r) => Number(r.estimated_cost_median))
      return {
        specialty: spec,
        gpoStats,
        overallAvg: mean(allMedians),
        range: Math.max(...allMedians) - Math.min(...allMedians),
      }
    }).sort((a, b) => b.overallAvg - a.overallAvg)
  }, [data, allGPOs])

  return (
    <>
      <Header
        title="How each GPO prices the same procedure."
        eyebrow="section 02 — GPO comparison"
        lede="Side-by-side cost contracts across six group purchasing organizations. Toggle any combination, then pivot between absolute dollars and deviation from the specialty average."
        allRegions={allRegions}
        allGPOs={allGPOs}
      />

      <section className="space-y-6 sm:space-y-8 pb-16 sm:pb-24">
        <Reveal>
          <div className="bezel-outer">
            <div className="bezel-inner p-5 sm:p-6">
              <div className="space-y-4 md:flex md:flex-wrap md:items-center md:gap-4 md:space-y-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                  pick GPOs
                </p>
                <div className="-mx-5 sm:mx-0 overflow-x-auto no-scrollbar">
                  <div className="flex w-max gap-2 px-5 sm:px-0 sm:w-auto sm:flex-wrap">
                    {allGPOs.map((gpo) => (
                      <Pill
                        key={gpo}
                        active={localGPOs.includes(gpo)}
                        swatch={GPO_COLORS[gpo]}
                        onClick={() => toggleGPO(gpo)}
                      >
                        {gpoDisplayName(gpo)}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 md:ml-auto">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                    view
                  </p>
                  <Segmented
                    options={[
                      { value: 'absolute', label: '$ absolute' },
                      { value: 'relative', label: '% relative' },
                    ]}
                    value={mode}
                    onChange={(v) => setMode(v as 'absolute' | 'relative')}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="bezel-outer">
            <div className="bezel-inner p-5 sm:p-7">
              <div className="mb-5 sm:mb-6 grid grid-cols-12 items-end gap-3 sm:gap-4">
                <div className="col-span-12 md:col-span-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                    figure 1 — cost by specialty &times; GPO
                  </p>
                  <h2 className="mt-2 font-display text-[20px] sm:text-[24px] md:text-[28px] font-medium tracking-[-0.02em] text-ink">
                    {mode === 'absolute'
                      ? 'Average median cost'
                      : 'Deviation from specialty mean'}
                  </h2>
                </div>
                <div className="col-span-12 md:col-span-4 md:text-right">
                  <p className="font-mono text-[10px] text-ink-4">
                    {localGPOs.length} of {allGPOs.length} GPOs shown
                  </p>
                </div>
              </div>
              <div className={isMobile ? '-mx-3 overflow-x-auto no-scrollbar' : ''}>
                <div style={isMobile ? { minWidth: 640 } : undefined}>
                  <ResponsiveContainer width="100%" height={isMobile ? 420 : 520}>
                    <BarChart
                      data={chartData}
                      margin={{ left: isMobile ? 0 : 16, right: isMobile ? 12 : 24, top: 8, bottom: isMobile ? 70 : 90 }}
                    >
                      <CartesianGrid strokeDasharray="2 4" vertical={false} />
                      <XAxis
                        dataKey="specialty"
                        angle={-32}
                        textAnchor="end"
                        height={isMobile ? 70 : 90}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={mode === 'absolute' ? formatCurrency : (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--color-tint-coral)' }}
                        content={mode === 'absolute' ? <CustomTooltip /> : undefined}
                      />
                      <Legend
                        formatter={(value) => gpoDisplayName(value)}
                        wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                        iconType="circle"
                      />
                      {localGPOs.map((gpo) => (
                        <Bar
                          key={gpo}
                          dataKey={gpo}
                          fill={GPO_COLORS[gpo]}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={22}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={2}>
          <div className="bezel-outer">
            <div className="bezel-inner overflow-hidden">
              <div className="p-5 sm:p-7 pb-4">
                <div className="grid grid-cols-12 items-end gap-3 sm:gap-4">
                  <div className="col-span-12 md:col-span-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                      table 1 — full ledger
                    </p>
                    <h2 className="mt-2 font-display text-[20px] sm:text-[24px] md:text-[28px] font-medium tracking-[-0.02em] text-ink">
                      Specialty-level breakdown.
                    </h2>
                  </div>
                  <div className="col-span-12 md:col-span-4 md:text-right">
                    <p className="font-mono text-[10px] text-ink-4">
                      green = lowest · coral = highest, per row
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto px-2 pb-4">
                <table className="w-full min-w-[640px] text-[13px]">
                  <thead>
                    <tr className="border-b border-ink/[0.08]">
                      <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4">
                        Specialty
                      </th>
                      {allGPOs.map((gpo) => (
                        <th
                          key={gpo}
                          className="px-3 py-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] font-medium"
                          style={{ color: GPO_COLORS[gpo] }}
                        >
                          {gpoDisplayName(gpo)}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4">
                        Range
                      </th>
                      <th className="px-3 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-ink-4">
                        Std dev
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => {
                      const minAvg = Math.min(...row.gpoStats.map((g) => g.avg))
                      const maxAvg = Math.max(...row.gpoStats.map((g) => g.avg))
                      return (
                        <tr
                          key={row.specialty}
                          className="border-b border-ink/[0.04] transition-colors duration-150 hover:bg-paper-2/50"
                        >
                          <td className="px-4 py-3 font-medium text-ink">
                            {titleCase(row.specialty)}
                          </td>
                          {row.gpoStats.map((gs) => (
                            <td
                              key={gs.gpo}
                              className={[
                                'px-3 py-3 text-right tnum font-mono text-[12px]',
                                gs.avg === minAvg ? 'text-[#3A5C36] font-semibold' :
                                gs.avg === maxAvg ? 'text-coral-700 font-semibold' :
                                'text-ink-2',
                              ].join(' ')}
                            >
                              {formatCurrencyFull(gs.avg)}
                            </td>
                          ))}
                          <td className="px-3 py-3 text-right font-mono text-[12px] text-ink-3 tnum">
                            {formatCurrencyFull(row.range)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-[12px] text-ink-3 tnum">
                            {formatCurrencyFull(row.gpoStats.reduce((s, g) => s + g.stdDev, 0) / row.gpoStats.length)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
