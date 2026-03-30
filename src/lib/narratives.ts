import type { SurgeryCostRow } from '../types/database'
import { mean, stddev, coefficientOfVariation } from './statistics'
import { groupBy } from './transforms'
import { formatCurrencyFull, regionDisplayName, gpoDisplayName } from './formatters'

export function generateVarianceNarrative(
  data: SurgeryCostRow[],
  compareBy: 'region' | 'gpo'
): string {
  if (data.length === 0) return 'Select a procedure to see variance analysis.'

  const procedure = data[0].procedure_name
  const groups = groupBy(data, (r) => compareBy === 'region' ? r.region : r.gpo)
  const displayFn = compareBy === 'region' ? regionDisplayName : gpoDisplayName

  const groupAvgs = [...groups.entries()].map(([name, rows]) => ({
    name,
    avg: mean(rows.map((r) => Number(r.estimated_cost_median))),
    surgeonAvg: mean(rows.map((r) => Number(r.surgeon_fee))),
    facilityAvg: mean(rows.map((r) => Number(r.facility_fee))),
    anesthesiaAvg: mean(rows.map((r) => Number(r.anesthesia_fee))),
    equipmentAvg: mean(rows.map((r) => Number(r.equipment_cost))),
  }))

  groupAvgs.sort((a, b) => b.avg - a.avg)
  const highest = groupAvgs[0]
  const lowest = groupAvgs[groupAvgs.length - 1]

  const allMedians = data.map((d) => Number(d.estimated_cost_median))
  const cv = coefficientOfVariation(allMedians)
  const sd = stddev(allMedians)

  const diff = highest.avg - lowest.avg
  const pctDiff = ((diff / lowest.avg) * 100).toFixed(1)

  const feeDrivers = [
    { name: 'facility fees', diff: highest.facilityAvg - lowest.facilityAvg },
    { name: 'surgeon fees', diff: highest.surgeonAvg - lowest.surgeonAvg },
    { name: 'equipment costs', diff: highest.equipmentAvg - lowest.equipmentAvg },
    { name: 'anesthesia fees', diff: highest.anesthesiaAvg - lowest.anesthesiaAvg },
  ].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

  const topDriver = feeDrivers[0]
  const driverPct = diff > 0 ? ((topDriver.diff / diff) * 100).toFixed(0) : '0'

  const parts = [
    `**${procedure}** in ${displayFn(highest.name)} costs ${pctDiff}% more than ${displayFn(lowest.name)}`,
    `(${formatCurrencyFull(highest.avg)} vs. ${formatCurrencyFull(lowest.avg)}).`,
    `The primary cost driver is ${topDriver.name} (+${formatCurrencyFull(topDriver.diff)}),`,
    `accounting for ${driverPct}% of the total variance.`,
    `\n\nOverall variability: CV = ${cv.toFixed(1)}%, std. deviation = ${formatCurrencyFull(sd)}.`,
  ]

  if (groupAvgs.length > 2) {
    const mid = groupAvgs[Math.floor(groupAvgs.length / 2)]
    parts.push(
      `${displayFn(mid.name)} falls near the median at ${formatCurrencyFull(mid.avg)}.`
    )
  }

  return parts.join(' ')
}
