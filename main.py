# main.py
import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cassandra.cluster import Cluster
from cassandra.policies import DCAwareRoundRobinPolicy
import httpx

from dotenv import load_dotenv
from pathlib import Path
import os

# Cargar variables de entorno desde .env en la raíz del proyecto
# Obtener el directorio donde está main.py
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

# Cargar .env si existe
if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE, override=True)
    print(f"[DEBUG] Archivo .env cargado desde: {ENV_FILE}")
else:
    # Intentar cargar desde el directorio actual de trabajo
    load_dotenv(override=True)
    print(f"[DEBUG] Intentando cargar .env desde directorio actual: {Path.cwd()}")

# Leer variables de entorno
CONTACT_POINTS_STR = os.getenv("CASSANDRA_CONTACT_POINTS", "").strip()
CONTACT_POINTS = [cp.strip() for cp in CONTACT_POINTS_STR.split(",") if cp.strip()] if CONTACT_POINTS_STR else []
DATACENTER = os.getenv("CASSANDRA_DATACENTER", "datacenter1")
KEYSPACE = os.getenv("CASSANDRA_KEYSPACE", "iot")

# URL de la API de Cloud Run como fallback
CLOUD_RUN_API_URL = os.getenv("CLOUD_RUN_API_URL", "https://iot-db-distribuida-252092889958.us-central1.run.app")

# Debug: mostrar valores cargados (solo en desarrollo)
# Comentar estas líneas en producción
# print(f"[DEBUG] BASE_DIR: {BASE_DIR}")
# print(f"[DEBUG] ENV_FILE: {ENV_FILE}")
# print(f"[DEBUG] ENV_FILE existe: {ENV_FILE.exists()}")
# print(f"[DEBUG] CONTACT_POINTS_STR: '{CONTACT_POINTS_STR}'")
# print(f"[DEBUG] CONTACT_POINTS: {CONTACT_POINTS}")

app = FastAPI(title="IoT Readings API - Cassandra Distributed (Cloud Run)")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

cluster = None
session = None


class ReadingIn(BaseModel):
    sede: str
    sensor_type: str
    sensor_id: str
    value: float


@app.on_event("startup")
def startup():
    global cluster, session

    if not CONTACT_POINTS:
        raise RuntimeError(f"CASSANDRA_CONTACT_POINTS no está configurado. Valor actual: {CONTACT_POINTS_STR}")

    try:
        cluster = Cluster(
            CONTACT_POINTS,
            load_balancing_policy=DCAwareRoundRobinPolicy(local_dc=DATACENTER),
            port=9042,  # muy importante
            connect_timeout=10,  # Timeout para desarrollo
        )
        session = cluster.connect(KEYSPACE)
        print(f"[APP] ✅ Conectado a Cassandra en {CONTACT_POINTS}")
        print(f"[APP] Keyspace: {KEYSPACE}, Datacenter: {DATACENTER}")
    except Exception as e:
        print(f"[APP] ⚠️  ADVERTENCIA: No se pudo conectar a Cassandra: {e}")
        print(f"[APP] El servidor iniciará en modo desarrollo sin Cassandra.")
        print(f"[APP] Los endpoints devolverán errores hasta que se configure la conexión.")
        print(f"[APP] Para desarrollo local, puedes usar una instancia local de Cassandra o")
        print(f"[APP] configurar acceso a las IPs de Cloud en el archivo .env")
        cluster = None
        session = None


@app.on_event("shutdown")
def shutdown():
    global cluster
    if cluster:
        cluster.shutdown()


@app.get("/")
def root():
    return {
        "status": "ok", 
        "message": "IoT API running on Cloud Run",
        "cassandra_connected": session is not None
    }

@app.get("/health")
def health():
    """Endpoint de salud para verificar que la API está funcionando"""
    return {
        "status": "healthy",
        "cassandra_connected": session is not None,
        "api_url": "https://iot-db-distribuida-252092889958.us-central1.run.app"
    }


@app.post("/readings")
def create_reading(reading: ReadingIn):
    if not session:
        raise HTTPException(status_code=503, detail="Servicio no disponible: Cassandra no está conectado")
    ts = datetime.utcnow()
    query = """
        INSERT INTO readings (sede, sensor_type, sensor_id, ts, value)
        VALUES (%s, %s, %s, %s, %s)
    """
    session.execute(
        query,
        (reading.sede, reading.sensor_type, reading.sensor_id, ts, reading.value),
    )
    return {"status": "ok", "timestamp": ts.isoformat()}


@app.get("/readings")
def list_readings(sede: str, sensor_type: str, limit: int = 20):
    # Intentar obtener de Cassandra local primero
    if session:
        try:
            query = """
                SELECT sede, sensor_type, sensor_id, ts, value
                FROM readings
                WHERE sede = %s AND sensor_type = %s
                LIMIT %s
            """
            rows = session.execute(query, (sede, sensor_type, limit))
            return [
                {
                    "sede": r.sede,
                    "sensor_type": r.sensor_type,
                    "sensor_id": r.sensor_id,
                    "ts": r.ts.isoformat(),
                    "value": r.value,
                }
                for r in rows
            ]
        except Exception as e:
            print(f"[APP] Error consultando Cassandra local: {e}")
    
    # Fallback: obtener de la API de Cloud Run
    try:
        print(f"[APP] Obteniendo readings desde Cloud Run: {CLOUD_RUN_API_URL}/readings")
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                f"{CLOUD_RUN_API_URL}/readings",
                params={"sede": sede, "sensor_type": sensor_type, "limit": limit}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"[APP] Error obteniendo readings desde Cloud Run: {e}")
        raise HTTPException(status_code=503, detail="Servicio no disponible: No se pudo conectar a Cassandra ni a Cloud Run")


@app.get("/sedes")
def list_sedes():
    # Intentar obtener de Cassandra local primero
    if session:
        try:
            query = "SELECT DISTINCT sede, sensor_type FROM readings"
            rows = session.execute(query)
            sedes = list(set(r.sede for r in rows))
            if sedes:
                return sedes
        except Exception as e:
            print(f"[APP] Error consultando Cassandra local: {e}")
    
    # Fallback: obtener de la API de Cloud Run
    try:
        print(f"[APP] Obteniendo sedes desde Cloud Run: {CLOUD_RUN_API_URL}/sedes")
        with httpx.Client(timeout=10.0) as client:
            response = client.get(f"{CLOUD_RUN_API_URL}/sedes")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"[APP] Error obteniendo sedes desde Cloud Run: {e}")
        return []  # Retorna lista vacía si falla todo


@app.get("/sensor_types")
def list_sensor_types(sede: str):
    # Intentar obtener de Cassandra local primero
    if session:
        try:
            query = "SELECT DISTINCT sede, sensor_type FROM readings"
            rows = session.execute(query)
            filtered = [r for r in rows if r.sede == sede]
            sensor_types = list(set(r.sensor_type for r in filtered))
            if sensor_types:
                return sensor_types
        except Exception as e:
            print(f"[APP] Error consultando Cassandra local: {e}")
    
    # Fallback: obtener de la API de Cloud Run
    try:
        print(f"[APP] Obteniendo sensor_types desde Cloud Run: {CLOUD_RUN_API_URL}/sensor_types?sede={sede}")
        with httpx.Client(timeout=10.0) as client:
            response = client.get(f"{CLOUD_RUN_API_URL}/sensor_types", params={"sede": sede})
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"[APP] Error obteniendo sensor_types desde Cloud Run: {e}")
        return []  # Retorna lista vacía si falla todo
