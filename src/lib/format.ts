export function formatNumber(value: number | undefined, digits = 2): string {
  if (value === undefined || Number.isNaN(value)) {
    return '--'
  }

  return value.toFixed(digits)
}

export function formatGpa(value: number | undefined): string {
  return formatNumber(value, 2)
}

export function formatScore(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return '--'
  }

  return value.toFixed(1)
}
