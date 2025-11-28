import { useState } from 'react'

interface ReadingFormProps {
  sedes: string[]
  onCreateReading: (data: {
    sede: string
    sensor_type: string
    sensor_id: string
    value: number
  }) => Promise<void>
}

export default function ReadingForm({ sedes, onCreateReading }: ReadingFormProps) {
  const [formData, setFormData] = useState({
    sede: '',
    sensor_type: '',
    sensor_id: '',
    value: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.sede || !formData.sensor_type || !formData.sensor_id || !formData.value) {
      setError('Por favor completa todos los campos')
      return
    }

    const value = parseFloat(formData.value)
    if (isNaN(value)) {
      setError('El valor debe ser un número válido')
      return
    }

    setLoading(true)
    try {
      await onCreateReading({
        sede: formData.sede,
        sensor_type: formData.sensor_type,
        sensor_id: formData.sensor_id,
        value
      })
      setSuccess(true)
      setFormData({
        sede: formData.sede,
        sensor_type: formData.sensor_type,
        sensor_id: '',
        value: ''
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al crear la lectura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
          ✓ Lectura creada exitosamente
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sede
        </label>
        <input
          type="text"
          value={formData.sede}
          onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ej: Sede Norte"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Sensor
        </label>
        <input
          type="text"
          value={formData.sensor_type}
          onChange={(e) => setFormData({ ...formData, sensor_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ej: temperature, humidity, pressure"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID del Sensor
        </label>
        <input
          type="text"
          value={formData.sensor_id}
          onChange={(e) => setFormData({ ...formData, sensor_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ej: sensor-001"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor
        </label>
        <input
          type="number"
          step="any"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ej: 23.7"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Guardando...' : 'Crear Lectura'}
      </button>
    </form>
  )
}

