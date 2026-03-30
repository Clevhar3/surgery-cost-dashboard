export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function titleCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function gpoDisplayName(gpo: string): string {
  const map: Record<string, string> = {
    vizient: 'Vizient',
    premier: 'Premier',
    healthtrust: 'HealthTrust',
    intalere: 'Intalere',
    med_assets: 'Med Assets',
    yankee_alliance: 'Yankee Alliance',
  }
  return map[gpo] || titleCase(gpo)
}

export function regionDisplayName(region: string): string {
  const map: Record<string, string> = {
    northeast: 'Northeast',
    southeast: 'Southeast',
    midwest: 'Midwest',
    southwest: 'Southwest',
    west_coast: 'West Coast',
    mountain_west: 'Mountain West',
  }
  return map[region] || titleCase(region)
}
