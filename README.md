## Sistema IoT Distribuido

**Sistema Distribuido IoT con Apache Cassandra + FastAPI (Google Cloud)**  
Este proyecto integra un frontend React, una API FastAPI y un clúster Cassandra en GCP para demostrar conceptos clave de sistemas distribuidos: alta disponibilidad, replicación, tolerancia a fallos, transparencia y escalabilidad horizontal.

### API FastAPI
**Instalación:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Ejecución:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Endpoints:**
- `POST /readings`: Ingesta datos IoT
- `GET /readings`: Consulta por sede y tipo de sensor


### Frontend (React + TypeScript)
**Características:**
- Formulario de ingreso de lecturas
- Filtros por sede y tipo de sensor
- Tabla y gráfico de resultados con paginación

**Instalación:**
```bash
npm install
npm run dev
npm run build
```

**Conexión API:**
- [Documentación](https://iot-db-distribuida-252092889958.us-central1.run.app/docs)

### Simulación IoT (Wokwi)
Se incluye simulación de dispositivos IoT en Wokwi que emulan sensores de temperatura/humedad (DHT22) enviando datos a la API. El código simula lecturas y las transmite mediante HTTP, demostrando conectividad real con el sistema.

- [Simulación ESP32 - Sensor de Temperatura y Luz](https://wokwi.com/projects/448747698661687297)
- [Simulación ESP32 - Sensor de Gas (MQ-2)](https://wokwi.com/projects/448750230873692161)
- [Simulación ESP32 - Sensor de Movimiento y Distancia](https://wokwi.com/projects/449108364609552385)
