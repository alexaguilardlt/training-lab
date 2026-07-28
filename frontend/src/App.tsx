import { useState, useEffect } from "react";

function App() {
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    fetch("http://localhost:8000/health")
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