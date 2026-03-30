import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
import { computeGPOBySpecialty, getUniqueValues } from '../lib/transforms'
import { mean, stddev } from '../lib/statistics'
import { formatCurrency, formatCurrencyFull, gpoDisplayName, titleCase } from '../lib/formatters'
import { GPO_COLORS } from '../lib/colors'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg shadow-lg px-3 py-2 text-sm max-w-xs">
      <p className="font-medium text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-600 dark:text-slate-300">
            {gpoDisplayName(p.dataKey)}: {formatCurrencyFull(p.value)}
          </span>
        </div>
      ))}
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

  const chartData = useMemo(() => {
    const raw = computeGPOBySpecialty(data, localGPOs)
    if (mode === 'absolute') {
      return raw.map((row) => ({
        ...row,
        specialty: titleCase(row.specialty as string),
      }))
    }
    // Relative mode: % difference from overall average per specialty
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

  // Comparison table data
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
    <div>
      <Header title="GPO Comparison" allRegions={allRegions} allGPOs={allGPOs} />
      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="card">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {allGPOs.map((gpo) => (
                <button
                  key={gpo}
                  onClick={() => toggleGPO(gpo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    localGPOs.includes(gpo)
                      ? 'border-transparent text-white'
                      : 'border-border dark:border-border-dark text-slate-400 bg-slate-50 dark:bg-slate-800'
                  }`}
                  style={localGPOs.includes(gpo) ? { backgroundColor: GPO_COLORS[gpo] } : {}}
                >
                  {gpoDisplayName(gpo)}
                </button>
              ))}
            </div>
            <div className="ml-auto flex rounded-lg overflow-hidden border border-border dark:border-border-dark">
              <button
                onClick={() => setMode('absolute')}
                className={`px-3 py-1.5 text-sm ${mode === 'absolute' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                $ Absolute
              </button>
              <button
                onClick={() => setMode('relative')}
                className={`px-3 py-1.5 text-sm ${mode === 'relative' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                % Relative
              </button>
            </div>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            {mode === 'absolute' ? 'Average Median Cost' : '% Deviation from Specialty Average'} by Specialty & GPO
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={chartData} margin={{ left: 20, right: 20, top: 5, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="specialty"
                fontSize={11}
                tick={{ fill: '#64748B' }}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickFormatter={mode === 'absolute' ? formatCurrency : (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                fontSize={12}
              />
              <Tooltip content={mode === 'absolute' ? <CustomTooltip /> : undefined} />
              <Legend
                formatter={(value) => gpoDisplayName(value)}
                wrapperStyle={{ paddingTop: 10 }}
              />
              {localGPOs.map((gpo) => (
                <Bar
                  key={gpo}
                  dataKey={gpo}
                  fill={GPO_COLORS[gpo]}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={20}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div className="card overflow-x-auto">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Detailed Comparison Table
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-slate-400">Specialty</th>
                {allGPOs.map((gpo) => (
                  <th key={gpo} className="text-right py-3 px-3 font-medium" style={{ color: GPO_COLORS[gpo] }}>
                    {gpoDisplayName(gpo)}
                  </th>
                ))}
                <th className="text-right py-3 px-3 font-medium text-slate-500 dark:text-slate-400">Range</th>
                <th className="text-right py-3 px-3 font-medium text-slate-500 dark:text-slate-400">Std Dev</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => {
                const minAvg = Math.min(...row.gpoStats.map((g) => g.avg))
                const maxAvg = Math.max(...row.gpoStats.map((g) => g.avg))
                return (
                  <tr key={row.specialty} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{titleCase(row.specialty)}</td>
                    {row.gpoStats.map((gs) => (
                      <td
                        key={gs.gpo}
                        className={`py-2.5 px-3 text-right tabular-nums ${
                          gs.avg === minAvg ? 'text-green-600 dark:text-green-400 font-medium' :
                          gs.avg === maxAvg ? 'text-red-600 dark:text-red-400 font-medium' :
                          'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {formatCurrencyFull(gs.avg)}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {formatCurrencyFull(row.range)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
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
  )
}
