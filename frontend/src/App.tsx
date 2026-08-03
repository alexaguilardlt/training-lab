import { useActivities } from './hooks/useActivities'
import PaceDistanceChart from './components/charts/PaceDistanceChart'
import { syncStravaActivities } from './api/strava'
import { useEffect, useState } from 'react'
import HeatmapCalendar from './components/charts/HeatmapCalendar'
import { useHeatmap } from './hooks/useHeatmap'
import { filterActivitiesByYear, getAvailableYears } from './lib/yearFilter'
import YearSelect from './components/YearSelect'
import TrainingLoadChart from './components/charts/TrainingLoadChart'
import { useTrainingLoad } from './hooks/useTrainingLoad'

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
    <div>
      <h1>Training Lab</h1>
      <YearSelect
        years={getAvailableYears(activities)}
        selectedYear={year}
        onYearChange={setYear}
      />
      {loading ? (
        <p>Cargando actividades...</p>
      ) : (
        <PaceDistanceChart
          activities={filterActivitiesByYear(activities, year)}
        />
      )}
      {error && <p>Error al cargar actividades: {error}</p>}
      <HeatmapCalendar dailyDistances={dailyDistances} year={year} />
      <TrainingLoadChart trainingLoad={trainingLoad} />
    </div>
  )
}

export default App
