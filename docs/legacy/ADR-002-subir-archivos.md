# ADR-002: Implementación de Subida y Análisis de Archivos Adjuntos

**Estado:** Propuesto  
**Fecha:** 2025-11-09  
**Decisores:** Equipo de desarrollo  
**Contexto:** GPTMini debe permitir a los usuarios subir archivos adjuntos para que puedan ser procesados y analizados por el modelo GPT.  
---

## Contexto y Problema

Actualmente, GPTMini solo admite texto como entrada. Los usuarios no pueden subir documentos, imágenes, ni archivos CSV, PDF o de texto para que el modelo los analice o extraiga información. Esto limita los casos de uso, especialmente para usuarios que desean:

1. Analizar reportes, planillas o contratos sin copiar todo el contenido.  
2. Extraer resúmenes, métricas o insights desde archivos.  
3. Conversar directamente sobre el contenido de un archivo (por ejemplo: “resúmeme este PDF” o “filtra este CSV”).  

### Restricciones

- El objetivo inicial es soportar archivos **pequeños y medianos (<10 MB)**.  
- Se prioriza la simplicidad del flujo (drag & drop, seleccionar archivo, o pegar contenido).  
- No se debe depender de un backend complejo ni almacenamiento persistente en servidores externos.  
- El procesamiento se hará en memoria, dentro de la sesión actual.  
- El sistema debe identificar el tipo de archivo (MIME type o extensión) para ajustar la estrategia de lectura.  

---

## Opciones Consideradas

### Opción 1: Procesamiento Local (Frontend-Only)

**Descripción:**  
El archivo se lee completamente en el navegador mediante FileReader, y su contenido (texto, JSON, CSV, etc.) se envía al modelo en un prompt para análisis.

**Ventajas:**
- ✅ Sin dependencia de backend.  
- ✅ Implementación rápida.  
- ✅ Total privacidad (el archivo nunca sale del navegador).  
- ✅ Ideal para desarrollo local o uso individual.  

**Desventajas:**
- ❌ Limitado a archivos de texto.  
- ❌ No puede procesar binarios complejos (PDF, imágenes).  
- ❌ Carga de memoria en el navegador.  
- ❌ No se puede dividir o procesar archivos grandes eficientemente.  

**Implementación sugerida:**
```typescript
const handleFileUpload = async (file: File) => {
  const text = await file.text();
  setMessages(prev => [...prev, { role: 'user', content: text }]);
};
```

---

### Opción 2: Backend Temporal de Archivos (Subida + Análisis)

**Descripción:**  
El archivo se sube a un endpoint backend temporal que guarda el archivo de forma efímera (en `/tmp`) y lo procesa (por ejemplo, extrayendo texto de PDF o leyendo CSV).  
Luego, se envía el contenido procesado al modelo.

**Ventajas:**
- ✅ Permite manejar más tipos de archivo (PDF, DOCX, CSV, JSON, imágenes).  
- ✅ Control total del pipeline (preprocesamiento, sanitización, limpieza).  
- ✅ Posibilidad de usar librerías especializadas (pdf.js, textract, etc.).  
- ✅ Escalable para una versión multiusuario futura.  

**Desventajas:**
- ❌ Requiere agregar backend (API REST o controlador ASP.NET).  
- ❌ Se debe gestionar almacenamiento temporal y limpieza.  
- ❌ Aumenta la superficie de ataque (archivos maliciosos).  
- ❌ Más complejidad de despliegue.  

**Stack sugerido:**
- Backend: ASP.NET Core (API Controller `/api/files/upload`).  
- Librerías:  
  - PDF: `PdfPig` o `iText7`  
  - DOCX: `OpenXML SDK`  
  - CSV: `CsvHelper`  
- Almacenamiento temporal: `IFormFile` + carpeta `TempFiles/` con autolimpieza.

---

### Opción 3: Integración con API de OpenAI (File API)

**Descripción:**  
Subir archivos directamente al endpoint de archivos de OpenAI, y usar la API para asociar ese archivo a una sesión o análisis.

