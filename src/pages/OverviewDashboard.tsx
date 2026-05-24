import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
import { KPICard } from '../components/charts/KPICard'
import { Reveal } from '../components/ui/Reveal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { avgCostByGroup, topProcedures, getUniqueValues } from '../lib/transforms'
import { mean } from '../lib/statistics'
import { formatCurrency, formatCurrencyFull, titleCase, regionDisplayName } from '../lib/formatters'
import { REGION_COLORS, CHART_COLORS } from '../lib/colors'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl bg-paper px-4 py-3 ring-1 ring-ink/10 shadow-[var(--shadow-float-md)]">
      <p className="mb-1 font-display text-[13px] font-medium tracking-tight text-ink">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-mono text-[12px] text-ink-3 tnum">
          {p.name}: <span className="text-ink">{formatCurrencyFull(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function OverviewDashboard({
  data,
  allRegions,
  allGPOs,
}: {
  data: SurgeryCostRow[]
  allRegions: string[]
  allGPOs: string[]
}) {
  const isMobile = useMediaQuery('(max-width: 640px)')

  const specialtyData = useMemo(() => avgCostByGroup(data, (r) => titleCase(r.specialty)), [data])
  const regionData = useMemo(() =>
    avgCostByGroup(data, (r) => r.region).map((d) => ({
      ...d,
      displayName: regionDisplayName(d.name),
      costIndex: data.find((r) => r.region === d.name)?.region_cost_index ?? 1,
    })),
    [data]
  )
  const top10 = useMemo(() => topProcedures(data, 10), [data])

  const uniqueProcedures = useMemo(() => getUniqueValues(data, 'procedure_name'), [data])
  const avgMedian = useMemo(() => mean(data.map((d) => Number(d.estimated_cost_median))), [data])
  const highestSpecialty = specialtyData[0]
  const lowestRegion = regionData[regionData.length - 1]
  const highestRegion = regionData[0]
  const spread = highestRegion && lowestRegion
    ? ((highestRegion.avgCostMedian - lowestRegion.avgCostMedian) / lowestRegion.avgCostMedian) * 100
    : 0

  const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
  const top10Mobile = useMemo(
    () => top10.map((p) => ({ ...p, name: truncate(p.name, 22) })),
    [top10]
  )
  const specialtyMobile = useMemo(
    () => specialtyData.map((p) => ({ ...p, name: truncate(p.name, 14) })),
    [specialtyData]
  )

  return (
    <>
      <Header
        title="A national atlas of surgical cost variance."
        eyebrow="section 01 — overview"
        lede="A snapshot across specialties, regions, and group purchasing organizations. Every figure on this page derives from the live cost warehouse — no static assumptions."
        allRegions={allRegions}
        allGPOs={allGPOs}
      />

      <section className="space-y-6 sm:space-y-8 lg:space-y-10 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <KPICard
            label="Procedures tracked"
            value={String(uniqueProcedures.length)}
            numeric={uniqueProcedures.length}
            numericFormat={(n) => Math.round(n).toLocaleString()}
            sublabel={`${data.length.toLocaleString()} cost observations`}
            tone="ink"
            code="01"
            delay={1}
          />
          <KPICard
            label="Median cost, all procedures"
            value={formatCurrency(avgMedian)}
            numeric={avgMedian}
            numericFormat={(n) => formatCurrencyFull(n)}
            sublabel="Averaged across every region and GPO"
            tone="coral"
            code="02"
            delay={2}
          />
          <KPICard
            label="Highest-cost specialty"
            value={highestSpecialty?.name || '—'}
            sublabel={highestSpecialty ? formatCurrencyFull(highestSpecialty.avgCostMedian) : ''}
            tone="ochre"
            code="03"
            delay={3}
          />
          <KPICard
            label="Lowest-cost region"
            value={lowestRegion?.displayName || '—'}
            sublabel={lowestRegion ? `${formatCurrencyFull(lowestRegion.avgCostMedian)} · ${spread.toFixed(0)}% below peak` : ''}
            tone="olive"
            code="04"
            delay={4}
          />
        </div>

        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <Reveal className="col-span-12 lg:col-span-7" delay={2}>
            <div className="bezel-outer h-full">
              <div className="bezel-inner p-5 sm:p-7 h-full">
                <div className="mb-5 sm:mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                      figure 1 — by specialty
                    </p>
                    <h2 className="mt-2 font-display text-[18px] sm:text-[22px] font-medium tracking-tight text-ink">
                      Average median cost
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] text-ink-4">
                    {specialtyData.length} specialties
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 340 : 420}>
                  <BarChart
                    data={isMobile ? specialtyMobile : specialtyData}
                    layout="vertical"
                    margin={{ left: isMobile ? 92 : 130, right: isMobile ? 12 : 24, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={isMobile ? 88 : 125} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--color-tint-coral)' }} content={<CustomTooltip />} />
                    <Bar dataKey="avgCostMedian" name="Median cost" fill={CHART_COLORS.primary} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-5" delay={3}>
            <div className="bezel-outer h-full">
              <div className="bezel-inner p-5 sm:p-7 h-full">
                <div className="mb-5 sm:mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                      figure 2 — by geography
                    </p>
                    <h2 className="mt-2 font-display text-[18px] sm:text-[22px] font-medium tracking-tight text-ink">
                      Regional comparison
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] text-ink-4">
                    {regionData.length} regions
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 280 : 420}>
                  <BarChart
                    data={regionData}
                    margin={{ left: isMobile ? -8 : 8, right: isMobile ? 8 : 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="displayName"
                      tickFormatter={(v: string) => (isMobile ? v.split(' ')[0] : v)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--color-tint-coral)' }} content={<CustomTooltip />} />
                    <Bar dataKey="avgCostMedian" name="Median cost" radius={[8, 8, 0, 0]}>
                      {regionData.map((entry) => (
                        <Cell key={entry.name} fill={REGION_COLORS[entry.name] || CHART_COLORS.muted} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {regionData.map((r) => (
                    <div key={r.name} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: REGION_COLORS[r.name] || CHART_COLORS.muted }}
                      />
                      <span className="font-mono text-[10px] text-ink-3 truncate">
                        {r.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={2}>
          <div className="bezel-outer">
            <div className="bezel-inner p-5 sm:p-7">
              <div className="mb-5 sm:mb-7 grid grid-cols-12 items-end gap-3 sm:gap-4">
                <div className="col-span-12 md:col-span-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-4">
                    figure 3 — top of the spectrum
                  </p>
                  <h2 className="mt-2 font-display text-[22px] sm:text-[28px] md:text-[32px] font-medium tracking-[-0.02em] text-ink">
                    Ten most expensive procedures.
                  </h2>
                </div>
                <div className="col-span-12 md:col-span-4 md:text-right">
                  <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 rounded-full bg-paper-2 px-3 sm:px-4 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-coral-200" />
                      <span className="font-mono text-[10px] text-ink-3">low</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-coral-500" />
                      <span className="font-mono text-[10px] text-ink-3">median</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-coral-800" />
                      <span className="font-mono text-[10px] text-ink-3">high</span>
                    </span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={isMobile ? 440 : 460}>
                <BarChart
                  data={isMobile ? top10Mobile : top10}
                  layout="vertical"
                  margin={{ left: isMobile ? 140 : 200, right: isMobile ? 12 : 32, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="2 4" horizontal={false} />
                  <XAxis type="number" tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={isMobile ? 135 : 195} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--color-tint-coral)' }} content={<CustomTooltip />} />
                  <Bar dataKey="avgCostLow" name="Low" fill="#FFC8B2" stackId="range" />
                  <Bar dataKey="avgCostMedian" name="Median" fill={CHART_COLORS.primary} />
                  <Bar dataKey="avgCostHigh" name="High" fill="#8A2417" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
