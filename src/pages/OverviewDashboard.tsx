import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
import { KPICard } from '../components/charts/KPICard'
import { avgCostByGroup, topProcedures, getUniqueValues } from '../lib/transforms'
import { mean } from '../lib/statistics'
import { formatCurrency, formatCurrencyFull, titleCase, regionDisplayName } from '../lib/formatters'
import { REGION_COLORS, CHART_COLORS } from '../lib/colors'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-border dark:border-border-dark rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-slate-600 dark:text-slate-300">
          {p.name}: {formatCurrencyFull(p.value)}
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

  return (
    <div>
      <Header title="Overview" allRegions={allRegions} allGPOs={allGPOs} />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Procedures Tracked"
            value={String(uniqueProcedures.length)}
            sublabel={`${data.length.toLocaleString()} total records`}
            color="primary"
          />
          <KPICard
            label="Avg Median Cost"
            value={formatCurrency(avgMedian)}
            sublabel="Across all procedures"
            color="teal"
          />
          <KPICard
            label="Highest Cost Specialty"
            value={highestSpecialty?.name || '—'}
            sublabel={highestSpecialty ? formatCurrencyFull(highestSpecialty.avgCostMedian) : ''}
            color="purple"
          />
          <KPICard
            label="Lowest Cost Region"
            value={lowestRegion?.displayName || '—'}
            sublabel={lowestRegion ? formatCurrencyFull(lowestRegion.avgCostMedian) : ''}
            color="amber"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Specialty Bar Chart */}
          <div className="card">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Average Cost by Specialty
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={specialtyData} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={formatCurrency} fontSize={12} />
                <YAxis type="category" dataKey="name" width={115} fontSize={11} tick={{ fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgCostMedian" name="Avg Median Cost" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Bar Chart */}
          <div className="card">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Regional Cost Comparison
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayName" fontSize={12} tick={{ fill: '#64748B' }} />
                <YAxis tickFormatter={formatCurrency} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgCostMedian" name="Avg Median Cost" radius={[4, 4, 0, 0]}>
                  {regionData.map((entry) => (
                    <Cell key={entry.name} fill={REGION_COLORS[entry.name] || CHART_COLORS.muted} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Procedures */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Top 10 Most Expensive Procedures
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={top10} layout="vertical" margin={{ left: 180, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={formatCurrency} fontSize={12} />
              <YAxis type="category" dataKey="name" width={175} fontSize={11} tick={{ fill: '#64748B' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgCostLow" name="Low Estimate" fill="#BFDBFE" stackId="range" radius={[0, 0, 0, 0]} />
              <Bar dataKey="avgCostMedian" name="Median Cost" fill={CHART_COLORS.primary} radius={[0, 0, 0, 0]} />
              <Bar dataKey="avgCostHigh" name="High Estimate" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
