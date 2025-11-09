# ADR-002 — Análisis de Archivos y Embeddings Locales

**Estado:** En implementación (Fase 1 completada)  
**Fecha:** 2025-11-09  
**Última actualización:** 2025-11-09  
**Autor:** Olora  

## 1. Contexto
La app debe permitir al usuario subir archivos (PDF, Word, TXT, imágenes) para integrarlos como conocimiento contextual.  
Los textos extraídos se transformarán en embeddings y se almacenarán localmente en ChromaDB.  

## 2. Decisión

### Fase 1: Upload Básico con Vision API ✅ **COMPLETADO**
**Fecha implementación:** 2025-11-09

Implementar soporte básico de archivos con GPT-4 Vision para imágenes:
- Upload de archivos desde frontend (botón, Ctrl+V, drag&drop)
- Análisis directo de imágenes con Vision API
- Preview de archivos antes de enviar
- Límites: 2 archivos, 10MB total

**Componentes implementados:**
- `FileAttachment.tsx` - Preview visual de archivos adjuntos
- `InputBar.tsx` - Botón adjuntar, paste, drag&drop
- `ChatController.cs` - Acepta FormData con archivos
- `OpenAIService.GetChatResponseWithFilesAsync()` - Vision API integration

### Fase 2: Embeddings Locales 🔜 **PENDIENTE**
Implementar microservicio `embeddings-service` (FastAPI) con endpoints:
- **POST /embed** — ingesta de texto o fragmentos.  
- **POST /query** — recuperación por similitud.  

El backend .NET 8 reenviará archivos al servicio, consultará los fragmentos relevantes y enriquecerá el *prompt* antes de llamar a OpenAI/OpenRouter.

## 3. Flujo

### Fase 1 (Actual):
```
Frontend → .NET (/api/chat + FormData) → OpenAI Vision API → respuesta
```

### Fase 2 (Futura):
```
Frontend → .NET (/api/upload) → FastAPI (/embed)
User msg → .NET (/api/chat) → FastAPI (/query) → OpenAI → respuesta
```

## 4. Extracción de texto / Análisis

### Fase 1 ✅
| Tipo | Método | Estado |
|------|--------|---------|
| Imágenes (PNG, JPEG, GIF, WEBP) | GPT-4 Vision API | ✅ Implementado |
| Análisis directo | Sin extracción previa | ✅ Implementado |

### Fase 2 🔜
| Tipo | Librería | Estado |
|------|-----------|---------|
| PDF | `pypdf` | 🔜 Pendiente |
| DOCX | `python-docx` | 🔜 Pendiente |
| TXT | lectura directa | 🔜 Pendiente |
| OCR Imágenes | `pytesseract` | 🔜 Pendiente |

## 5. Implementación Fase 1

### Frontend
- **Componentes nuevos:**
  - `FileAttachment.tsx` - Preview con miniaturas y metadata
  - Modificado `InputBar.tsx` con:
    - Botón 📎 adjuntar
    - Paste de imágenes (Ctrl+V)
    - Drag & drop
    - Validación de tipos y tamaño
  
- **Tipos aceptados:**
  - Imágenes: PNG, JPEG, JPG, GIF, WEBP
  - Documentos: PDF, DOCX, TXT (preparados para Fase 2)

- **Límites:**
  - Máximo 2 archivos por mensaje
  - 10MB total

### Backend
- **ChatController:**
  - Acepta `FormData` (con archivos) y `JSON` (sin archivos)
  - Parámetros: `messages`, `model`, `files[]`

- **OpenAIService:**
  - `GetChatResponseWithFilesAsync()` - Procesa imágenes con Vision API
  - Conversión automática a base64
  - Construcción de mensajes multimodales para OpenAI

## 6. Persistencia

### Fase 1
- No hay persistencia de archivos (análisis en tiempo real)
- Imágenes se convierten a base64 en memoria

### Fase 2 🔜
- Directorio: `embeddings-service/data/embeddings/`  
- Motor: Chroma Persistent Client  
- Cada fragmento contiene: `id`, `texto`, `embedding`, `metadata`

## 7. Consecuencias

### Fase 1 (Actual)
✅ **Positivas:**
- Los usuarios pueden adjuntar y analizar imágenes inmediatamente
- Experiencia fluida con paste, drag&drop y botón
- No requiere infraestructura adicional
- Funciona con cualquier modelo Vision de OpenAI

⚠️ **Limitaciones:**
- Sin memoria persistente de archivos
- Solo imágenes (PDFs y DOCX preparados pero sin procesar)
- Costo de tokens por análisis de imágenes

### Fase 2 (Futura)
✅ **Beneficios esperados:**
- Memoria semántica local disponible
- Chats enriquecidos con conocimiento externo
- Búsqueda RAG completa
- Procesamiento de PDFs y documentos

## 8. Próximos Pasos

1. ✅ **Fase 1 completada** - Upload y Vision API
2. 🔜 Extracción de texto de PDFs y DOCX
3. 🔜 Microservicio FastAPI para embeddings
4. 🔜 ChromaDB local para vectores
5. 🔜 Panel de gestión de documentos
6. 🔜 Búsqueda semántica (RAG)
