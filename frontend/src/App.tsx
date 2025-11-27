import { useState, useEffect } from 'react'
import axios, { type AxiosRequestConfig } from 'axios'
import ReadingForm from './components/ReadingForm'
import ReadingList from './components/ReadingList'
import FilterPanel from './components/FilterPanel'

// URL de la API - cambiar según el entorno
// Para desarrollo local: 'http://localhost:8000'
// Para producción: 'https://iot-db-distribuida-252092889958.us-central1.run.app'
const DEFAULT_API_URL = import.meta.env.VITE_API_URL
const CLOUD_RUN_URL = 'https://iot-db-distribuida-252092889958.us-central1.run.app'
const LOCAL_URL = 'http://localhost:8000'

const API_CANDIDATES = Array.from(
  new Set(
    [DEFAULT_API_URL, LOCAL_URL, CLOUD_RUN_URL].filter(
      (url): url is string => Boolean(url && url.trim())
    )
  )
)

const getApiLabel = (url: string) => {
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return 'Backend local'
  }
  if (url.includes('run.app')) {
    return 'Cloud Run'
  }
  return 'API'
}

interface Reading {
  sede: string
  sensor_type: string
  sensor_id: string
  ts: string
  value: number
}

function App() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [sedes, setSedes] = useState<string[]>([])
  const [sensorTypes, setSensorTypes] = useState<string[]>([])
  const [activeApiUrl, setActiveApiUrl] = useState<string>(API_CANDIDATES[0])
  const [filters, setFilters] = useState({
    sede: '',
    sensor_type: '',
    limit: 20
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  const callApi = async <T = any>(
    path: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> => {
    let lastError: unknown
    for (const candidate of API_CANDIDATES) {
      try {
        const response = await axios({
          baseURL: candidate,
          url: path,
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
          ...config
        })
        setActiveApiUrl(candidate)
        setApiStatus('connected')
        return response.data as T
      } catch (err) {
        lastError = err
        console.warn(`[DEBUG] Error con ${candidate}${path}:`, err)
      }
    }
    setApiStatus('error')
    throw lastError
  }

  // Verificar conexión con la API al iniciar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('[DEBUG] Verificando conexión con las APIs configuradas')
        const ping = await callApi<{ status?: string; message?: string }>('/', { timeout: 5000 })
        console.log('[DEBUG] API Root:', ping)
        if (ping?.status === 'ok' || ping?.status === 'healthy') {
          loadSedes()
          return
        }
        loadSedes()
      } catch (err: any) {
        console.error('[DEBUG] Error verificando conexión:', err)
        // Intentar cargar sedes de todas formas
        loadSedes()
      }
    }
    checkConnection()
  }, [])

  // Cargar tipos de sensores cuando se selecciona una sede
  useEffect(() => {
    if (filters.sede) {
      loadSensorTypes(filters.sede)
    } else {
      setSensorTypes([])
    }
  }, [filters.sede])

  const loadSedes = async () => {
    try {
      console.log('[DEBUG] Cargando sedes con fallback de API')
      const data = await callApi<string[]>('/sedes', { timeout: 15000 })
      console.log('[DEBUG] Sedes recibidas:', data)
      setSedes(data || [])
      if (data && data.length === 0) {
        setError('No hay sedes disponibles. Crea una lectura primero.')
      }
    } catch (err: any) {
      console.error('Error cargando sedes:', err)
      console.error('Detalles del error:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      })
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('Error de conexión: No se pudo conectar con ninguna API disponible. Verifica el backend local o la URL de Cloud Run.')
      } else if (err.response?.status === 503) {
        setError('Servicio temporalmente no disponible. La API está desplegada pero Cassandra no está conectado.')
      } else {
        setError('Error al cargar sedes: ' + (err.response?.data?.detail || err.message || 'Error desconocido'))
      }
    }
  }

  const loadSensorTypes = async (sede: string) => {
    try {
      const data = await callApi<string[]>('/sensor_types', {
        params: { sede },
        timeout: 10000
      })
      setSensorTypes(data || [])
      if (data && data.length === 0) {
        setError(`No hay tipos de sensores para la sede "${sede}". Crea una lectura primero.`)
      }
    } catch (err: any) {
      console.error('Error cargando tipos de sensores:', err)
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        setError('Error de conexión: No se pudo conectar con la API.')
      } else {
        setError('Error al cargar tipos de sensores: ' + (err.response?.data?.detail || err.message))
      }
    }
  }

  const loadReadings = async () => {
    if (!filters.sede || !filters.sensor_type) {
      setError('Por favor selecciona una sede y un tipo de sensor')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await callApi<Reading[]>('/readings', {
        params: {
          sede: filters.sede,
          sensor_type: filters.sensor_type,
          limit: filters.limit
        },
        timeout: 10000
      })
      setReadings(data)
    } catch (err: any) {
      console.error('Error cargando lecturas:', err)
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        setError('Error de conexión: No se pudo conectar con la API.')
      } else if (err.response?.status === 503) {
        setError('Servicio no disponible: Cassandra no está conectado. El backend está funcionando pero necesita conexión a la base de datos.')
      } else {
        setError(err.response?.data?.detail || 'Error al cargar lecturas')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReading = async (readingData: {
    sede: string
    sensor_type: string
    sensor_id: string
    value: number
  }) => {
    try {
      await callApi('/readings', {
        method: 'POST',
        data: readingData,
        timeout: 10000
      })
      // Recargar lecturas si los filtros coinciden
      if (filters.sede === readingData.sede && filters.sensor_type === readingData.sensor_type) {
        loadReadings()
      }
      // Recargar sedes por si es nueva
      loadSedes()
    } catch (err: any) {
      console.error('Error creando lectura:', err)
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        throw new Error('Error de conexión: No se pudo conectar con la API.')
      } else if (err.response?.status === 503) {
        throw new Error('Servicio no disponible: Cassandra no está conectado. El backend está funcionando pero necesita conexión a la base de datos.')
      } else {
        throw new Error(err.response?.data?.detail || 'Error al crear lectura')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema IoT Distribuido
          </h1>
          <p className="text-gray-600">
            Gestión de lecturas de sensores con Apache Cassandra
          </p>
          <div className="mt-2 text-sm text-gray-500">
            API en uso:{' '}
            <span className="font-semibold text-indigo-600">
              {getApiLabel(activeApiUrl)} ({activeApiUrl})
            </span>
            <span className="ml-2 text-xs px-2 py-1 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50">
              {apiStatus === 'connected' ? 'Conectado' : apiStatus === 'checking' ? 'Verificando...' : 'Error'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
            {error.includes('Cassandra') && (
              <p className="text-sm mt-2 text-red-600">
                💡 Nota: Esto es normal en desarrollo local si no tienes acceso a Cassandra. 
                El sistema está funcionando correctamente, solo necesita la conexión a la base de datos para guardar/consultar datos.
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Lecturas ({readings.length})
          </h2>
          <ReadingList readings={readings} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default App

