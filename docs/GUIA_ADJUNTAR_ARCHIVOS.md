# Guía de Uso: Adjuntar Archivos e Imágenes

## 🖼️ Análisis de Imágenes con GPT-4 Vision

GPTMini ahora soporta el análisis de imágenes usando GPT-4 Vision API. Puedes adjuntar imágenes de **3 formas diferentes**:

### Método 1: Botón de Adjuntar 📎

1. Haz clic en el botón de clip (📎) en la barra de entrada
2. Selecciona hasta 2 archivos de imagen
3. Verás una vista previa de la imagen
4. Escribe tu pregunta (opcional)
5. Presiona "Send"

**Ejemplo:**
```
Adjuntar: screenshot.png
Pregunta: "¿Qué errores ves en este código?"
```

### Método 2: Copiar y Pegar (Ctrl+V) 📋

1. Copia una imagen desde cualquier lugar:
   - Captura de pantalla (Win+Shift+S)
   - Imagen desde navegador (click derecho → copiar)
   - Desde un editor de imágenes
2. En la caja de texto, presiona **Ctrl+V**
3. La imagen se pegará automáticamente
4. Escribe tu pregunta
5. Presiona "Send" o Enter

**Ejemplo:**
```
1. Win+Shift+S (captura pantalla)
2. Ctrl+V en GPTMini
3. "Explica qué hace este diagrama"
4. Enter
```

### Método 3: Arrastrar y Soltar 🎯

1. Arrastra un archivo de imagen desde el explorador
2. Suéltalo sobre la caja de texto
3. Verás la vista previa
4. Escribe tu pregunta
5. Presiona "Send"

## 📝 Tipos de Archivo Soportados

### ✅ Completamente Funcional (Fase 1)
- **PNG** - Capturas de pantalla, gráficos
- **JPEG/JPG** - Fotos, imágenes comprimidas
- **GIF** - Imágenes animadas (se analiza el primer frame)
- **WEBP** - Imágenes modernas de web

### 🔜 Preparado para Fase 2
- **PDF** - Documentos (extracción de texto pendiente)
- **DOCX** - Word (extracción de texto pendiente)
- **TXT** - Texto plano (lectura directa pendiente)

## ⚙️ Límites y Restricciones

- **Máximo de archivos:** 2 por mensaje
- **Tamaño máximo total:** 10MB
- **Tamaño recomendado por imagen:** < 5MB para mejor rendimiento

## 💡 Casos de Uso

### 1. Análisis de Código
```
Adjuntar: screenshot-code.png
Pregunta: "¿Qué errores hay en este código Python?"
```

### 2. Explicación de Diagramas
```
Adjuntar: architecture-diagram.png
Pregunta: "Explica cómo funciona esta arquitectura"
```

### 3. Análisis de Datos Visuales
```
Adjuntar: chart.png
Pregunta: "¿Qué tendencias ves en este gráfico?"
```

### 4. Diseño y UI/UX
```
Adjuntar: mockup.png
Pregunta: "Dame feedback sobre este diseño"
```

### 5. Documentos y Textos
```
Adjuntar: document-page.png
Pregunta: "Resume el contenido de esta página"
```

### 6. Comparación de Imágenes
```
Adjuntar: before.png, after.png
Pregunta: "Compara estas dos versiones y dime qué cambió"
```

## 🎨 Vista Previa de Archivos

Cuando adjuntas archivos, verás:
- **Miniaturas** de imágenes (preview real)
- **Iconos** para documentos (📄 PDF, 📝 DOCX, 📋 TXT)
- **Nombre** del archivo
- **Tamaño** en KB/MB
- **Botón X** para eliminar (aparece al pasar el mouse)

## 🚫 Manejo de Errores

### "Máximo 2 archivos permitidos"
- Solo puedes enviar 2 archivos por mensaje
- Elimina uno antes de agregar otro

### "Tipo de archivo no soportado"
- El archivo no está en la lista de tipos aceptados
- Convierte la imagen a PNG o JPEG

### "Archivo muy grande: X (máximo 10MB)"
- El archivo excede el límite
- Comprime la imagen o reduce su resolución
- Herramientas: TinyPNG, ImageOptim, etc.

## 🔐 Privacidad

- Los archivos **NO se guardan** en el servidor
- Se convierten a base64 en memoria
- Se envían directamente a OpenAI Vision API
- Después del análisis, se descartan

## ⚡ Consejos de Uso

1. **Imágenes claras:** Mayor resolución = mejor análisis
2. **Contexto:** Agrega preguntas específicas para mejores respuestas
3. **Capturas de pantalla:** Usa Win+Shift+S para precisión
4. **Múltiples archivos:** Úsalos para comparaciones
5. **Comprimir antes:** Para archivos grandes, comprime primero

## 🆘 Solución de Problemas

### La imagen no se pega con Ctrl+V
- Asegúrate de haber copiado una imagen (no un archivo)
- Intenta el método de adjuntar o drag & drop

### El análisis es impreciso
- Usa imágenes de mayor calidad
- Agrega contexto en tu pregunta
- Especifica qué aspecto quieres analizar

### Error al enviar
- Verifica que el backend esté corriendo
- Revisa la consola del navegador (F12)
- Comprueba tu API key de OpenAI

## 📊 Tokens y Costos

El análisis de imágenes consume más tokens que texto:
- **Imagen pequeña (512x512):** ~170 tokens
- **Imagen mediana (1024x1024):** ~680 tokens
- **Imagen grande (2048x2048):** ~2720 tokens

**Recomendación:** Usa resoluciones medias para balance calidad/costo.

## 🔄 Próximamente (Fase 2)

- ✅ Extracción de texto de PDFs
- ✅ Lectura de documentos Word
- ✅ Memoria semántica (ChromaDB)
- ✅ Búsqueda en documentos previamente subidos
- ✅ Panel de gestión de archivos

---

**¿Preguntas?** Consulta `ADR-002_Embeddings-y-Archivos.md` para detalles técnicos.
