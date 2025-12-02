import { type Reading } from "../utils/types";
import Loader from "./Loader";

interface ReadingListProps {
  readings: Reading[];
  loading: boolean;
}

export default function ReadingList({ readings, loading }: ReadingListProps) {
  if (loading) {
    return <Loader />;
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay lecturas para mostrar.</p>

        <p className="text-sm mt-2">Usa los filtros para buscar lecturas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[70vh]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sede
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sensor ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {readings.map((reading, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {reading.sede}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {reading.sensor_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {reading.sensor_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {reading.value.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {reading.ts instanceof Date
                  ? reading.ts.toLocaleString()
                  : reading.ts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
