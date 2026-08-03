import type { Activity, DailyDistance, TrainingLoad } from './activity'

export interface DashboardProps {
  years: number[]
  selectedYear: number
  onYearChange: (year: number) => void
  loading: boolean
  error: string | null
  activities: Activity[]
  dailyDistances: DailyDistance[]
  trainingLoad: TrainingLoad[]
}
