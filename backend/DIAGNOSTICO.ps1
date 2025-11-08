# Script de Diagnóstico para GPTMini Backend
# Este script verifica la configuración de la API key

Write-Host "🔍 Diagnóstico de GPTMini Backend" -ForegroundColor Cyan
Write-Host ""

$backendPath = $PSScriptRoot
if (-not $backendPath) {
    $backendPath = Get-Location
}

Write-Host "📁 Directorio del backend: $backendPath" -ForegroundColor Yellow
Write-Host ""

# 1. Verificar archivo .env
Write-Host "1️⃣ Verificando archivo .env..." -ForegroundColor Cyan
$envPath = Join-Path $backendPath ".env"
if (Test-Path $envPath) {
    Write-Host "   ✅ Archivo .env encontrado: $envPath" -ForegroundColor Green
    $envContent = Get-Content $envPath -Raw
    Write-Host "   📄 Contenido del archivo:" -ForegroundColor Yellow
    Write-Host "   ---" -ForegroundColor Gray
    # Mostrar solo los primeros caracteres de la API key por seguridad
    $envContent -replace '(OPENAI_API_KEY=)(.{10})(.*)', '$1$2***' | Write-Host
    Write-Host "   ---" -ForegroundColor Gray
    
    # Verificar formato
    if ($envContent -match 'OPENAI_API_KEY\s*=\s*(.+)') {
        $apiKey = $Matches[1].Trim()
        if ($apiKey -match '^"(.+)"$' -or $apiKey -match "^'(.+)'$") {
            Write-Host "   ⚠️  ADVERTENCIA: El archivo tiene comillas alrededor del valor" -ForegroundColor Yellow
            Write-Host "      El formato correcto es: OPENAI_API_KEY=sk-..." -ForegroundColor Yellow
        }
        if ($apiKey -match '^\s' -or $apiKey -match '\s$') {
            Write-Host "   ⚠️  ADVERTENCIA: Hay espacios al inicio o final del valor" -ForegroundColor Yellow
        }
        if ($apiKey -notmatch '^sk-') {
            Write-Host "   ⚠️  ADVERTENCIA: La API key no empieza con 'sk-'" -ForegroundColor Yellow
        }
        if ($apiKey.Length -lt 20) {
            Write-Host "   ⚠️  ADVERTENCIA: La API key parece muy corta" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ ERROR: No se encontró OPENAI_API_KEY en el archivo .env" -ForegroundColor Red
        Write-Host "      El archivo debe contener: OPENAI_API_KEY=sk-tu-api-key" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Archivo .env NO encontrado en: $envPath" -ForegroundColor Red
    Write-Host "   💡 Crea el archivo con el siguiente comando:" -ForegroundColor Yellow
    Write-Host "      @`"OPENAI_API_KEY=sk-tu-api-key-aqui`"@ | Out-File -FilePath .env -Encoding utf8 -NoNewline" -ForegroundColor White
}
Write-Host ""

# 2. Verificar variable de entorno del sistema
Write-Host "2️⃣ Verificando variable de entorno OPENAI_API_KEY..." -ForegroundColor Cyan
$envVar = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")
if ($envVar) {
    Write-Host "   ✅ Variable de entorno encontrada (primeros 10 caracteres): $($envVar.Substring(0, [Math]::Min(10, $envVar.Length)))..." -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Variable de entorno no configurada (esto está bien si usas archivo .env)" -ForegroundColor Yellow
}
Write-Host ""

# 3. Verificar variable de entorno de la sesión actual
Write-Host "3️⃣ Verificando variable de entorno de la sesión actual..." -ForegroundColor Cyan
if ($env:OPENAI_API_KEY) {
    Write-Host "   ✅ Variable de entorno de sesión encontrada (primeros 10 caracteres): $($env:OPENAI_API_KEY.Substring(0, [Math]::Min(10, $env:OPENAI_API_KEY.Length)))..." -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Variable de entorno de sesión no configurada (esto está bien si usas archivo .env)" -ForegroundColor Yellow
}
Write-Host ""

# 4. Verificar appsettings.Development.json
Write-Host "4️⃣ Verificando appsettings.Development.json..." -ForegroundColor Cyan
$appsettingsDevPath = Join-Path $backendPath "appsettings.Development.json"
if (Test-Path $appsettingsDevPath) {
    Write-Host "   ✅ Archivo appsettings.Development.json encontrado" -ForegroundColor Green
    try {
        $appsettings = Get-Content $appsettingsDevPath | ConvertFrom-Json
        if ($appsettings.OpenAI.ApiKey) {
            $apiKey = $appsettings.OpenAI.ApiKey
            Write-Host "   ✅ API key encontrada en appsettings (primeros 10 caracteres): $($apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)))..." -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  No se encontró OpenAI:ApiKey en appsettings.Development.json" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ ERROR al leer appsettings.Development.json: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Archivo appsettings.Development.json no encontrado (esto está bien si usas .env)" -ForegroundColor Yellow
}
Write-Host ""

# 5. Verificar paquete DotNetEnv
Write-Host "5️⃣ Verificando paquete DotNetEnv..." -ForegroundColor Cyan
$csprojPath = Join-Path $backendPath "GPTMini.csproj"
if (Test-Path $csprojPath) {
    $csprojContent = Get-Content $csprojPath -Raw
    if ($csprojContent -match 'DotNetEnv') {
        Write-Host "   ✅ Paquete DotNetEnv encontrado en GPTMini.csproj" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Paquete DotNetEnv NO encontrado en GPTMini.csproj" -ForegroundColor Red
        Write-Host "   💡 Ejecuta: dotnet add package DotNetEnv" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ No se encontró GPTMini.csproj" -ForegroundColor Red
}
Write-Host ""

# 6. Resumen y recomendaciones
Write-Host "📋 RESUMEN Y RECOMENDACIONES" -ForegroundColor Cyan
Write-Host ""

$hasEnvFile = Test-Path $envPath
$hasEnvVar = [bool]$env:OPENAI_API_KEY
$hasAppsettings = Test-Path $appsettingsDevPath

if (-not $hasEnvFile -and -not $hasEnvVar -and -not $hasAppsettings) {
    Write-Host "   ❌ No se encontró ninguna configuración de API key" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 SOLUCIÓN RECOMENDADA:" -ForegroundColor Yellow
    Write-Host "   1. Crea el archivo .env en el directorio backend:" -ForegroundColor White
    Write-Host "      cd $backendPath" -ForegroundColor Gray
    Write-Host "      @`"OPENAI_API_KEY=sk-tu-api-key-real`"@ | Out-File -FilePath .env -Encoding utf8 -NoNewline" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Edita el archivo .env y reemplaza 'sk-tu-api-key-real' con tu API key real" -ForegroundColor White
    Write-Host ""
    Write-Host "   3. Asegúrate de que el formato sea: OPENAI_API_KEY=sk-..." -ForegroundColor White
    Write-Host "      (sin comillas, sin espacios alrededor del =)" -ForegroundColor White
    Write-Host ""
    Write-Host "   4. Reinicia el backend: dotnet run" -ForegroundColor White
} elseif ($hasEnvFile) {
    Write-Host "   ✅ Tienes un archivo .env configurado" -ForegroundColor Green
    Write-Host "   💡 Asegúrate de:" -ForegroundColor Yellow
    Write-Host "      - Que el formato sea correcto: OPENAI_API_KEY=sk-... (sin comillas)" -ForegroundColor White
    Write-Host "      - Que hayas ejecutado 'dotnet restore' después de agregar el paquete DotNetEnv" -ForegroundColor White
    Write-Host "      - Que hayas reiniciado el backend después de crear/modificar el archivo .env" -ForegroundColor White
}

Write-Host ""
Write-Host "🔧 Para más información, consulta: CONFIGURAR_API_KEY.md" -ForegroundColor Cyan

