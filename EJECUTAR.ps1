# Script de Ejecución Rápida para GPTMini
# Este script ayuda a ejecutar el proyecto GPTMini

Write-Host "🚀 GPTMini - Script de Ejecución" -ForegroundColor Cyan
Write-Host ""

# Verificar prerrequisitos
Write-Host "Verificando prerrequisitos..." -ForegroundColor Yellow

# Verificar .NET
try {
    $dotnetVersion = dotnet --version
    Write-Host "✓ .NET encontrado: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ .NET no encontrado. Por favor instala .NET 8.0 SDK" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no encontrado. Por favor instala Node.js 18+" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm no encontrado. Por favor instala npm" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "¿Qué deseas hacer?" -ForegroundColor Cyan
Write-Host "1. Configurar proyecto (primera vez)"
Write-Host "2. Ejecutar Backend"
Write-Host "3. Ejecutar Frontend"
Write-Host "4. Ejecutar ambos (Backend + Frontend)"
Write-Host ""
$opcion = Read-Host "Selecciona una opción (1-4)"

switch ($opcion) {
    "1" {
        Write-Host "`n📦 Configurando proyecto..." -ForegroundColor Yellow
        
        # Backend
        Write-Host "`nConfigurando Backend..." -ForegroundColor Cyan
        Set-Location backend
        dotnet restore
        Write-Host "✓ Backend configurado" -ForegroundColor Green
        
        # Verificar si existe appsettings.Development.json
        if (-not (Test-Path "appsettings.Development.json")) {
            Write-Host "`n⚠ No se encontró appsettings.Development.json" -ForegroundColor Yellow
            Write-Host "Copia appsettings.Development.json.example y agrega tu API key" -ForegroundColor Yellow
            Write-Host "O configura la variable de entorno: `$env:OPENAI_API_KEY='tu-api-key'" -ForegroundColor Yellow
        }
        
        Set-Location ..
        
        # Frontend
        Write-Host "`nConfigurando Frontend..." -ForegroundColor Cyan
        Set-Location frontend
        npm install
        Write-Host "✓ Frontend configurado" -ForegroundColor Green
        Set-Location ..
        
        Write-Host "`n✅ Configuración completada!" -ForegroundColor Green
    }
    "2" {
        Write-Host "`n🔧 Ejecutando Backend..." -ForegroundColor Cyan
        Set-Location backend
        dotnet run
    }
    "3" {
        Write-Host "`n🎨 Ejecutando Frontend..." -ForegroundColor Cyan
        Set-Location frontend
        npm run dev
    }
    "4" {
        Write-Host "`n🚀 Ejecutando Backend y Frontend..." -ForegroundColor Cyan
        Write-Host "`nAbre dos terminales:" -ForegroundColor Yellow
        Write-Host "Terminal 1 (Backend):" -ForegroundColor Cyan
        Write-Host "  cd GPTMini\backend" -ForegroundColor White
        Write-Host "  dotnet run" -ForegroundColor White
        Write-Host "`nTerminal 2 (Frontend):" -ForegroundColor Cyan
        Write-Host "  cd GPTMini\frontend" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host "`nLuego abre: http://localhost:5173" -ForegroundColor Green
    }
    default {
        Write-Host "Opción inválida" -ForegroundColor Red
    }
}

