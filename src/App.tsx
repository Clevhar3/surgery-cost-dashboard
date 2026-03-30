import { useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { useSurgeryCosts } from './hooks/useSurgeryCosts'
import { useFilteredData } from './hooks/useFilteredData'
import { getUniqueValues } from './lib/transforms'
import { OverviewDashboard } from './pages/OverviewDashboard'
import { GPOComparison } from './pages/GPOComparison'
import { StatisticalAnalysis } from './pages/StatisticalAnalysis'
import { ProcedureExplorer } from './pages/ProcedureExplorer'
import { KPISkeleton, ChartSkeleton } from './components/ui/Skeleton'

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <KPISkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Failed to load data</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}

function DashboardRoutes() {
  const { data: rawData, loading, error } = useSurgeryCosts()
  const data = useFilteredData(rawData)

  const allRegions = useMemo(() => getUniqueValues(rawData, 'region'), [rawData])
  const allGPOs = useMemo(() => getUniqueValues(rawData, 'gpo'), [rawData])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <Routes>
      <Route path="/" element={<OverviewDashboard data={data} allRegions={allRegions} allGPOs={allGPOs} />} />
      <Route path="/gpo-comparison" element={<GPOComparison data={data} allRegions={allRegions} allGPOs={allGPOs} />} />
      <Route path="/analysis" element={<StatisticalAnalysis data={data} allRegions={allRegions} allGPOs={allGPOs} />} />
      <Route path="/procedures" element={<ProcedureExplorer data={data} allRegions={allRegions} allGPOs={allGPOs} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppShell>
      <DashboardRoutes />
    </AppShell>
  )
}
