import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
function App() {
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"))
    
  }, [])

  return (
    <div>
      <h1>Training Lab</h1>
      <p>Estado del backend: {status}</p>
    </div>
  )
}

export default App;