import type { Activity, TrainingLoad } from '../types/activity'

export function getAvailableYears(activities: Activity[]): number[] {
  const years = new Set<number>()
  activities.forEach((activity) => {
    const year = activity.start_date.split('-')[0]
    years.add(Number(year))
  })
  return Array.from(years).sort((a, b) => b - a)
}

export function filterActivitiesByYear(
  activities: Activity[],
  year: number,
): Activity[] {
  return activities.filter((activity) => {
    const activityYear = activity.start_date.split('-')[0]
    return Number(activityYear) === year
  })
}

export function filterTrainingLoadByYear(
  trainingLoad: TrainingLoad[],
  year: number,
): TrainingLoad[] {
  return trainingLoad.filter((load) => load.date.startsWith(year.toString()))
}
