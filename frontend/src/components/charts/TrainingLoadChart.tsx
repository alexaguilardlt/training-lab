import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TrainingLoad } from '../../types/activity'
import { formatDateToDDMMYYYY } from '../../lib/formatters'

interface TrainingLoadChartProps {
  trainingLoad: TrainingLoad[]
}

const TrainingLoadChart = ({ trainingLoad }: TrainingLoadChartProps) => {
  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={trainingLoad}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDateToDDMMYYYY} />
          <YAxis dataKey="ratio" />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number'
                ? value.toFixed(2)
                : 'Sin datos suficientes'
            }
            labelFormatter={(label) =>
              typeof label === 'string'
                ? formatDateToDDMMYYYY(label)
                : String(label)
            }
          />
          <Line dataKey="ratio" name="Ratio" />
          <ReferenceArea y1={0.8} y2={1.2} fill="#c6e48b" fillOpacity={0.3} />
        </LineChart>
      </ResponsiveContainer>
      <p>
        Zona verde (0.8-1.2): carga sostenible. Por encima: subiste el volumen
        demasiado rápido respecto a tu base (más riesgo). Por debajo: estás
        perdiendo forma.
      </p>
    </>
  )
}

export default TrainingLoadChart
