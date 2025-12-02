# Frontend - Sistema IoT Distribuido

Frontend desarrollado con React + TypeScript + Vite + Tailwind CSS para el sistema IoT distribuido con Apache Cassandra.

## Características

- Formulario para crear nuevas lecturas de sensores
- Panel de filtros para buscar lecturas por sede y tipo de sensor
- Tabla de resultados con todas las lecturas
- Interfaz moderna y responsive con Tailwind CSS
- Manejo de errores y estados de carga

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## API

El frontend está configurado para conectarse a la API desplegada en:
`https://iot-db-distribuida-252092889958.us-central1.run.app`

La documentación de la API se encuentra disponible en:
`https://iot-db-distribuida-252092889958.us-central1.run.app/docs`

## Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **Axios** - Cliente HTTP
