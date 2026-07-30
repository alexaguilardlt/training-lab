import type { DailyDistance } from '../../types/activity'
import { generateDateRange, type DateCell } from '../../lib/dateRange'
import { useMemo } from 'react'
import {
  getColorForDistance,
  formatMonthLabel,
  formatDateToYYYYMMDD,
} from '../../lib/formatters'

interface CellWithColor extends DateCell {
  distance: number
  color: string
}

interface MonthGroup {
  key: string
  label: string
  cells: CellWithColor[]
}

function groupByMonth(cells: CellWithColor[]): MonthGroup[] {
  const groups: MonthGroup[] = []

  for (const cell of cells) {
    const monthKey = cell.date.slice(0, 7)
    const lastGroup = groups[groups.length - 1]

    if (!lastGroup || lastGroup.key !== monthKey) {
      groups.push({
        key: monthKey,
        label: formatMonthLabel(cell.date),
        cells: [cell],
      })
    } else {
      lastGroup.cells.push(cell)
    }
  }

  return groups
}

function padGroupToMonday(group: MonthGroup): MonthGroup {
  const firstCell = group.cells[0]
  const firstDate = new Date(firstCell.date)
  const dayOfWeek = (firstDate.getDay() + 6) % 7

  const padding: CellWithColor[] = []
  for (let i = dayOfWeek; i > 0; i--) {
    const paddedDate = new Date(firstDate)
    paddedDate.setDate(firstDate.getDate() - i)
    padding.push({
      date: formatDateToYYYYMMDD(paddedDate),
      isPadding: true,
      distance: 0,
      color: 'transparent',
    })
  }

  return { ...group, cells: [...padding, ...group.cells] }
}

const HeatmapCalendar = ({
  dailyDistances,
}: {
  dailyDistances: DailyDistance[]
}) => {
  const distanceByDate = new Map(
    dailyDistances.map((d) => [d.date, d.distance_meters]),
  )

  const days = generateDateRange()
  const cells = useMemo(
    () =>
      days.map((day) => ({
        ...day,
        distance: distanceByDate.get(day.date) ?? 0,
        color: getColorForDistance(distanceByDate.get(day.date) ?? 0),
      })),
    [dailyDistances],
  )

  const monthGroups = useMemo(
    () => groupByMonth(cells).map(padGroupToMonday),
    [cells],
  )

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, auto)',
        gap: '16px',
      }}
    >
      {monthGroups.map((group) => (
        <div
          key={group.key}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <span style={{ fontSize: '10px' }}>{group.label}</span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 12px)',
              gridAutoRows: '12px',
              gap: '3px',
            }}
          >
            {group.cells.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${(cell.distance / 1000).toFixed(2)}km`}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: cell.isPadding ? 'transparent' : cell.color,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default HeatmapCalendar
