import ReadingForm from "./components/ReadingForm";
import ReadingList from "./components/ReadingList";
import FilterPanel from "./components/FilterPanel";
import Footer from "./components/Footer";

import { useSensorContext } from "./context/SensorContext";
import { CLOUD_RUN_URL } from "./utils/env";

function App() {
  const {
    sedes,
    sensorTypes,
    loading,
    error,
    apiStatus,
    readings,
    handleCreateReading,
    filters,
    setFilters,
    loadReadings,
  } = useSensorContext();

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <main className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <img src="/iot.png" alt="" />

              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Sistema IoT Distribuido
              </h1>
            </div>

            <h2 className="text-gray-600 mt-4 font-bold">
              Gestión de lecturas de sensores con Apache Cassandra
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              API en uso:{" "}
              <a
                className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                href={CLOUD_RUN_URL + "/docs"}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CLOUD_RUN_URL}
              </a>
              <span className="ml-2 text-xs px-2 py-1 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50">
                {apiStatus === "connected"
                  ? "Conectado"
                  : apiStatus === "checking"
                    ? "Verificando..."
                    : "Error"}
              </span>
            </p>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Nueva Lectura
              </h2>

              <ReadingForm
                sedes={sedes}
                onCreateReading={handleCreateReading}
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Filtros de Búsqueda
              </h2>

              <FilterPanel
                sedes={sedes}
                sensorTypes={sensorTypes}
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={loadReadings}
                loading={loading}
              />
            </div>
          </section>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>

              {error.includes("Cassandra") && (
                <p className="text-sm mt-2 text-red-600">
                  Error Cassandra: No se pudo conectar con la base de datos.
                </p>
              )}
            </div>
          )}

          <section className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Lecturas ({readings.length})
            </h2>

            <ReadingList readings={readings} loading={loading} />
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default App;
