# 🔑 Configurar OpenAI API Key

El error "Sorry, I encountered an error" generalmente significa que la API key de OpenAI no está configurada correctamente.

## 📦 Paso 1: Instalar el paquete DotNetEnv

Primero, asegúrate de tener el paquete necesario para leer archivos `.env`:

```powershell
cd GPTMini\backend
dotnet add package DotNetEnv
dotnet restore
```

## ⚡ Solución Rápida

### Opción 1: Variable de Entorno (Recomendado)

**En PowerShell (antes de ejecutar `dotnet run`):**

```powershell
cd GPTMini\backend
$env:OPENAI_API_KEY="sk-tu-api-key-real-aqui"
dotnet run
```

**⚠️ Importante:** Debes ejecutar este comando cada vez que abras una nueva terminal, o configurarlo permanentemente en tu sistema.

### Opción 2: Archivo .env (Recomendado)

1. **Crea el archivo `.env` en el directorio `backend/`:**
   ```powershell
   cd GPTMini\backend
   @"
OPENAI_API_KEY=sk-tu-api-key-real-aqui
"@ | Out-File -FilePath .env -Encoding utf8 -NoNewline
   ```

2. **Edita el archivo `.env`** y reemplaza `sk-tu-api-key-real-aqui` con tu API key real
   - ⚠️ **Importante:** No uses comillas, no dejes espacios alrededor del `=`
   - Formato correcto: `OPENAI_API_KEY=sk-abc123...`

3. **Verifica que el archivo existe:**
   ```powershell
   Get-ChildItem .env
   ```

4. **Ejecuta el backend:**
   ```powershell
   dotnet run
   ```

   Deberías ver en la consola: `✅ Archivo .env cargado desde: ...`

### Opción 3: Archivo appsettings.Development.json

1. **Copia el archivo de ejemplo:**
   ```powershell
   cd GPTMini\backend
   Copy-Item appsettings.Development.json.example appsettings.Development.json
   ```

2. **Edita `appsettings.Development.json`** y reemplaza `"sk-tu-api-key-aqui"` con tu API key real:
   ```json
   {
     "OpenAI": {
       "ApiKey": "sk-tu-api-key-real-aqui",
       "ApiUrl": "https://api.openai.com/v1/chat/completions",
       "Model": "gpt-3.5-turbo"
     }
   }
   ```

3. **Ejecuta el backend:**
   ```powershell
   dotnet run
   ```

## 🔍 Verificar que la API Key esté Configurada

Después de configurar, revisa los logs del backend. Deberías ver:

**Si está configurada correctamente:**
```
✅ Archivo .env cargado desde: E:\...\GPTMini\backend\.env
✅ OpenAI API key cargada desde: variable de entorno o archivo .env
   API Key (primeros 10 caracteres): sk-xxxxxxx...
```

**Si NO está configurada:**
```
⚠️  OpenAI API key NO configurada.
   Opciones:
   1. Crear archivo .env en el directorio backend con: OPENAI_API_KEY=tu-api-key
   2. Usar variable de entorno: $env:OPENAI_API_KEY='tu-api-key'
   3. Crear appsettings.Development.json con: {"OpenAI": {"ApiKey": "tu-api-key"}}
```

## 📝 Obtener tu API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create new secret key"
4. Copia la clave (empieza con `sk-`)
5. **Guárdala en un lugar seguro** - no la compartas

## 🚨 Solución de Problemas

### Error: "API key no configurada"
- Verifica que el archivo `.env` esté en `GPTMini/backend/.env` (no en otro directorio)
- Verifica el formato del archivo `.env`: `OPENAI_API_KEY=sk-...` (sin comillas, sin espacios)
- Asegúrate de que la API key empiece con `sk-`
- Verifica que el archivo se llame exactamente `.env` (no `.env.txt` o `env`)
- Reinicia el backend después de configurar la API key
- Si usas archivo `.env`, asegúrate de haber ejecutado `dotnet add package DotNetEnv` y `dotnet restore`

### Error: "401 Unauthorized"
- Tu API key es inválida o ha expirado
- Verifica que la copiaste correctamente (sin espacios)
- Genera una nueva API key en OpenAI

### Error: "Failed to connect to OpenAI API"
- Verifica tu conexión a internet
- Verifica que OpenAI no esté bloqueado por un firewall
- Prueba acceder a https://api.openai.com desde tu navegador

## 💡 Configuración Permanente (Opcional)

Para configurar la variable de entorno permanentemente en Windows:

1. Abre "Variables de entorno" en el Panel de Control
2. Crea una nueva variable de usuario:
   - Nombre: `OPENAI_API_KEY`
   - Valor: `sk-tu-api-key-aqui`
3. Reinicia tu terminal

Esto hará que la API key esté disponible en todas tus terminales.

