# Sistema Distribuido de Base de Datos IoT con Apache Cassandra
## Proyecto Final – Sistemas Distribuidos

Este proyecto implementa un sistema distribuido real basado en Apache Cassandra, con el objetivo de almacenar y consultar lecturas generadas por sensores IoT desplegados en múltiples sedes. El enfoque principal es demostrar los conceptos fundamentales de los sistemas distribuidos: particionamiento, replicación, tolerancia a fallos, transparencia, disponibilidad y consistencia ajustable.

## Objetivo del Proyecto
Diseñar e implementar un cluster de Cassandra de 2–3 nodos, configurados sin Docker (instalación manual), y construir un servicio backend que permita:
- Registrar lecturas IoT mediante una API REST.
- Consultar lecturas filtradas por sede, tipo de sensor y rango de tiempo.
- Mostrar las propiedades distribuidas del sistema mediante pruebas de replicación, caída de nodos, transparencia y consistencia.

## Arquitectura del Sistema
### 1. Cluster de Apache Cassandra (2–3 nodos)
Cada nodo posee:
- cassandra.yaml propio
- Directorios independientes de datos y logs
- Puertos distintos

### 2. Backend (Node.js + Express)
Endpoints:
- POST /readings
- GET /readings

### 3. Cliente / Scripts de prueba
Scripts para testear:
- Alta disponibilidad
- Replicación
- Consistencia
- Transparencia ante fallos

## Modelo de Datos (CQL)
```
CREATE KEYSPACE iot
WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 2 };

USE iot;

CREATE TABLE readings (
    sede         text,
    sensor_type  text,
    sensor_id    text,
    ts           timestamp,
    value        double,
    PRIMARY KEY ((sede, sensor_type), ts, sensor_id)
) WITH CLUSTERING ORDER BY (ts DESC);
```

## Despliegue del Sistema (sin Docker)
1. Instalar Apache Cassandra
2. Crear carpetas para cada nodo
3. Configurar cassandra.yaml para cada instancia
4. Iniciar nodos:
```
CASSANDRA_CONF=/ruta/node1/conf cassandra -R
CASSANDRA_CONF=/ruta/node2/conf cassandra -R
CASSANDRA_CONF=/ruta/node3/conf cassandra -R
```
5. Verificar cluster:
```
nodetool status
```

## Pruebas del Sistema Distribuido
- Replicación
- Caída y recuperación de nodos
- Niveles de consistencia
- Balanceo y transparencia

## Conclusiones esperadas
- Cassandra maneja replicación, fallos y consistencia automáticamente
- El cliente es completamente transparente al nodo que responde
- El sistema es altamente disponible y escalable horizontalmente
