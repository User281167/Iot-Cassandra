# 🚀 Guía de Desarrollo Local

Esta guía te ayudará a ejecutar el proyecto completo localmente para probar todo antes de desplegar.

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 16+
- npm o yarn
- Acceso a la base de datos Cassandra (configurada en Cloud o local)

## 🔧 Configuración del Backend

### 1. Instalar dependencias

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
CASSANDRA_CONTACT_POINTS=10.128.0.2,10.128.0.3,10.128.0.4
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=iot
```

### 3. Ejecutar el servidor

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

El servidor estará disponible en:
- API: http://localhost:8000
- Documentación: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎨 Configuración del Frontend

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar URL de la API (opcional)

El frontend está configurado para usar `http://localhost:8000` por defecto.

Si necesitas cambiar la URL, puedes:
- Crear `frontend/.env.local`:
  ```
  VITE_API_URL=http://localhost:8000
  ```
- O editar directamente `frontend/src/App.tsx` línea 8

### 3. Ejecutar el frontend

```bash
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## 🏃 Ejecutar Todo

Abre **dos terminales**:

**Terminal 1 - Backend:**
```bash
# Activar entorno virtual
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Ejecutar API
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## ✅ Verificar que Todo Funciona

1. Abre http://localhost:5173 en tu navegador
2. Deberías ver la interfaz del sistema IoT
3. Intenta crear una lectura desde el formulario
4. Luego busca lecturas usando los filtros

## 🐛 Solución de Problemas

### Error: "Network Error" o "Error de conexión"
- Verifica que el backend esté corriendo en el puerto 8000
- Abre http://localhost:8000/docs para verificar que la API responde
- Revisa la consola del navegador (F12) para ver errores específicos

### Error: "CASSANDRA_CONTACT_POINTS no está configurado"
- Verifica que el archivo `.env` exista y tenga las variables correctas
- Asegúrate de que los contact points de Cassandra sean accesibles

### El frontend no muestra estilos
- Verifica que Tailwind CSS esté instalado: `npm install -D @tailwindcss/vite`
- Reinicia el servidor de desarrollo: `npm run dev`

## 📝 Notas

- El backend tiene CORS configurado para permitir peticiones desde cualquier origen en desarrollo
- El frontend usa variables de entorno de Vite (prefijo `VITE_`)
- Los cambios en el backend se recargan automáticamente gracias a `--reload`
- Los cambios en el frontend se recargan automáticamente con Vite HMR

## 🚀 Después de Probar Localmente

Una vez que todo funcione correctamente:

1. **Commitear cambios:**
   ```bash
   git add .
   git commit -m "feat: agregar frontend y configurar CORS"
   ```

2. **Subir a GitHub:**
   ```bash
   git push origin main
   ```

3. El encargado del despliegue puede desplegar en Cloud Run con los cambios actualizados.

