import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Activity } from "../../types/activity";
import { formatDateToDDMMYYYY, formatPace } from "../../lib/formatters";

interface PaceDistanceChartProps {
  activities: Activity[];
}

const PaceDistanceChart = ({ activities }: PaceDistanceChartProps) => {
    return (
    <ResponsiveContainer width="100%" height={400}>
        <LineChart data={activities}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="start_date" tickFormatter={formatDateToDDMMYYYY} />
            <YAxis reversed tickFormatter={formatPace} />
            <Tooltip
                formatter={(value) => (typeof value === "number" ? formatPace(value) : String(value))}
                labelFormatter={(label) => (typeof label === "string" ? formatDateToDDMMYYYY(label) : String(label))}
            />
            <Line dataKey="pace_per_km" name="Ritmo" />
        </LineChart>
    </ResponsiveContainer>
    )
}

export default PaceDistanceChart;