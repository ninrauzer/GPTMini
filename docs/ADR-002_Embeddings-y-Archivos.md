# ADR-002 — Análisis de Archivos y Embeddings Locales

**Estado:** Aprobado  
**Fecha:** 2025-11-09  
**Autor:** Olora  

## 1. Contexto
La app debe permitir al usuario subir archivos (PDF, Word, TXT, imágenes) para integrarlos como conocimiento contextual.  
Los textos extraídos se transformarán en embeddings y se almacenarán localmente en ChromaDB.  

## 2. Decisión
Implementar microservicio `embeddings-service` (FastAPI) con endpoints:
- **POST /embed** — ingesta de texto o fragmentos.  
- **POST /query** — recuperación por similitud.  

El backend .NET 8 reenviará archivos al servicio, consultará los fragmentos relevantes y enriquecerá el *prompt* antes de llamar a OpenAI/OpenRouter.

## 3. Flujo
Frontend → .NET (/api/upload) → FastAPI (/embed)
User msg → .NET (/api/chat) → FastAPI (/query) → OpenAI → respuesta

## 4. Extracción de texto
| Tipo | Librería | Estado |
|------|-----------|---------|
| PDF | `pypdf` | ✅ |
| DOCX | `python-docx` | ✅ |
| TXT | lectura directa | ✅ |
| Imágenes | `pytesseract` | 🔜 (fase 2) |

## 5. Persistencia
- Directorio: `embeddings-service/data/embeddings/`  
- Motor: Chroma Persistent Client  
- Cada fragmento contiene: `id`, `texto`, `embedding`, `metadata`.

## 6. Consecuencias
- Memoria semántica local disponible.  
- Chats enriquecidos con conocimiento externo.  
- Preparado para búsqueda RAG completa.
