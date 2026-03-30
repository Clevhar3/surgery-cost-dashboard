import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SurgeryCostRow } from '../types/database'
import { Header } from '../components/layout/Header'
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

// Simple inline sparkline using SVG since recharts Sparklines isn't a standalone export
function MiniSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 80
  const h = 24
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={CHART_COLORS.primary}
        strokeWidth={1.5}
      />
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

  const procedures = useMemo(() => {
    const groups = groupBy(data, (r) => r.procedure_name)
    return [...groups.entries()].map(([name, rows]): ProcedureRow => {
      const medians = rows.map((r) => Number(r.estimated_cost_median))
      // Group by region for sparkline
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
    result.sort((a, b) => {
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

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="text-slate-300 ml-1">&#x2195;</span>
    return <span className="text-primary-600 ml-1">{sortDir === 'asc' ? '&#x2191;' : '&#x2193;'}</span>
  }

  return (
    <div>
      <Header title="Procedure Explorer" allRegions={allRegions} allGPOs={allGPOs} />
      <div className="p-6 space-y-6">
        {/* Search & Filter */}
        <div className="card">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by procedure name or CPT code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{titleCase(s)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {filtered.length} Procedures
            </h2>
            <p className="text-xs text-slate-500">Click a row to analyze</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th
                  className="text-left py-3 px-3 font-medium text-slate-500 cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  Procedure <SortIcon field="name" />
                </th>
                <th className="text-left py-3 px-3 font-medium text-slate-500">CPT</th>
                <th className="text-left py-3 px-3 font-medium text-slate-500">Specialty</th>
                <th
                  className="text-right py-3 px-3 font-medium text-slate-500 cursor-pointer select-none"
                  onClick={() => handleSort('avgCost')}
                >
                  Avg Cost <SortIcon field="avgCost" />
                </th>
                <th
                  className="text-right py-3 px-3 font-medium text-slate-500 cursor-pointer select-none"
                  onClick={() => handleSort('range')}
                >
                  Range <SortIcon field="range" />
                </th>
                <th className="text-center py-3 px-3 font-medium text-slate-500">By Region</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proc) => (
                <tr
                  key={proc.name}
                  onClick={() => navigate(`/analysis?procedure=${encodeURIComponent(proc.name)}`)}
                  className="border-b border-border/50 dark:border-border-dark/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white max-w-[250px] truncate">
                    {proc.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {proc.code}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs">
                      {titleCase(proc.specialty)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 dark:text-white font-medium">
                    {formatCurrencyFull(proc.avgCost)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                    {formatCurrencyFull(proc.range)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <MiniSparkline values={proc.regionCosts} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
