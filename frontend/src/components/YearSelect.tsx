interface YearSelectProps {
  years: number[]
  selectedYear: number
  onYearChange: (year: number) => void
}

const YearSelect = ({ years, selectedYear, onYearChange }: YearSelectProps) => {
  return (
    <select
      value={selectedYear}
      onChange={(e) => onYearChange(Number(e.target.value))}
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  )
}

export default YearSelect
