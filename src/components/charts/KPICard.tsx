export function KPICard({
  label,
  value,
  sublabel,
  color = 'primary',
}: {
  label: string
  value: string
  sublabel?: string
  color?: 'primary' | 'teal' | 'purple' | 'amber'
}) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }

  return (
    <div className="card flex flex-col">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span className={`mt-2 text-2xl font-bold ${colorMap[color].split(' ').slice(1).join(' ')}`}>
        {value}
      </span>
      {sublabel && (
        <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sublabel}</span>
      )}
    </div>
  )
}
