import { useActivities } from './hooks/useActivities'
import { syncStravaActivities } from './api/strava'
import { useEffect, useState } from 'react'
import { useHeatmap } from './hooks/useHeatmap'
import { getAvailableYears } from './lib/yearFilter'
import { useTrainingLoad } from './hooks/useTrainingLoad'
import Dashboard from './components/Dashboard'

function App() {
  const { activities, loading, error, refetch } = useActivities()
  const { dailyDistances } = useHeatmap()
  const { trainingLoad } = useTrainingLoad()
  const [year, setYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    syncStravaActivities()
      .then((data) => {
        if (data.actividades_nuevas > 0) refetch()
      })
      .catch((error) => {
        console.error(error)
      })
  }, [refetch])

  return (
    <Dashboard
      years={getAvailableYears(activities)}
      selectedYear={year}
      onYearChange={setYear}
      loading={loading}
      error={error}
      activities={activities}
      dailyDistances={dailyDistances}
      trainingLoad={trainingLoad}
    />
  )
}

export default App
