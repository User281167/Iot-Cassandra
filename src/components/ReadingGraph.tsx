import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { type Reading } from "../utils/types";

interface ReadingListProps {
  readings: Reading[];
  loading: boolean;
}

export default function ReadingGraph({ readings, loading }: ReadingListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay lecturas para graficar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full divide-y divide-gray-200 bg-red-">
        <AreaChart
          style={{
            width: "100%",
            maxHeight: "50vh",
            aspectRatio: 1.618,
          }}
          responsive
          data={readings.map(reading => ({
            name:
              reading.ts instanceof Date
                ? reading.ts.toLocaleString()
                : reading.ts,
            uv: reading.value,
          }))}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis width="auto" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="uv"
            stroke="#8884d8"
            fill="#8884d8"
            dot
          />
        </AreaChart>
      </div>
    </div>
  );
}
