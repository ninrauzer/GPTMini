# ADR-003: Generación de Imágenes con DALL-E

**Estado**: 🔜 Propuesto  
**Fecha**: 2025-11-09  
**Contexto**: Fase 1 de análisis de imágenes completada  
**Decisores**: Equipo de desarrollo

---

## Contexto y Problema

Actualmente GPTMini puede **analizar imágenes** usando GPT-4 Vision API (ADR-002 Fase 1), pero no puede **generar imágenes**. Los usuarios han expresado interés en tener capacidades de generación de imágenes mediante descripciones de texto.

### Capacidades Actuales
✅ Analizar contenido de imágenes  
✅ Extraer texto de imágenes  
✅ Responder preguntas sobre imágenes  

### Capacidades Solicitadas
❌ Generar imágenes desde descripciones de texto  
❌ Editar imágenes existentes  
❌ Crear variaciones de imágenes  

---

## Decisión

Integrar **OpenAI DALL-E 3 API** para generación de imágenes, con las siguientes características:

### Opción 1: Comando Especial (Recomendada)
- Usar un prefijo especial en el mensaje: `/imagen` o `/generar`
- Ejemplo: `/imagen un gato astronauta en el espacio`
- Ventajas:
  - No interfiere con el chat normal
  - Claro cuando se quiere generar vs analizar
  - Fácil de implementar
  - Bajo consumo de tokens

### Opción 2: Botón Dedicado
- Agregar botón "Generar Imagen" en la InputBar
- Al presionarlo, cambia el modo a generación
- Ventajas:
  - UI más intuitiva
  - Separación visual clara
  - Mejor UX para usuarios no técnicos

### Opción 3: Detección Automática
- Analizar el mensaje con palabras clave: "genera", "crea", "dibuja"
- El sistema decide si generar o chatear
- Ventajas:
  - Más natural
  - No requiere comandos especiales
- Desventajas:
  - Ambigüedad posible
  - Consumo extra de tokens para decisión

---

## Arquitectura Propuesta

### Backend

#### Nuevo Endpoint
```csharp
[HttpPost("generate-image")]
public async Task<ActionResult<ImageGenerationResponse>> GenerateImage(
    [FromBody] ImageGenerationRequest request)
{
    // Llamar a DALL-E 3 API
    // Retornar URL de imagen generada
}
```

#### Nuevo Servicio
```csharp
public interface IImageGenerationService
{
    Task<string> GenerateImageAsync(string prompt, string? size = "1024x1024", string? quality = "standard");
    Task<string> EditImageAsync(byte[] image, byte[] mask, string prompt);
    Task<string> CreateVariationAsync(byte[] image);
}
```

### Frontend

#### Nuevo Hook
```typescript
export const useImageGeneration = () => {
  const generateImage = async (prompt: string, options?: ImageOptions) => {
    // Llamar al endpoint
    // Retornar URL de imagen
  }
  
  return { generateImage, isGenerating }
}
```

#### Componente de Visualización
```typescript
<ImageGenerationPanel>
  - Input para prompt
  - Selector de tamaño (1024x1024, 1024x1792, 1792x1024)
  - Selector de calidad (standard, hd)
  - Botón "Generar"
  - Área de preview de imagen generada
  - Botón "Descargar imagen"
</ImageGenerationPanel>
```

---

## Integración con Chat

### Flujo de Usuario

1. **Comando en Chat**:
   ```
   Usuario: /imagen un dragón volando sobre una ciudad cyberpunk
   Sistema: [Mostrando spinner] Generando imagen...
   Sistema: [Muestra imagen generada]
           Imagen generada: "Un dragón volando sobre una ciudad cyberpunk"
           [Botón: Descargar] [Botón: Generar Variación] [Botón: Regenerar]
   ```

2. **Almacenamiento en Historial**:
   - Guardar prompt usado
   - Guardar URL de imagen (temporal de OpenAI, válida 1 hora)
   - Opcionalmente: Descargar y guardar localmente

3. **Mensaje en Chat**:
   ```typescript
   interface ChatMessage {
     role: 'user' | 'assistant'
     content: string
     timestamp: Date
     imageUrl?: string        // NUEVO: URL de imagen generada
     imagePrompt?: string     // NUEVO: Prompt usado para generar
     imageMetadata?: {        // NUEVO: Metadata de generación
       model: 'dall-e-3'
       size: '1024x1024'
       quality: 'standard' | 'hd'
     }
   }
   ```

---

## Costos Estimados (OpenAI DALL-E 3)

| Resolución | Calidad | Costo por Imagen |
|------------|---------|------------------|
| 1024×1024 | Standard | $0.040 |
| 1024×1024 | HD | $0.080 |
| 1024×1792 | Standard | $0.080 |
| 1024×1792 | HD | $0.120 |
| 1792×1024 | Standard | $0.080 |
| 1792×1024 | HD | $0.120 |

**Comparación con GPT-4**:
- 1 imagen HD (1024x1024): $0.080 ≈ 1,600 tokens de GPT-4
- 1 imagen Standard: $0.040 ≈ 800 tokens de GPT-4

---

## Fases de Implementación

### Fase 1: Generación Básica (MVP) 🔜
**Estimación**: 4-6 horas

- [ ] Endpoint backend `/api/image/generate`
- [ ] Servicio `ImageGenerationService` con integración DALL-E 3
- [ ] Detección de comando `/imagen` en frontend
- [ ] Mostrar imagen generada en el chat
- [ ] Botón para descargar imagen
- [ ] Documentación de uso

**Entregables**:
- Generar imagen con prompt simple
- Mostrar en chat como mensaje especial
- Descargar imagen generada

