# 🧠 GPTMini

**ChatGPT Local** es un proyecto cooperativo para crear una versión autoalojada de ChatGPT que se ejecuta directamente en tu propio servidor Linux.  
Su objetivo es ofrecer la misma experiencia moderna de ChatGPT (Markdown, streaming, historial) pero **con control total de los datos y de los costos**, pagando solo por los tokens realmente usados.

---

## 🚀 Objetivo

El proyecto busca reemplazar la suscripción de **ChatGPT Plus (USD 20/mes)** por una alternativa local, privada y extensible, donde cada usuario:

- Tiene su **propio espacio de conversación y memoria**.
- Comparte una API Key común (OpenAI/OpenRouter) con **límite mensual de tokens**.
- Puede **exportar sus chats** en formato Markdown (`.md`).
- Usa una interfaz moderna tipo ChatGPT, sin depender de la nube.

---

## 🏗️ Arquitectura general

rontend (React + Vite + Tailwind)
│
▼
Backend (ASP.NET 8 Minimal API)
│
▼
API de OpenAI / OpenRouter


**Futuro módulo IA (Python / FastAPI):**
para resúmenes automáticos, embeddings, búsqueda semántica y análisis de sentimientos.

---

## 🧩 Stack tecnológico

| Capa | Tecnología | Función |
|------|-------------|---------|
| **Frontend** | React + Vite + Tailwind + shadcn/ui | Interfaz tipo ChatGPT, streaming, exportación a `.md`. |
| **Backend** | .NET 8 Minimal API | Control de usuarios, tokens, cuotas y conexión con OpenAI/OpenRouter. |
| **Persistencia** | SQLite / JSON local | Almacena historiales y consumo de tokens. |
| **Infraestructura** | Servidor Linux | Ejecución local sin contenedores. |
| **Futuro módulo IA** | FastAPI (Python) | Procesamiento semántico y analítica avanzada. |

---

## ⚙️ Instalación (modo desarrollo)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/chatgpt-local.git
cd chatgpt-local

cd backend
dotnet restore
dotnet run

OPENAI_API_KEY=sk-xxxxx
MODEL=gpt-4o-mini
TOKEN_LIMIT=100000

cd frontend
npm install
npm run dev

http://localhost:5173/
💡 Características del MVP

Streaming de respuestas en tiempo real (SSE).

Formato Markdown y bloques de código.

Historial de chat persistente por usuario.

Exportación de conversación a .md.

Control de tokens y costo estimado.

Ejecución local sin dependencias externas.

🧭 Roadmap
Fase	Descripción
MVP (actual)	Chat básico local, streaming, exportación, control de tokens.
Fase 2	Multiusuario completo con límites mensuales por usuario.
Fase 3	Módulo IA (FastAPI) para resúmenes, embeddings y análisis.
Fase 4	Sincronización cooperativa entre varias instalaciones.
🛡️ Privacidad

Ningún dato se almacena fuera del servidor local.

Las claves API se manejan únicamente en el backend.

Los historiales pueden eliminarse o exportarse libremente.

🤝 Contribuir

Este es un proyecto abierto y colaborativo.
Si quieres participar, aporta ideas, código o mejoras a la documentación.
El enfoque principal es mantener el sistema simple, privado y extensible.

📜 Licencia

MIT License — uso libre con atribución.