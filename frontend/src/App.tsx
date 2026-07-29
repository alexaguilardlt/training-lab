import { useActivities } from "./hooks/useActivities";
import PaceDistanceChart from "./components/charts/PaceDistanceChart";
import { syncStravaActivities } from "./api/strava";
import { useEffect } from "react";

function App() {
  const { activities, loading, error, refetch } = useActivities();
  
  useEffect(() => {
    syncStravaActivities().then((data) => {
      if (data.actividades_nuevas > 0) refetch()
    }).catch((error) => {
      console.error(error)
    })
  }, [])

  return (
    <div>
      <h1>Training Lab</h1>
      {loading ? <p>Cargando actividades...</p> : 
      <PaceDistanceChart activities={activities} />
      }
      {error && <p>Error al cargar actividades: {error}</p>}
    </div>
  )
}

export default App;