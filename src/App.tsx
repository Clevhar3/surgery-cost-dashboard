import { useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react'
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
    <div className="pt-10 pb-10 sm:pt-16 sm:pb-12 md:pt-24 space-y-8 sm:space-y-10">
      <div className="grid grid-cols-12 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 items-end">
        <div className="col-span-12 md:col-span-7">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-ink-5 sm:w-8" />
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-ink-4">
              loading
            </p>
          </div>
          <div className="mt-4 space-y-3 sm:space-y-4">
            <div className="shimmer h-[48px] sm:h-[64px] w-full max-w-[420px] rounded-2xl" />
            <div className="shimmer h-[48px] sm:h-[64px] w-[70%] max-w-[300px] rounded-2xl" />
          </div>
          <p className="mt-5 sm:mt-6 max-w-md text-[13px] sm:text-[14px] text-ink-3">
            Pulling 4,608 surgery cost rows from the warehouse. This usually settles in under
            a second.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => <KPISkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="pt-10 pb-10 sm:pt-16 sm:pb-12 md:pt-24">
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12 md:col-span-9">
          <div className="flex items-center gap-3 text-coral-600">
            <span aria-hidden className="h-px w-6 bg-coral-300 sm:w-8" />
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em]">
              error
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] sm:text-[44px] md:text-[60px] leading-[0.96] tracking-[-0.04em] text-ink">
            Couldn&rsquo;t load the surgery cost dataset.
          </h1>
          <p className="mt-5 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-ink-3">
            The data layer returned an error before any rows arrived. Below is the raw response
            from Supabase. If this keeps happening, check the project URL and the publishable
            key in <span className="font-mono text-ink">.env</span>.
          </p>
          <div className="mt-6 sm:mt-8 bezel-outer max-w-xl">
            <div className="bezel-inner p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <WarningCircle weight="duotone" className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" />
                <p className="font-mono text-[11px] sm:text-[12px] leading-relaxed text-ink-2 break-words">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="press group mt-6 sm:mt-8 inline-flex items-center gap-3 rounded-full bg-ink pl-5 pr-[6px] py-[6px] text-[13px] font-medium text-paper"
          >
            <span className="leading-none">Retry</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-coral-500 transition-transform duration-300 group-hover:-rotate-[18deg]">
              <ArrowClockwise weight="bold" className="h-4 w-4 text-white" />
            </span>
          </button>
        </div>
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
