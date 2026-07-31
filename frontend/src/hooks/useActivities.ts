import { useState, useEffect, useCallback } from 'react'
import type { Activity } from '../types/activity'
import { getActivities } from '../api/activities'

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(() => {
    getActivities()
      .then((data) => {
        setActivities(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return { activities, loading, error, refetch: fetchActivities }
}
