#!/usr/bin/env python3
"""
Script para crear el keyspace y la tabla en Cassandra
Ejecutar: python setup_db.py
"""
import eventlet
eventlet.monkey_patch()

from cassandra.cluster import Cluster
from cassandra.policies import RoundRobinPolicy
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración
contact_points_str = os.getenv("CASSANDRA_CONTACT_POINTS", "127.0.0.1:9042")
contact_points = []
ports = []

# Separar host y puerto
for cp in contact_points_str.split(","):
    cp = cp.strip()
    if ":" in cp:
        host, port_str = cp.split(":")
        contact_points.append(host)
        ports.append(int(port_str))
    else:
        contact_points.append(cp)

port = ports[0] if ports else 9042

print(f"[CASSANDRA] Conectando a {contact_points} en puerto {port}...")

try:
    cluster = Cluster(
        contact_points=contact_points,
        port=port,
        load_balancing_policy=RoundRobinPolicy()
    )
    session = cluster.connect()
    
    print("[CASSANDRA] Conectado exitosamente")
    
    # Leer y ejecutar el schema
    schema_path = os.path.join(os.path.dirname(__file__), "..", "db", "schema.sql")
    
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = f.read()
    
    # Ejecutar cada comando CQL separado por punto y coma
    commands = [cmd.strip() for cmd in schema.split(";") if cmd.strip()]
    
    for command in commands:
        if command:
            print(f"[CASSANDRA] Ejecutando: {command[:50]}...")
            session.execute(command)
    
    print("[CASSANDRA] Keyspace y tabla creados exitosamente")
    print("[CASSANDRA] Verificando...")
    
    # Verificar que el keyspace existe
    result = session.execute("SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name = 'iot'")
    if result.one():
        print("[OK] Keyspace 'iot' creado")
    
    # Usar el keyspace y verificar la tabla
    session.execute("USE iot")
    result = session.execute("SELECT table_name FROM system_schema.tables WHERE keyspace_name = 'iot' AND table_name = 'readings'")
    if result.one():
        print("[OK] Tabla 'readings' creada")
    
    session.shutdown()
    cluster.shutdown()
    print("\n[CASSANDRA] Setup completado exitosamente!")
    
except Exception as e:
    print(f"[ERROR] Error al configurar Cassandra: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

