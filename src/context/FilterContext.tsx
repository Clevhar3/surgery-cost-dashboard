import { createContext, useContext, useState, type ReactNode } from 'react'
import type { FilterState } from '../types/database'

interface FilterContextType extends FilterState {
  setSelectedRegions: (regions: string[]) => void
  setSelectedGPOs: (gpos: string[]) => void
  setSelectedSpecialty: (specialty: string | null) => void
  setSelectedProcedure: (procedure: string | null) => void
  setCostDisplayMode: (mode: 'absolute' | 'relative') => void
  resetFilters: () => void
}

const FilterContext = createContext<FilterContextType | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedGPOs, setSelectedGPOs] = useState<string[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null)
  const [costDisplayMode, setCostDisplayMode] = useState<'absolute' | 'relative'>('absolute')

  const resetFilters = () => {
    setSelectedRegions([])
    setSelectedGPOs([])
    setSelectedSpecialty(null)
    setSelectedProcedure(null)
    setCostDisplayMode('absolute')
  }

  return (
    <FilterContext.Provider
      value={{
        selectedRegions,
        selectedGPOs,
        selectedSpecialty,
        selectedProcedure,
        costDisplayMode,
        setSelectedRegions,
        setSelectedGPOs,
        setSelectedSpecialty,
        setSelectedProcedure,
        setCostDisplayMode,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters(): FilterContextType {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within FilterProvider')
  return ctx
}
