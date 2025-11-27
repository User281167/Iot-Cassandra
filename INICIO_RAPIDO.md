# 🚀 Inicio Rápido - Desarrollo Local

Guía rápida para iniciar el proyecto en desarrollo local.

## 📋 Requisitos

- Python 3.8+
- Node.js 16+
- npm o yarn

## ⚡ Inicio Rápido (2 terminales)

### Terminal 1 - Backend (API)

```powershell
# 1. Activar entorno virtual
venv\Scripts\Activate.ps1

# 2. Verificar que .env existe (debe tener las variables de Cassandra)
Get-Content .env

# 3. Ejecutar servidor
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

El backend estará en: **http://localhost:8000**
- Documentación: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Terminal 2 - Frontend

```powershell
# 1. Ir a la carpeta frontend
cd frontend

# 2. Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará en: **http://localhost:5173**

## ✅ Verificar que Todo Funciona

1. Abre http://localhost:5173 en tu navegador
2. Deberías ver la interfaz del sistema IoT
3. Abre la consola del navegador (F12) para ver los logs
4. Intenta crear una lectura desde el formulario

## 🔧 Configuración

### Archivo `.env` (Backend)

Debe estar en la raíz del proyecto con:

```env
CASSANDRA_CONTACT_POINTS=10.128.0.2,10.128.0.3,10.128.0.4
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=iot
```

**Nota**: Si no tienes acceso a Cassandra desde tu máquina local, el servidor iniciará pero mostrará advertencias. Los endpoints devolverán errores hasta que se configure la conexión.

### Frontend

El frontend está configurado para usar `http://localhost:8000` por defecto.

Para cambiar la URL, edita `frontend/src/App.tsx` línea 8 o crea `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

## 🐛 Solución de Problemas

### Error: "CASSANDRA_CONTACT_POINTS no está configurado"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que tiene el formato correcto (sin espacios extra)

### Error: "No se pudo conectar a Cassandra"
- Es normal si no tienes acceso a las IPs de Cloud desde tu máquina
- El servidor seguirá funcionando pero los endpoints de datos devolverán errores
- Para desarrollo, puedes usar una instancia local de Cassandra o ignorar el error

### Error: "Network Error" en el frontend
- Verifica que el backend esté corriendo en el puerto 8000
- Abre http://localhost:8000/docs para verificar
- Revisa la consola del navegador (F12) para más detalles

### El frontend no muestra estilos
- Verifica que Tailwind CSS esté instalado: `npm install -D @tailwindcss/vite`
- Reinicia el servidor: `npm run dev`

## 📝 Próximos Pasos

Una vez que todo funcione localmente:

1. Probar todas las funcionalidades
2. Hacer commit de los cambios
3. Subir a GitHub
4. El encargado del despliegue puede desplegar en Cloud Run

