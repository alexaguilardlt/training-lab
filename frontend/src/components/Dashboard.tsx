import {
  filterActivitiesByYear,
  filterTrainingLoadByYear,
} from '../lib/yearFilter'
import type { DashboardProps } from '../types/dashboard'
import HeatmapCalendar from './charts/HeatmapCalendar'
import PaceDistanceChart from './charts/PaceDistanceChart'
import TrainingLoadChart from './charts/TrainingLoadChart'
import YearSelect from './YearSelect'

const Dashboard = ({
  years,
  selectedYear,
  onYearChange,
  loading,
  error,
  activities,
  dailyDistances,
  trainingLoad,
}: DashboardProps) => {
  return (
    <div>
      <h1>Training Lab</h1>
      <YearSelect
        years={years}
        selectedYear={selectedYear}
        onYearChange={onYearChange}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        <section>
          <h2>Ritmo y distancia</h2>
          {loading ? (
            <p>Cargando actividades...</p>
          ) : (
            <PaceDistanceChart
              activities={filterActivitiesByYear(activities, selectedYear)}
            />
          )}
          {error && <p>Error al cargar actividades: {error}</p>}
        </section>
        <section>
          <h2>Constancia</h2>
          <HeatmapCalendar
            dailyDistances={dailyDistances}
            year={selectedYear}
          />
        </section>
        <section>
          <h2>Carga de entrenamiento</h2>
          <TrainingLoadChart
            trainingLoad={filterTrainingLoadByYear(trainingLoad, selectedYear)}
          />
        </section>
      </div>
    </div>
  )
}

export default Dashboard
