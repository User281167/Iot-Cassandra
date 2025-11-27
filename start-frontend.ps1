# Script para iniciar el frontend en Windows PowerShell
Write-Host "Iniciando Frontend..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto o cambiar a frontend
if (-not (Test-Path "frontend\package.json")) {
    if (Test-Path "package.json") {
        Write-Host "Cambiando a directorio frontend..." -ForegroundColor Cyan
        Set-Location frontend
    } else {
        Write-Host "Error: No se encontro el directorio frontend" -ForegroundColor Red
        exit 1
    }
} else {
    Set-Location frontend
}

# Verificar que node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificar que .env.local existe (opcional)
if (-not (Test-Path ".env.local")) {
    Write-Host "Tip: Puedes crear .env.local para configurar VITE_API_URL" -ForegroundColor Cyan
    Write-Host "   Ejemplo: VITE_API_URL=http://localhost:8000" -ForegroundColor Gray
}

# Iniciar servidor de desarrollo
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API: http://localhost:8000 (asegurate de que el backend este corriendo)" -ForegroundColor Cyan
Write-Host ""
npm run dev
