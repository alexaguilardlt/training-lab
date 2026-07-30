export const formatDateToDDMMYYYY = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatMonthLabel(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { month: 'short' })
}

export const formatPace = (paceDecimalMinutes: number): string => {
  const minutes = Math.floor(paceDecimalMinutes)
  const seconds = Math.round((paceDecimalMinutes - minutes) * 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export const COLOR_THRESHOLDS = [
  { maxDistance: 0, color: '#eee' },
  { maxDistance: 5000, color: '#c6e48b' },
  { maxDistance: 10000, color: '#7bc96f' },
  { maxDistance: 15000, color: '#49af5d' },
  { maxDistance: 22000, color: '#2e8840' },
  { maxDistance: 30000, color: '#196127' },
  { maxDistance: 42000, color: '#0d3d1a' },
  { maxDistance: Infinity, color: '#08210d' },
]

export function getColorForDistance(distance: number): string {
  const threshold = COLOR_THRESHOLDS.find((t) => distance <= t.maxDistance)
  return threshold!.color
}
