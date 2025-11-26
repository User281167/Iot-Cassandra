import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from cassandra.cluster import Cluster
from cassandra.policies import DCAwareRoundRobinPolicy

# Variables de entorno inyectadas desde Cloud Run
CONTACT_POINTS = os.getenv("CASSANDRA_CONTACT_POINTS", "").split(",")
DATACENTER = os.getenv("CASSANDRA_DATACENTER", "datacenter1")
KEYSPACE = os.getenv("CASSANDRA_KEYSPACE", "iot")

app = FastAPI(title="IoT API - Cassandra Distributed")

cluster = None
session = None
cassandra_ok = False


class ReadingIn(BaseModel):
    sede: str
    sensor_type: str
    sensor_id: str
    value: float


@app.on_event("startup")
def startup():
    """
    Se ejecuta al arrancar Cloud Run.
    Aquí conectamos a Cassandra de forma segura.
    Si falla, la API sigue funcionando para no romper el contenedor.
    """
    global cluster, session, cassandra_ok

    try:
        print(f"🚀 Intentando conectar a Cassandra en: {CONTACT_POINTS}")

        if not CONTACT_POINTS or CONTACT_POINTS == [""]:
            print("⚠ CASSANDRA_CONTACT_POINTS está vacío.")
            cassandra_ok = False
            return

        cluster = Cluster(
            CONTACT_POINTS,
            load_balancing_policy=DCAwareRoundRobinPolicy(local_dc=DATACENTER),
            port=9042,
        )

        session = cluster.connect(KEYSPACE)
        cassandra_ok = True
        print("✅ Conectado a Cassandra correctamente.")

    except Exception as e:
        print(f"❌ Error al conectar a Cassandra: {e}")
        cassandra_ok = False
        # NO se lanza excepción para permitir que la API arranque


@app.get("/")
def root():
    """
    Endpoint simple para confirmar que la API está viva.
    """
    return {
        "status": "ok",
        "cassandra": "up" if cassandra_ok else "down",
        "message": "Sistema distribuido IoT en Cloud Run"
    }


@app.post("/readings")
def create_reading(reading: ReadingIn):
    """
    Insertar una lectura en Cassandra.
    """
    if not cassandra_ok or session is None:
        raise HTTPException(status_code=500, detail="Cassandra no disponible")

    ts = datetime.utcnow()

    query = """
        INSERT INTO readings (sede, sensor_type, sensor_id, ts, value)
        VALUES (%s, %s, %s, %s, %s)
    """

    session.execute(query, (
        reading.sede,
        reading.sensor_type,
        reading.sensor_id,
        ts,
        reading.value
    ))

    return {"status": "ok", "timestamp": ts.isoformat()}


@app.get("/readings")
def list_readings(sede: str, sensor_type: str, limit: int = 20):
    """
    Consultar lecturas almacenadas.
    """
    if not cassandra_ok or session is None:
        raise HTTPException(status_code=500, detail="Cassandra no disponible")

    query = """
        SELECT sede, sensor_type, sensor_id, ts, value
        FROM readings
        WHERE sede = %s AND sensor_type = %s
        LIMIT %s
    """

    rows = session.execute(query, (sede, sensor_type, limit))

    result = [
        {
            "sede": r.sede,
            "sensor_type": r.sensor_type,
            "sensor_id": r.sensor_id,
            "ts": r.ts.isoformat(),
            "value": r.value
        }
        for r in rows
    ]

    return result
