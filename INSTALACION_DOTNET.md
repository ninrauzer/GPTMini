# 📦 Instalación de .NET 8.0 SDK

## Opción 1: Instalador Visual (Recomendado)

1. **Descargar .NET 8.0 SDK:**
   - Visita: https://dotnet.microsoft.com/download/dotnet/8.0
   - Descarga el instalador para Windows (x64)
   - Busca la sección ".NET SDK 8.0.x" y descarga el instalador

2. **Ejecutar el instalador:**
   - Ejecuta el archivo `.exe` descargado
   - Sigue las instrucciones del instalador
   - Acepta los términos y condiciones
   - Selecciona "Install" y espera a que termine

3. **Verificar la instalación:**
   - Abre una nueva terminal PowerShell
   - Ejecuta: `dotnet --version`
   - Deberías ver algo como: `8.0.x`

## Opción 2: Instalación con Winget (Windows Package Manager)

Si tienes Winget instalado (Windows 11 o Windows 10 con Microsoft Store):

```powershell
winget install Microsoft.DotNet.SDK.8
```

## Opción 3: Instalación con Chocolatey

Si tienes Chocolatey instalado:

```powershell
choco install dotnet-8.0-sdk
```

## Verificar la Instalación

Después de instalar, **cierra y vuelve a abrir** tu terminal PowerShell, luego ejecuta:

```powershell
dotnet --version
```

Deberías ver la versión instalada (ejemplo: `8.0.101`).

## Solución de Problemas

### El comando `dotnet` no se reconoce después de instalar

1. **Cierra completamente** tu terminal PowerShell
2. Abre una **nueva** terminal PowerShell
3. Verifica nuevamente con: `dotnet --version`

Si aún no funciona:

1. Verifica que .NET esté en el PATH:
   ```powershell
   $env:PATH -split ';' | Select-String -Pattern "dotnet"
   ```

2. Reinicia tu computadora (a veces es necesario)

### Verificar la instalación completa

Ejecuta estos comandos para verificar:

```powershell
dotnet --version          # Versión del SDK
dotnet --list-sdks        # Lista de SDKs instalados
dotnet --list-runtimes    # Lista de runtimes instalados
```

## Después de Instalar

Una vez que .NET 8.0 esté instalado, vuelve al proyecto y ejecuta:

```powershell
cd GPTMini\backend
dotnet restore
dotnet run
```

## Enlaces Útiles

- 📥 **Descargar .NET 8.0 SDK:** https://dotnet.microsoft.com/download/dotnet/8.0
- 📚 **Documentación oficial:** https://learn.microsoft.com/dotnet/core/
- 🔧 **Herramientas de desarrollo:** https://dotnet.microsoft.com/download

