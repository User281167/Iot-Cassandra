# 🚀 Sistema Distribuido IoT con Apache Cassandra + FastAPI

**Frontend React + Backend FastAPI + Apache Cassandra**

Este proyecto implementa un **sistema distribuido real** usando un clúster de **Apache Cassandra** desplegado en tres máquinas virtuales en Google Cloud Platform (GCP) y una API desarrollada con **FastAPI** para la ingestión y consulta de datos IoT.

El objetivo es demostrar conceptos fundamentales de los sistemas distribuidos:
- Alta disponibilidad  
- Replicación  
- Tolerancia a fallos  
- Transparencia  
- Escalabilidad horizontal  

---

## 🧱 Arquitectura General

### 📌 3 nodos Cassandra
- cass1 (seed) — 10.128.0.2  
- cass2 — 10.128.0.3  
- cass3 — 10.128.0.4  

### 📌 1 VM FastAPI
- api-iot (API pública)

---

## 📡 Flujo del Sistema

Cliente → API FastAPI → Driver Cassandra → Clúster Cassandra

<image src="./diagram.png" width="100%" />

---

## ⚡ Inicio Rápido (Desarrollo Local)

### Opción 1: Scripts Automáticos (Windows PowerShell)

**Terminal 1 - Backend:**
```powershell
.\start-backend.ps1
```

**Terminal 2 - Frontend:**
```powershell
.\start-frontend.ps1
```

### Opción 2: Manual

## ⚙️ Instalación y Desarrollo Local

### Backend (API FastAPI)

1. Crear entorno virtual e instalar dependencias:

```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Crear archivo `.env` en la raíz del proyecto:

```
CASSANDRA_CONTACT_POINTS=10.128.0.2,10.128.0.3,10.128.0.4
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=iot
```

3. Ejecutar la API:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

La API estará disponible en: `http://localhost:8000`
Documentación interactiva: `http://localhost:8000/docs`

### Frontend (React + Vite)

1. Instalar dependencias:

```bash
cd frontend
npm install
```

2. Configurar URL de la API (opcional):

Crear archivo `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```

O editar `frontend/src/App.tsx` y cambiar la constante `API_URL`.

3. Ejecutar en desarrollo:

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### Ejecutar Todo Localmente

1. **Terminal 1 - Backend:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

3. Abrir navegador en: `http://localhost:5173`

---

## 🗄️ Modelo de Datos

### Keyspace

```sql
CREATE KEYSPACE iot
WITH REPLICATION = {
   'class':'NetworkTopologyStrategy',
   'datacenter1':3
};
```

### Tabla

```sql
CREATE TABLE readings (
    sede text,
    sensor_type text,
    sensor_id text,
    ts timestamp,
    value double,
    PRIMARY KEY ((sede, sensor_type), ts, sensor_id)
) WITH CLUSTERING ORDER BY (ts DESC);
```

---

## 🌐 Endpoints

### **POST /readings**
Guarda una lectura IoT.

### **GET /readings**
Consulta lecturas por sede y tipo de sensor.

---

## 🧪 Ejemplo de Uso

Insertar:

```bash
curl -X POST "http://IP:8000/readings" -H "Content-Type: application/json" -d '{"sede":"Sede Norte","sensor_type":"temperature","sensor_id":"sensor-001","value":24.7}'
```

Consultar:

```bash
curl "http://IP:8000/readings?sede=Sede%20Norte&sensor_type=temperature"
```

---

## 🛡️ Tolerancia a Fallos

- Cassandra replica datos en 3 nodos (RF=3)
- FastAPI usa balanceo automático
- Si un nodo cae, el sistema sigue funcionando

---



