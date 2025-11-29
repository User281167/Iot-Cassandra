import React, { createContext, useContext, useEffect, useState } from "react";
import { callApi } from "../api/sensor.api";
import { type Reading } from "../utils/types";
import { dateGTMToLocal } from "../utils/utils";

interface SensorContextType {
  readings: Reading[];
  sedes: string[];
  sensorTypes: string[];
  loading: boolean;
  error: string | null;
  apiStatus: "checking" | "connected" | "error";
  filters: any;
  setFilters: (filters: any) => void;
  handleCreateReading: (readingData: any) => Promise<void>;
  loadReadings: () => Promise<void>;
}

const SensorContext = createContext<SensorContextType>({
  readings: [],
  sedes: [],
  sensorTypes: [],
  loading: false,
  error: null,
  apiStatus: "checking",
  filters: {
    sede: "",
    sensor_type: "",
    limit: 20,
  },
  setFilters: () => {},
  handleCreateReading: async () => {},
  loadReadings: async () => {},
});

export function SensorProvider({ children }: { children: React.ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [sedes, setSedes] = useState<string[]>([]);
  const [sensorTypes, setSensorTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  const [filters, setFilters] = useState({
    sede: "",
    sensor_type: "",
    limit: 20,
  });

  // Verificar conexión con la API al iniciar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("[DEBUG] Verificando conexión con las APIs configuradas");

        const ping = await callApi<{ status?: string; message?: string }>(
          "/",
          {
            timeout: 5000,
          },
          setApiStatus
        );

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

      const data = await callApi<string[]>(
        "/sedes",
        { timeout: 15000 },
        setApiStatus
      );

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
      const data = await callApi<string[]>(
        "/sensor_types",
        {
          params: { sede },
          timeout: 10000,
        },
        setApiStatus
      );

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
      const data = await callApi<Reading[]>(
        "/readings",
        {
          params: {
            sede: filters.sede,
            sensor_type: filters.sensor_type,
            limit: filters.limit,
          },
          timeout: 10000,
        },
        setApiStatus
      );

      const formatedReadings = data.map(reading => ({
        ...reading,
        ts: dateGTMToLocal(reading.ts),
      }));

      setReadings(formatedReadings);
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
      await callApi(
        "/readings",
        {
          method: "POST",
          data: readingData,
          timeout: 10000,
        },
        setApiStatus
      );

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
    <SensorContext.Provider
      value={{
        readings,
        sedes,
        sensorTypes,
        loading,
        error,
        apiStatus,
        handleCreateReading,
        filters,
        setFilters,
        loadReadings,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export const useSensorContext = () => useContext(SensorContext);
