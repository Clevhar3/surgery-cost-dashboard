import { useMemo } from 'react'
import type { SurgeryCostRow } from '../types/database'
import { useFilters } from '../context/FilterContext'

export function useFilteredData(data: SurgeryCostRow[]): SurgeryCostRow[] {
  const { selectedRegions, selectedGPOs, selectedSpecialty, selectedProcedure } = useFilters()

  return useMemo(() => {
    let filtered = data

    if (selectedRegions.length > 0) {
      filtered = filtered.filter((r) => selectedRegions.includes(r.region))
    }
    if (selectedGPOs.length > 0) {
      filtered = filtered.filter((r) => selectedGPOs.includes(r.gpo))
    }
    if (selectedSpecialty) {
      filtered = filtered.filter((r) => r.specialty === selectedSpecialty)
    }
    if (selectedProcedure) {
      filtered = filtered.filter((r) => r.procedure_name === selectedProcedure)
    }

    return filtered
  }, [data, selectedRegions, selectedGPOs, selectedSpecialty, selectedProcedure])
}
