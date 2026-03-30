export interface SurgeryCostRow {
  id: string
  procedure_name: string
  procedure_code: string
  procedure_description: string
  specialty: string
  specialty_description: string
  region: string
  region_description: string
  region_cost_index: number
  duration_tier: string
  duration_label: string
  duration_min_hours: number
  duration_max_hours: number
  gpo: string
  gpo_full_name: string
  estimated_cost_low: number
  estimated_cost_median: number
  estimated_cost_high: number
  surgeon_fee: number
  anesthesia_fee: number
  facility_fee: number
  equipment_cost: number
  other_costs: number
  typical_duration_hours: number
  requires_overnight_stay: boolean
  average_hospital_days: number
  data_source: string
  data_confidence: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FilterState {
  selectedRegions: string[]
  selectedGPOs: string[]
  selectedSpecialty: string | null
  selectedProcedure: string | null
  costDisplayMode: 'absolute' | 'relative'
}

export interface GroupedCostData {
  name: string
  avgCostLow: number
  avgCostMedian: number
  avgCostHigh: number
  count: number
}

export interface FeeBreakdown {
  name: string
  surgeon_fee: number
  anesthesia_fee: number
  facility_fee: number
  equipment_cost: number
  other_costs: number
}

export interface BoxPlotData {
  name: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
}

export interface CorrelationPair {
  x: string
  y: string
  r: number
}

export interface FactorImpact {
  factor: string
  impact: number
  direction: 'positive' | 'negative'
  percentage: number
}
