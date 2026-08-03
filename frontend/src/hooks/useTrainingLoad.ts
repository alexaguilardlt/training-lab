import { useEffect, useState } from 'react'
import { getTrainingLoad } from '../api/trainingLoad'
import type { TrainingLoad } from '../types/activity'

export function useTrainingLoad() {
  const [trainingLoad, setTrainingLoad] = useState<TrainingLoad[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrainingLoad = () => {
    getTrainingLoad()
      .then((data) => {
        setTrainingLoad(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTrainingLoad()
  }, [])

  return { trainingLoad, loading, error }
}
