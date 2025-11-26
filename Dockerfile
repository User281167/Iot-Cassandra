# Imagen base mínima
FROM python:3.11-slim

# Evitar archivos .pyc y usar logs sin buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crear carpeta de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación
COPY . .

# Cloud Run usa PORT, por defecto 8080
ENV PORT=8080

# Comando de arranque
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
