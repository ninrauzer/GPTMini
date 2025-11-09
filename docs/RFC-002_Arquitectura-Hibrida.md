# RFC-002 — Arquitectura Híbrida .NET 8 + FastAPI (Chroma)

**Estado:** Aprobado  
**Autor:** Olora  
**Fecha:** 2025-11-09  
**Versión:** 2.0

## 1. Contexto
El MVP “ChatGPT Local” ya es funcional como chat textual.  
El siguiente paso estratégico es dotarlo de **memoria contextual persistente y análisis de archivos**, integrando embeddings locales.  
Python + FastAPI se incorpora como microservicio nativo de **ChromaDB**, mientras el backend .NET 8 continúa como orquestador principal y punto de acceso para el frontend React.

## 2. Objetivos
- Mantener el control y seguridad en .NET 8.  
- Usar FastAPI + Chroma DB para memoria semántica local.  
- Permitir subir archivos (PDF, DOCX, TXT, imágenes) y convertirlos en conocimiento consultable.  
- Conservar la simplicidad del despliegue local.

## 3. Arquitectura general
Frontend (React + Vite + Tailwind)
   │
   ▼
Backend (.NET 8)
   ├─ ChatController      → orquesta peticiones
   ├─ FileController      → subida de archivos
   ├─ EmbeddingProxySvc   → comunica con FastAPI
   └─ ContextStore        → historial + tokens
   ▼
Microservicio FastAPI
   ├─ /embed   → ingesta texto/archivos → embeddings
   ├─ /query   → búsqueda semántica
   └─ ChromaDB persistente (./data/embeddings)
   > 💡 **Nota:**  
   > **EVOLUCION:** ChromaDB (Python local) → FAISS (rendimiento) → Milvus / Qdrant (producción distribuida)


## 4. Beneficios
- Desacopla IA de la capa de control.  
- Escalable a nuevos servicios Python (OCR, summarizer).  
- Persistencia local sin nube.  
- Fácil mantenimiento (ambos servicios independientes).

## 5. Impacto en componentes existentes
| Componente | Estado | Cambio |
|-------------|---------|---------|
| Backend .NET | Activo | Añade servicio `EmbeddingProxyService` |
| Frontend React | Activo | Añade botón “Adjuntar archivo” |
| FastAPI Service | Nuevo | Provee `/embed` y `/query` |
| DB local | Nuevo | ChromaDB persistente |

## 6. Decisión
Se adopta arquitectura híbrida:  
**.NET 8 → núcleo seguro**  
**Python FastAPI → inteligencia contextual**

## 7. Próximos pasos
1. Crear carpeta `service/`.  
2. Implementar endpoints `/embed` y `/query`.  
3. Conectar .NET 8 → FastAPI vía HTTP.  
4. Probar recuperación contextual con documentos de muestra.
