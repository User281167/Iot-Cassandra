# Frontend - Sistema IoT Distribuido

Frontend desarrollado con React + TypeScript + Vite + Tailwind CSS para el sistema IoT distribuido con Apache Cassandra.

## 🚀 Características

- ✅ Formulario para crear nuevas lecturas de sensores
- ✅ Panel de filtros para buscar lecturas por sede y tipo de sensor
- ✅ Tabla de resultados con todas las lecturas
- ✅ Interfaz moderna y responsive con Tailwind CSS
- ✅ Manejo de errores y estados de carga

## 📦 Instalación

```bash
npm install
```

## 🏃 Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Build para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## 🌐 API

El frontend está configurado para conectarse a la API desplegada en:
`https://iot-db-distribuida-252092889958.us-central1.run.app`

### Cambiar entre API Local y Producción

El frontend ahora detecta automáticamente si el backend local está disponible y, en caso de falla, usa la API pública en Cloud Run. Aun así puedes forzar un endpoint preferido con un archivo `.env.local`:

```env
# frontend/.env.local
# Prioriza tu backend local (se intentará primero)
VITE_API_URL=http://localhost:8000

# También puedes apuntar directamente a Cloud Run
# VITE_API_URL=https://iot-db-distribuida-252092889958.us-central1.run.app
```

> Si no defines la variable, el frontend intentará en este orden: valor de `VITE_API_URL`, `http://localhost:8000` y la URL de Cloud Run.

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── ReadingForm.tsx      # Formulario para crear lecturas
│   │   ├── ReadingList.tsx      # Tabla de lecturas
│   │   └── FilterPanel.tsx      # Panel de filtros
│   ├── App.tsx                  # Componente principal
│   ├── main.tsx                 # Punto de entrada
│   └── style.css                # Estilos de Tailwind
├── index.html
├── package.json
└── tailwind.config.js
```

## 🎨 Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **Axios** - Cliente HTTP

