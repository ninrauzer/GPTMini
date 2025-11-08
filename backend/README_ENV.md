# 📝 Configuración del archivo .env

## Ubicación del archivo .env

El archivo `.env` debe estar en el directorio `GPTMini/backend/`, al mismo nivel que `Program.cs` y `GPTMini.csproj`.

```
GPTMini/
└── backend/
    ├── .env              ← AQUÍ debe estar tu archivo .env
    ├── Program.cs
    ├── GPTMini.csproj
    └── ...
```

## Formato del archivo .env

El archivo `.env` debe tener el siguiente formato:

```
OPENAI_API_KEY=sk-tu-api-key-real-aqui
```

### ⚠️ Importante:

1. **No uses comillas** alrededor del valor:
   - ✅ Correcto: `OPENAI_API_KEY=sk-abc123...`
   - ❌ Incorrecto: `OPENAI_API_KEY="sk-abc123..."`

2. **No dejes espacios** alrededor del signo `=`:
   - ✅ Correcto: `OPENAI_API_KEY=sk-abc123...`
   - ❌ Incorrecto: `OPENAI_API_KEY = sk-abc123...`

3. **No agregues espacios** al inicio o final de la línea

4. **Asegúrate de que el archivo se llame exactamente `.env`** (con el punto al inicio)

## Crear el archivo .env

### En Windows (PowerShell):

```powershell
cd GPTMini\backend
@"
OPENAI_API_KEY=sk-tu-api-key-real-aqui
"@ | Out-File -FilePath .env -Encoding utf8 -NoNewline
```

### En Windows (Notepad):

1. Abre Notepad
2. Escribe: `OPENAI_API_KEY=sk-tu-api-key-real-aqui`
3. Guarda el archivo como `.env` (asegúrate de seleccionar "Todos los archivos" en el tipo de archivo)
4. Guárdalo en el directorio `GPTMini\backend\`

### Verificar que el archivo existe:

```powershell
cd GPTMini\backend
Get-ChildItem .env
```

## Verificar que se está cargando

Cuando ejecutes `dotnet run`, deberías ver en la consola:

```
✅ Archivo .env cargado desde: E:\Desarrollo\MiniGPT\GPTMini\backend\.env
✅ OpenAI API key cargada desde: variable de entorno o archivo .env
   API Key (primeros 10 caracteres): sk-xxxxxxx...
```

Si ves esto, el archivo `.env` se está cargando correctamente.

## Solución de Problemas

### El archivo .env no se encuentra

- Verifica que esté en `GPTMini/backend/.env`
- Verifica que el nombre sea exactamente `.env` (no `.env.txt` o `env`)
- Verifica que no tengas extensiones de archivo ocultas en Windows

### El archivo .env se carga pero la API key sigue vacía

- Verifica el formato del archivo (sin comillas, sin espacios)
- Verifica que no haya espacios al inicio o final de la línea
- Verifica que la API key empiece con `sk-`
- Reinicia el backend después de modificar el archivo

### Ver el contenido del archivo .env (sin mostrar la clave completa)

```powershell
cd GPTMini\backend
$content = Get-Content .env
$content -replace 'sk-[^=]*', 'sk-***'
```

