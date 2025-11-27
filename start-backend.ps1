# Script para iniciar el backend en Windows PowerShell
Write-Host "Iniciando Backend..." -ForegroundColor Green

# Verificar que el entorno virtual existe
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Error: El entorno virtual no existe." -ForegroundColor Red
    Write-Host "Ejecuta primero: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# Verificar que .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Advertencia: El archivo .env no existe." -ForegroundColor Yellow
    Write-Host "Creando archivo .env con valores por defecto..." -ForegroundColor Yellow
    $content = "CASSANDRA_CONTACT_POINTS=10.128.0.2,10.128.0.3,10.128.0.4`nCASSANDRA_DATACENTER=datacenter1`nCASSANDRA_KEYSPACE=iot"
    [System.IO.File]::WriteAllText("$PWD\.env", $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Archivo .env creado" -ForegroundColor Green
}

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Verificar dependencias
Write-Host "Verificando dependencias..." -ForegroundColor Cyan
$null = python -c "import uvicorn" 2>&1

# Iniciar servidor
Write-Host "Iniciando servidor en http://localhost:8000" -ForegroundColor Green
Write-Host "Documentacion: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si hay errores, ejecuta: pip install -r requirements.txt" -ForegroundColor Yellow
Write-Host ""
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
