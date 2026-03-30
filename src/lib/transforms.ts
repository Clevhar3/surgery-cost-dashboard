import type { SurgeryCostRow, GroupedCostData, FeeBreakdown } from '../types/database'
import { mean } from './statistics'

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return map
}

export function avgCostByGroup(
  data: SurgeryCostRow[],
  keyFn: (row: SurgeryCostRow) => string
): GroupedCostData[] {
  const groups = groupBy(data, keyFn)
  return [...groups.entries()]
    .map(([name, rows]) => ({
      name,
      avgCostLow: mean(rows.map((r) => Number(r.estimated_cost_low))),
      avgCostMedian: mean(rows.map((r) => Number(r.estimated_cost_median))),
      avgCostHigh: mean(rows.map((r) => Number(r.estimated_cost_high))),
      count: rows.length,
    }))
    .sort((a, b) => b.avgCostMedian - a.avgCostMedian)
}

export function feeBreakdownByGroup(
  data: SurgeryCostRow[],
  keyFn: (row: SurgeryCostRow) => string
): FeeBreakdown[] {
  const groups = groupBy(data, keyFn)
  return [...groups.entries()].map(([name, rows]) => ({
    name,
    surgeon_fee: mean(rows.map((r) => Number(r.surgeon_fee))),
    anesthesia_fee: mean(rows.map((r) => Number(r.anesthesia_fee))),
    facility_fee: mean(rows.map((r) => Number(r.facility_fee))),
    equipment_cost: mean(rows.map((r) => Number(r.equipment_cost))),
    other_costs: mean(rows.map((r) => Number(r.other_costs))),
  }))
}

export function getUniqueValues(data: SurgeryCostRow[], field: keyof SurgeryCostRow): string[] {
  return [...new Set(data.map((d) => String(d[field])))].sort()
}

export function topProcedures(data: SurgeryCostRow[], n: number): GroupedCostData[] {
  return avgCostByGroup(data, (r) => r.procedure_name).slice(0, n)
}

export function computeGPOBySpecialty(
  data: SurgeryCostRow[],
  selectedGPOs: string[]
): { specialty: string; [gpo: string]: number | string }[] {
  const specialties = getUniqueValues(data, 'specialty')
  const gpos = selectedGPOs.length > 0 ? selectedGPOs : getUniqueValues(data, 'gpo')

  return specialties.map((specialty) => {
    const row: Record<string, number | string> = { specialty }
    for (const gpo of gpos) {
      const filtered = data.filter((d) => d.specialty === specialty && d.gpo === gpo)
      row[gpo] = filtered.length > 0 ? mean(filtered.map((d) => Number(d.estimated_cost_median))) : 0
    }
    return row
  }).sort((a, b) => {
    const aTotal = gpos.reduce((s, g) => s + (Number(a[g]) || 0), 0)
    const bTotal = gpos.reduce((s, g) => s + (Number(b[g]) || 0), 0)
    return bTotal - aTotal
  })
}