**Ventajas:**
- ✅ Soporte nativo de archivos.  
- ✅ No requiere procesar contenido manualmente.  
- ✅ Ideal si se usa el modelo “gpt-4o-mini” con herramientas.  
- ✅ Se aprovecha la capacidad de embeddings o análisis estructurado.  

**Desventajas:**
- ❌ Requiere clave de API válida y cuota de archivos.  
- ❌ Costos por token adicionales.  
- ❌ Dependencia externa (no funciona offline).  
- ❌ Menor control sobre preprocesamiento.  

---

## Decisión

**Se recomienda implementar la Opción 2: Backend Temporal de Archivos**, combinando lectura local simple (para texto y CSV) con soporte extendido en backend.

### Fase 1: Frontend (Implementación Inmediata)

**Objetivo:** Permitir subir archivos locales desde el navegador, extraer su contenido y pasarlo al modelo como texto.

#### Funcionalidades:
1. **UI de subida**: botón “📎 Adjuntar archivo” y drag & drop.  
2. **Tipos soportados:** `.txt`, `.csv`, `.json`, `.md`, `.pdf` (experimental).  
3. **Lectura local con FileReader.**  
4. **Visualización del nombre y tamaño del archivo.**  
5. **Confirmación antes de enviar al modelo.**

```typescript
<input type="file" accept=".txt,.csv,.json,.md,.pdf" onChange={handleFileUpload} />
```

### Fase 2: Backend (Extensión futura)

1. Endpoint `/api/files/upload` (POST multipart/form-data).  
2. Validación de tamaño y tipo de archivo.  
3. Extracción de texto (PDF/DOCX).  
4. Respuesta con contenido legible por el modelo.  
5. Autolimpieza de archivos cada 30 minutos.  

---

## Consecuencias

### Positivas
- ✅ Amplía el rango de usos (resúmenes, análisis, revisión de documentos).  
- ✅ Mantiene privacidad en Fase 1 (todo local).  
- ✅ Escalable a futuro con backend.  
- ✅ Experiencia de usuario mucho más rica e interactiva.  

### Negativas
- ⚠️ Riesgo de lentitud o cuelgue con archivos grandes.  
- ⚠️ Requiere gestión de seguridad (evitar inyección de contenido).  
- ⚠️ Carga extra para el modelo (más tokens procesados).  

### Mitigaciones
1. **Límites de tamaño:** máximo 10 MB por archivo.  
2. **Previsualización parcial:** mostrar primeras 2000 líneas antes de enviar.  
3. **Sanitización:** eliminar metadatos o contenido binario no soportado.  
4. **Advertencias UX:** mostrar mensaje “No subas datos sensibles”.  

---

## Implementación Técnica

### Archivos a Crear/Modificar

1. **Nuevo Componente:** `frontend/src/components/FileUploader.tsx`  
   - Gestión de input y drag & drop.  
   - Lectura con FileReader.  
   - Validación de tipo y tamaño.  

2. **Nuevo Servicio (futuro):** `backend/Controllers/FileController.cs`  
   - Endpoint `/api/files/upload`.  
   - Procesamiento con `IFormFile`.  
   - Extracción de texto con `PdfPig`, `CsvHelper`, `OpenXML`.  

3. **Modificar:** `frontend/src/components/ChatInput.tsx`  
   - Integrar botón 📎 y flujo de envío al modelo.  
   - Mostrar nombre del archivo en la conversación.  

### Estimación de Tiempo

- Fase 1 (Frontend): 6–8 horas  
- Fase 2 (Backend): 10–12 horas  
- Total estimado: **2.5 días**  

---

## Referencias

- [FileReader API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)  
- [ASP.NET Core File Uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)  
- [OpenAI File Upload API](https://platform.openai.com/docs/api-reference/files)  
- [CsvHelper Library](https://joshclose.github.io/CsvHelper/)  

---

## Notas Adicionales

- En versiones futuras se puede asociar el archivo al chat (para consultas contextuales persistentes).  
- Considerar uso de **Embeddings** o **context windows** si se habilita análisis largo.  
- Se recomienda registrar métricas de uso (cantidad de archivos, tamaño promedio, tipo más frecuente).  
