import { formatDateToYYYYMMDD } from './formatters'

export interface DateCell {
  date: string
  isPadding: boolean
}

export function generateDateRange(days: number = 365): DateCell[] {
  const today = new Date()
  const startDate = new Date()
  startDate.setDate(today.getDate() - days)

  const dayOfWeek = (startDate.getDay() + 6) % 7
  const paddedStart = new Date(startDate)
  paddedStart.setDate(startDate.getDate() - dayOfWeek)

  const result: DateCell[] = []
  const currentDate = new Date(paddedStart)

  while (currentDate <= today) {
    result.push({
      date: formatDateToYYYYMMDD(currentDate),
      isPadding: currentDate < startDate,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}
