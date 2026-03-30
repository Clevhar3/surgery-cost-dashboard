import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
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
  // Parse markdown bold (**text**) into React elements safely
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
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

  // Fee breakdown stacked bar
  const feeData = useMemo(() => {
    if (procData.length === 0) return []
    return feeBreakdownByGroup(procData, (r) => compareBy === 'region' ? r.region : r.gpo)
      .map((d) => ({ ...d, name: displayFn(d.name) }))
  }, [procData, compareBy, displayFn])

  // Factor impact tornado
  const tornadoData = useMemo(() => {
    if (procData.length === 0) return []
    return factorDecomposition(procData, compareBy).map((f) => ({
      ...f,
      label: titleCase(f.factor.replace('_fee', '').replace('_cost', '')),
    }))
  }, [procData, compareBy])

  // Box plot data - rendered as grouped bars showing min, Q1, median, Q3, max
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

  // Correlation matrix
  const corrData = useMemo(() => computeCorrelationMatrix(procData.length > 0 ? procData : data), [procData, data])

  const corrLabels = useMemo(() => {
    const labels = new Set<string>()
    corrData.forEach((c) => { labels.add(c.x); labels.add(c.y) })
    return [...labels]
  }, [corrData])

  // Stats cards
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
    <div>
      <Header title="Statistical Analysis" allRegions={allRegions} allGPOs={allGPOs} />
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="card">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Select Procedure
              </label>
              <select
                value={selectedProc}
                onChange={(e) => setSelectedProc(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Choose a procedure...</option>
                {procedures.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border dark:border-border-dark">
              <button
                onClick={() => setCompareBy('region')}
                className={`px-4 py-2 text-sm ${compareBy === 'region' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Across Regions
              </button>
              <button
                onClick={() => setCompareBy('gpo')}
                className={`px-4 py-2 text-sm ${compareBy === 'gpo' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Across GPOs
              </button>
            </div>
          </div>
        </div>

        {!selectedProc ? (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 dark:text-slate-400">Select a procedure above to view detailed statistical analysis</p>
          </div>
        ) : (
          <>
            {/* Narrative Summary */}
            <div className="card border-l-4 border-l-primary-500">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Variance Summary
              </h3>
              <NarrativeText text={narrative} />
            </div>

            {/* Stat Cards */}
            {statsCards && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Mean" value={formatCurrencyFull(statsCards.mean)} />
                <StatCard label="Std Deviation" value={formatCurrencyFull(statsCards.stdDev)} />
                <StatCard label="CV" value={`${statsCards.cv.toFixed(1)}%`} />
                <StatCard label="IQR" value={formatCurrencyFull(statsCards.iqr)} />
                <StatCard label="Range" value={formatCurrencyFull(statsCards.range)} />
                <StatCard label="Observations" value={String(statsCards.count)} />
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fee Breakdown Stacked Bar */}
              <div className="card">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                  Cost Breakdown by {compareBy === 'region' ? 'Region' : 'GPO'}
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={feeData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tick={{ fill: '#64748B' }} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => [formatCurrencyFull(Number(value)), titleCase(String(name).replace('_', ' '))]}
                    />
                    <Legend formatter={(v) => titleCase(v.replace('_', ' '))} />
                    {Object.entries(FEE_COLORS).map(([key, color]) => (
                      <Bar key={key} dataKey={key} stackId="fees" fill={color} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Factor Impact Tornado */}
              <div className="card">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                  Factor Impact (Variance Contribution)
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={tornadoData}
                    layout="vertical"
                    margin={{ left: 100, right: 30, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCurrency} fontSize={12} />
                    <YAxis type="category" dataKey="label" width={95} fontSize={12} tick={{ fill: '#64748B' }} />
                    <Tooltip formatter={(v) => [formatCurrencyFull(Number(v)), 'Impact']} />
                    <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                      {tornadoData.map((_, i) => (
                        <Cell key={i} fill={Object.values(FEE_COLORS)[i] || CHART_COLORS.muted} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Box Plot as range bars */}
              <div className="card">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                  Cost Distribution by {compareBy === 'region' ? 'Region' : 'GPO'}
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={boxData} margin={{ left: 10, right: 10, top: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tick={{ fill: '#64748B' }} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <Tooltip formatter={(value, name) => [formatCurrencyFull(Number(value)), String(name)]} />
                    <Legend />
                    <Bar dataKey="min" name="Min" fill="#94A3B8" maxBarSize={30} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="q1" name="Q1 (25th)" fill="#93C5FD" maxBarSize={30} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="median" name="Median" fill={CHART_COLORS.primary} maxBarSize={30} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="q3" name="Q3 (75th)" fill="#1D4ED8" maxBarSize={30} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="max" name="Max" fill="#1E3A8A" maxBarSize={30} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Correlation Heatmap */}
              <div className="card">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                  Correlation Matrix
                </h2>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr>
                        <th className="p-1"></th>
                        {corrLabels.map((l) => (
                          <th key={l} className="p-1 text-slate-500 font-medium text-center whitespace-nowrap" style={{ writingMode: 'vertical-rl', maxHeight: '80px' }}>
                            {l}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {corrLabels.map((row) => (
                        <tr key={row}>
                          <td className="p-1 text-slate-500 font-medium whitespace-nowrap text-right pr-2">{row}</td>
                          {corrLabels.map((col) => {
                            const pair = corrData.find((c) => c.x === row && c.y === col)
                            const r = pair?.r ?? 0
                            const absR = Math.abs(r)
                            const bg = r > 0
                              ? `rgba(37, 99, 235, ${absR * 0.7})`
                              : `rgba(220, 38, 38, ${absR * 0.7})`
                            const textColor = absR > 0.5 ? 'white' : undefined
                            return (
                              <td
                                key={col}
                                className="p-1 text-center tabular-nums"
                                style={{ backgroundColor: bg, color: textColor, minWidth: '36px' }}
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
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
