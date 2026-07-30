import { formatDateToYYYYMMDD } from './formatters'

export interface DateCell {
  date: string
  isPadding: boolean
}

export function generateDateRange(year: number): DateCell[] {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  //   const dayOfWeek = (startDate.getDay() + 6) % 7
  //   const paddedStart = new Date(startDate)
  //   paddedStart.setDate(startDate.getDate() - dayOfWeek)

  const result: DateCell[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    result.push({
      date: formatDateToYYYYMMDD(currentDate),
      isPadding: currentDate < startDate,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}
