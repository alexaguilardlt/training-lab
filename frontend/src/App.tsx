import { useActivities } from './hooks/useActivities'
import PaceDistanceChart from './components/charts/PaceDistanceChart'
import { syncStravaActivities } from './api/strava'
import { useEffect } from 'react'
import HeatmapCalendar from './components/charts/HeatmapCalendar'
import { useHeatmap } from './hooks/useHeatmap'

function App() {
  const { activities, loading, error, refetch } = useActivities()
  const { dailyDistances } = useHeatmap()

  useEffect(() => {
    syncStravaActivities()
      .then((data) => {
        if (data.actividades_nuevas > 0) refetch()
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  return (
    <div>
      <h1>Training Lab</h1>
      {loading ? (
        <p>Cargando actividades...</p>
      ) : (
        <PaceDistanceChart activities={activities} />
      )}
      {error && <p>Error al cargar actividades: {error}</p>}
      <HeatmapCalendar dailyDistances={dailyDistances} />
    </div>
  )
}

export default App
