# ChatGPT Local v2 — Arquitectura Híbrida (.NET 8 + FastAPI + Chroma)

## 🧭 Visión
Plataforma local tipo ChatGPT que ofrece privacidad total, control de costos y capacidad de análisis de documentos con memoria semántica.  
Ejecución 100 % local en Linux o Windows.

## 🚀 Stack
| Capa | Tecnología | Rol |
|------|-------------|-----|
| Frontend | React + Vite + Tailwind | UI moderna con Markdown y streaming |
| Backend | .NET 8 Minimal API | Orquestación, control de tokens, subida de archivos |
| Microservicio | FastAPI + ChromaDB | Embeddings y búsqueda semántica |
| Persistencia | SQLite / Chroma local | Historial y memoria |
| Modelo | OpenAI / OpenRouter | Generación de texto |

## 🧩 Estructura

chatgpt-local/
├── backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   └── Program.cs
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── pages/
└── service/
    ├── main.py
    ├── requirements.txt
    └── data/embeddings/

## ⚙️ Instalación rápida
```bash
# Backend
cd backend
dotnet run

# Embeddings service
cd service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

## 🧠 Funcionalidades clave
- Chat tipo ChatGPT con render Markdown.  
- Subida de archivos (PDF, Word, TXT, PNG).  
- Memoria contextual vía embeddings locales.  
- Control local de costos y tokens.  

## 📅 Roadmap
1. ✅ MVP chat funcional (texto).  
2. ✅ Integración embeddings locales (FAISS/Chroma).  
3. 🔜 OCR para imágenes.  
4. 🔜 Panel de gestión de contexto.  
5. 🔜 Modo multicliente controlado (.NET).  

## 🛡️ Filosofía
**Privado · Local · Controlado · Extensible**
