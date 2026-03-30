import type { SurgeryCostRow, BoxPlotData, CorrelationPair, FactorImpact } from '../types/database'

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  const squaredDiffs = values.map((v) => (v - m) ** 2)
  return Math.sqrt(squaredDiffs.reduce((s, v) => s + v, 0) / (values.length - 1))
}

export function coefficientOfVariation(values: number[]): number {
  const m = mean(values)
  if (m === 0) return 0
  return (stddev(values) / m) * 100
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
}

export function boxPlotStats(name: string, values: number[]): BoxPlotData {
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = percentile(sorted, 25)
  const med = percentile(sorted, 50)
  const q3 = percentile(sorted, 75)
  const iqr = q3 - q1
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr

  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence)
  const inRange = sorted.filter((v) => v >= lowerFence && v <= upperFence)

  return {
    name,
    min: inRange.length > 0 ? inRange[0] : sorted[0],
    q1,
    median: med,
    q3,
    max: inRange.length > 0 ? inRange[inRange.length - 1] : sorted[sorted.length - 1],
    outliers,
  }
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 3) return 0
  const mx = mean(x.slice(0, n))
  const my = mean(y.slice(0, n))
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

export function computeCorrelationMatrix(data: SurgeryCostRow[]): CorrelationPair[] {
  const fields = [
    { key: 'region_cost_index', label: 'Region Cost Index' },
    { key: 'estimated_cost_median', label: 'Median Cost' },
    { key: 'equipment_cost', label: 'Equipment Cost' },
    { key: 'typical_duration_hours', label: 'Duration (hrs)' },
    { key: 'surgeon_fee', label: 'Surgeon Fee' },
    { key: 'facility_fee', label: 'Facility Fee' },
  ] as const

  const pairs: CorrelationPair[] = []
  for (const fx of fields) {
    for (const fy of fields) {
      const xVals = data.map((d) => Number(d[fx.key]))
      const yVals = data.map((d) => Number(d[fy.key]))
      pairs.push({ x: fx.label, y: fy.label, r: pearsonCorrelation(xVals, yVals) })
    }
  }
  return pairs
}

export function factorDecomposition(
  data: SurgeryCostRow[],
  groupBy: 'region' | 'gpo'
): FactorImpact[] {
  if (data.length === 0) return []

  const groups = new Map<string, SurgeryCostRow[]>()
  for (const row of data) {
    const key = groupBy === 'region' ? row.region : row.gpo
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  const feeFields = ['surgeon_fee', 'facility_fee', 'anesthesia_fee', 'equipment_cost', 'other_costs'] as const
  const overallAvg = mean(data.map((d) => d.estimated_cost_median))

  const impacts: FactorImpact[] = []
  let totalAbsImpact = 0

  for (const field of feeFields) {
    const groupAvgs = [...groups.entries()].map(([, rows]) =>
      mean(rows.map((r) => Number(r[field])))
    )
    const range = Math.max(...groupAvgs) - Math.min(...groupAvgs)
    totalAbsImpact += range
    impacts.push({
      factor: field,
      impact: range,
      direction: 'positive',
      percentage: 0,
    })
  }

  for (const imp of impacts) {
    imp.percentage = totalAbsImpact > 0 ? (imp.impact / totalAbsImpact) * 100 : 0
    imp.direction = imp.impact > overallAvg * 0.01 ? 'positive' : 'negative'
  }

  return impacts.sort((a, b) => b.impact - a.impact)
}
