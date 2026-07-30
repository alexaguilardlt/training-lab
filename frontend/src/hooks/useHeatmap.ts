import { useState, useEffect } from 'react'
import { getDailyDistances } from '../api/activities'
import type { DailyDistance } from '../types/activity'

export function useHeatmap() {
  const [dailyDistances, setDailyDistances] = useState<DailyDistance[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDailyDistances = () => {
    getDailyDistances()
      .then((data) => {
        setDailyDistances(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDailyDistances()
  }, [])

  return { dailyDistances, loading, error }
}
