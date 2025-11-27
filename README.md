# 🚀 Sistema Distribuido IoT con Apache Cassandra + FastAPI (Google Cloud)

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

## ⚙️ Instalación de la API

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Archivo `.env`:

```
CASSANDRA_CONTACT_POINTS=10.128.0.2,10.128.0.3,10.128.0.4
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=iot
API_PORT=8000
```

Ejecutar:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

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