### Fase 2: Opciones Avanzadas 🔮
**Estimación**: 3-4 horas

- [ ] Selector de tamaño (1024x1024, 1024x1792, 1792x1024)
- [ ] Selector de calidad (standard, hd)
- [ ] Botón "Regenerar con ajustes"
- [ ] Historial de imágenes generadas
- [ ] Galería de imágenes en sidebar

**Entregables**:
- Panel de configuración avanzada
- Diferentes resoluciones y calidades
- Historial visual de generaciones

### Fase 3: Edición y Variaciones 🔮
**Estimación**: 6-8 horas

- [ ] Editar imagen con máscara (inpainting)
- [ ] Generar variaciones de imagen existente
- [ ] Interfaz de dibujo de máscara
- [ ] Combinar generación + análisis (Vision + DALL-E)

**Entregables**:
- Edición de imágenes generadas
- Variaciones con un clic
- Flujo iterativo de mejora

---

## Consideraciones Técnicas

### Seguridad
- ✅ Validar prompts para contenido inapropiado
- ✅ Rate limiting por usuario
- ✅ Límite de generaciones por día/hora
- ✅ Almacenar prompts para auditoría

### Almacenamiento
- **Opción A**: Guardar solo URL (expira en 1 hora)
- **Opción B**: Descargar y almacenar localmente
- **Opción C**: Subir a servicio de almacenamiento (S3, Cloudinary)

**Recomendación Fase 1**: Opción A (solo URL temporal)  
**Recomendación Fase 2+**: Opción B o C para persistencia

### Performance
- DALL-E 3 toma ~10-30 segundos por imagen
- Mostrar loading spinner animado
- Permitir cancelación de generación
- Cola de generaciones si hay múltiples

### Limitaciones de DALL-E 3
- Máximo ~4000 caracteres en prompt
- No puede generar texto legible consistentemente
- No puede replicar estilos de artistas específicos (políticas de OpenAI)
- Filtro de contenido automático

---

## Experiencia de Usuario

### Comandos Soportados
```
/imagen [descripción]          - Genera imagen estándar 1024x1024
/imagen-hd [descripción]       - Genera imagen HD 1024x1024
/imagen-wide [descripción]     - Genera imagen panorámica 1792x1024
/imagen-tall [descripción]     - Genera imagen vertical 1024x1792
```

### Ejemplo de Interacción
```
Usuario: /imagen un robot jugando ajedrez contra un humano en un parque

Sistema: 🎨 Generando imagen...

[15 segundos después]

Sistema: [Muestra imagen]
         ✅ Imagen generada exitosamente
         
         Prompt: "un robot jugando ajedrez contra un humano en un parque"
         Tamaño: 1024x1024 | Calidad: Standard | Costo: $0.040
         
         [📥 Descargar] [🔄 Regenerar] [✨ Crear Variación]

Usuario: [Click en la imagen]

Sistema: [Vista ampliada con opciones de edición]
```

---

## Métricas de Éxito

- ✅ Tiempo de generación < 30 segundos (95th percentile)
- ✅ Tasa de éxito > 95%
- ✅ Satisfacción de usuario > 4/5
- ✅ Uso: Al menos 10 generaciones/día en MVP
- ✅ Costo por generación dentro del presupuesto

---

## Alternativas Consideradas

### 1. Stable Diffusion (Auto-hospedado)
**Pros**: Gratuito, control total, sin límites de contenido  
**Contras**: Requiere GPU potente, mantenimiento, calidad variable  
**Decisión**: ❌ Descartado - Complejidad de infraestructura

### 2. Midjourney API
**Pros**: Calidad artística superior  
**Contras**: API no oficial, términos de servicio restrictivos  
**Decisión**: ❌ Descartado - Riesgo legal/técnico

### 3. DALL-E 2
**Pros**: Más barato ($0.020/imagen)  
**Contras**: Calidad inferior, menos resoluciones  
**Decisión**: ❌ Descartado - DALL-E 3 es mejor relación calidad/precio

---

## Dependencias

### Backend
- Ninguna librería adicional (usar HttpClient existente)
- Misma API key de OpenAI

### Frontend
- Posiblemente `react-image-gallery` para vista de galería (Fase 2)
- Posiblemente `canvas` o `fabric.js` para edición (Fase 3)

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Costos elevados | Media | Alto | Rate limiting, límites por usuario |
| Contenido inapropiado | Baja | Alto | Filtro de OpenAI + validación adicional |
| Tiempo de generación largo | Alta | Medio | UI clara de espera, permitir cancelar |
| URLs expiran (1 hora) | Alta | Medio | Implementar descarga automática (Fase 2) |

---

## Referencias

- [OpenAI DALL-E 3 API Documentation](https://platform.openai.com/docs/guides/images/introduction)
- [DALL-E 3 Pricing](https://openai.com/pricing)
- [Best Practices for Prompting DALL-E](https://platform.openai.com/docs/guides/images/prompting)

---

## Decisión Final

**Implementar Fase 1** cuando se complete la Fase 2 de ADR-002 (Embeddings y archivos).

**Prioridad**: Media  
**Complejidad**: Baja-Media  
**Valor para Usuario**: Alto  
**ROI Estimado**: Alto (funcionalidad muy solicitada, implementación relativamente simple)

---

## Notas Adicionales

Esta funcionalidad complementa perfectamente la capacidad actual de análisis de imágenes (GPT-4 Vision), creando un ciclo completo:

1. **Generar** imagen con DALL-E
2. **Analizar** imagen generada con GPT-4 Vision
3. **Iterar** basado en el análisis
4. **Regenerar** con prompt mejorado

Esto convierte a GPTMini en una herramienta completa de trabajo con imágenes.
