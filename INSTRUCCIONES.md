# 🚀 Guía de Ejecución - GPTMini

## Prerrequisitos

1. **.NET 8.0 SDK** - [Descargar aquí](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **Node.js 18+ y npm** - [Descargar aquí](https://nodejs.org/)
3. **OpenAI API Key** - Obtener de [OpenAI Platform](https://platform.openai.com/api-keys)

## Pasos para Ejecutar

### 1. Configurar el Backend

```powershell
# Navegar al directorio del backend
cd GPTMini\backend

# Crear archivo .env con tu API key (opcional, también puedes usar variables de entorno)
# Windows PowerShell:
$env:OPENAI_API_KEY="tu-api-key-aqui"

# O crear un archivo appsettings.Development.json (recomendado para desarrollo)
# Contenido:
# {
#   "OpenAI": {
#     "ApiKey": "tu-api-key-aqui"
#   }
# }

# Restaurar dependencias
dotnet restore

# Ejecutar el backend
dotnet run
```

El backend estará disponible en:
- `http://localhost:5000`
- `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger` (en modo desarrollo)

### 2. Configurar el Frontend (en otra terminal)

```powershell
# Navegar al directorio del frontend
cd GPTMini\frontend

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en:
- `http://localhost:5173`

### 3. Usar la Aplicación

1. Abre tu navegador en `http://localhost:5173`
2. Escribe un mensaje en el chat
3. Presiona Enter o haz clic en "Send"
4. ¡Disfruta conversando con GPT!

## Configuración de la API Key

### Opción 1: Variable de Entorno (Recomendado)

**Windows PowerShell:**
```powershell
$env:OPENAI_API_KEY="sk-tu-api-key-aqui"
```

**Windows CMD:**
```cmd
set OPENAI_API_KEY=sk-tu-api-key-aqui
```

### Opción 2: Archivo appsettings.Development.json

Crea un archivo `GPTMini/backend/appsettings.Development.json`:

```json
{
  "OpenAI": {
    "ApiKey": "sk-tu-api-key-aqui",
    "ApiUrl": "https://api.openai.com/v1/chat/completions",
    "Model": "gpt-3.5-turbo"
  }
}
```

⚠️ **Importante:** No subas este archivo a Git. Ya está en `.gitignore`.

## Solución de Problemas

### Error: "No se encuentra dotnet"
- Asegúrate de tener .NET 8.0 SDK instalado
- Verifica con: `dotnet --version`

### Error: "No se encuentra npm"
- Asegúrate de tener Node.js instalado
- Verifica con: `node --version` y `npm --version`

### Error: "401 Unauthorized" en el backend
- Verifica que tu API key de OpenAI sea válida
- Asegúrate de que la variable de entorno esté configurada correctamente

### Error de CORS
- Asegúrate de que el backend esté ejecutándose en el puerto 5000
- Verifica que el frontend esté en el puerto 5173

## Comandos Útiles

### Backend
```powershell
dotnet restore          # Restaurar dependencias
dotnet build            # Compilar el proyecto
dotnet run              # Ejecutar
dotnet watch run        # Ejecutar con recarga automática
```

### Frontend
```powershell
npm install             # Instalar dependencias
npm run dev             # Modo desarrollo
npm run build           # Compilar para producción
npm run preview         # Previsualizar build de producción
```

