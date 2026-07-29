import { useState, useEffect } from "react";
import { useActivities } from "./hooks/useActivities";
import PaceDistanceChart from "./components/charts/PaceDistanceChart";

function App() {
  const [status, setStatus] = useState<string>("loading");

  const { activities, loading, error } = useActivities();

  return (
    <div>
      <h1>Training Lab</h1>
      <p>Estado del backend: {status}</p>
      {loading ? <p>Cargando actividades...</p> : 
      <PaceDistanceChart activities={activities} />
      }
    </div>
  )
}

export default App;