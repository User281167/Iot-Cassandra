interface FilterPanelProps {
  sedes: string[];
  sensorTypes: string[];
  filters: {
    sede: string;
    sensor_type: string;
    limit: number;
  };
  onFiltersChange: (filters: {
    sede: string;
    sensor_type: string;
    limit: number;
  }) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function FilterPanel({
  sedes,
  sensorTypes,
  filters,
  onFiltersChange,
  onSearch,
  loading,
}: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sede
        </label>

        <select
          value={filters.sede}
          onChange={e =>
            onFiltersChange({
              ...filters,
              sede: e.target.value,
              sensor_type: "",
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecciona una sede</option>
          {sedes.map(sede => (
            <option key={sede} value={sede}>
              {sede}
            </option>
          ))}
        </select>

        {sedes.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            No hay sedes disponibles. Crea una lectura primero.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Sensor
        </label>

        <select
          value={filters.sensor_type}
          onChange={e =>
            onFiltersChange({ ...filters, sensor_type: e.target.value })
          }
          disabled={!filters.sede}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Selecciona un tipo</option>

          {sensorTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {!filters.sede && (
          <p className="text-xs text-gray-500 mt-1">
            Primero selecciona una sede
          </p>
        )}

        {filters.sede && sensorTypes.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Cargando tipos de sensores...
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Límite de resultados
        </label>

        <input
          type="number"
          min="1"
          max="100"
          value={filters.limit}
          onChange={e =>
            onFiltersChange({
              ...filters,
              limit: parseInt(e.target.value) || 20,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={onSearch}
        disabled={loading || !filters.sede || !filters.sensor_type}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={
          !filters.sede || !filters.sensor_type
            ? "Selecciona una sede y un tipo de sensor para buscar"
            : ""
        }
      >
        {loading ? "Buscando..." : "Buscar Lecturas"}
      </button>

      {!filters.sede || !filters.sensor_type ? (
        <p className="text-xs text-gray-500 text-center">
          {!filters.sede
            ? "Selecciona una sede"
            : "Selecciona un tipo de sensor"}
        </p>
      ) : null}
    </div>
  );
}
