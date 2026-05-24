export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

export function KPISkeleton() {
  return (
    <div className="bezel-outer">
      <div className="bezel-inner flex flex-col gap-4 p-7">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-44" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  )
}

export function ChartSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="bezel-outer">
      <div className="bezel-inner p-7">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className={tall ? 'h-[420px] w-full' : 'h-[280px] w-full'} />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bezel-outer">
      <div className="bezel-inner p-7">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
