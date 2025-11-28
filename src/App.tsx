import { useState, useEffect } from "react";
import axios, { type AxiosRequestConfig } from "axios";
import ReadingForm from "./components/ReadingForm";
import ReadingList from "./components/ReadingList";
import FilterPanel from "./components/FilterPanel";
import Footer from "./components/Footer";

const CLOUD_RUN_URL = import.meta.env.VITE_API_URL;

interface Reading {
  sede: string;
  sensor_type: string;
  sensor_id: string;
  ts: string;
  value: number;
}

function App() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [sedes, setSedes] = useState<string[]>([]);
  const [sensorTypes, setSensorTypes] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    sede: "",
    sensor_type: "",
    limit: 20,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  const callApi = async <T = any,>(
    path: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> => {
    let lastError: unknown;

    try {
      const response = await axios({
        baseURL: CLOUD_RUN_URL,
        url: path,
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
        ...config,
      });

      setApiStatus("connected");
      return response.data as T;
    } catch (err) {
      lastError = err;
      console.warn(`[DEBUG] Error con ${CLOUD_RUN_URL}${path}:`, err);
    }

    setApiStatus("error");
    throw lastError;
  };

  // Verificar conexión con la API al iniciar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("[DEBUG] Verificando conexión con las APIs configuradas");

        const ping = await callApi<{ status?: string; message?: string }>("/", {
          timeout: 5000,
        });

        console.log("[DEBUG] API Root:", ping);

        if (ping?.status === "ok" || ping?.status === "healthy") {
          loadSedes();
          return;
        }
        loadSedes();
      } catch (err: any) {
        console.error("[DEBUG] Error verificando conexión:", err);

        // Intentar cargar sedes de todas formas
        loadSedes();
      }
    };

    checkConnection();
  }, []);

  // Cargar tipos de sensores cuando se selecciona una sede
  useEffect(() => {
    if (filters.sede) {
      loadSensorTypes(filters.sede);
    } else {
      setSensorTypes([]);
    }
  }, [filters.sede]);

  const loadSedes = async () => {
    try {
      console.log("[DEBUG] Cargando sedes con fallback de API");

      const data = await callApi<string[]>("/sedes", { timeout: 15000 });
      setSedes(data || []);

      console.log("[DEBUG] Sedes recibidas:", data);

      if (data && data.length === 0) {
        setError("No hay sedes disponibles. Crea una lectura primero.");
      }
    } catch (err: any) {
      console.error("Error cargando sedes:", err);

      console.error("Detalles del error:", {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });

      if (
        err.code === "ECONNABORTED" ||
        err.message === "Network Error" ||
        err.code === "ERR_NETWORK"
      ) {
        setError(
          "Error de conexión: No se pudo conectar con ninguna API disponible. Verifica el backend local o la URL de Cloud Run."
        );
      } else if (err.response?.status === 503) {
        setError(
          "Servicio temporalmente no disponible. La API está desplegada pero Cassandra no está conectado."
        );
      } else {
        setError(
          "Error al cargar sedes: " +
            (err.response?.data?.detail || err.message || "Error desconocido")
        );
      }
    }
  };

  const loadSensorTypes = async (sede: string) => {
    try {
      const data = await callApi<string[]>("/sensor_types", {
        params: { sede },
        timeout: 10000,
      });

      setSensorTypes(data || []);

      if (data && data.length === 0) {
        setError(
          `No hay tipos de sensores para la sede "${sede}". Crea una lectura primero.`
        );
      }
    } catch (err: any) {
      console.error("Error cargando tipos de sensores:", err);

      if (err.code === "ECONNABORTED" || err.message === "Network Error") {
        setError("Error de conexión: No se pudo conectar con la API.");
      } else {
        setError(
          "Error al cargar tipos de sensores: " +
            (err.response?.data?.detail || err.message)
        );
      }
    }
  };

  const loadReadings = async () => {
    if (!filters.sede || !filters.sensor_type) {
      setError("Por favor selecciona una sede y un tipo de sensor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await callApi<Reading[]>("/readings", {
        params: {
          sede: filters.sede,
          sensor_type: filters.sensor_type,
          limit: filters.limit,
        },
        timeout: 10000,
      });

      setReadings(data);
    } catch (err: any) {
      console.error("Error cargando lecturas:", err);

      if (err.code === "ECONNABORTED" || err.message === "Network Error") {
        setError("Error de conexión: No se pudo conectar con la API.");
      } else if (err.response?.status === 503) {
        setError(
          "Servicio no disponible: Cassandra no está conectado. El backend está funcionando pero necesita conexión a la base de datos."
        );
      } else {
        setError(err.response?.data?.detail || "Error al cargar lecturas");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReading = async (readingData: {
    sede: string;
    sensor_type: string;
    sensor_id: string;
    value: number;
  }) => {
    try {
      await callApi("/readings", {
        method: "POST",
        data: readingData,
        timeout: 10000,
      });
      // Recargar lecturas si los filtros coinciden
      if (
        filters.sede === readingData.sede &&
        filters.sensor_type === readingData.sensor_type
      ) {
        loadReadings();
      }

      // Recargar sedes por si es nueva
      loadSedes();
    } catch (err: any) {
      console.error("Error creando lectura:", err);

      if (err.code === "ECONNABORTED" || err.message === "Network Error") {
        throw new Error("Error de conexión: No se pudo conectar con la API.");
      } else if (err.response?.status === 503) {
        throw new Error(
          "Servicio no disponible: Cassandra no está conectado. El backend está funcionando pero necesita conexión a la base de datos."
        );
      } else {
        throw new Error(err.response?.data?.detail || "Error al crear lectura");
      }
    }
  };

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
