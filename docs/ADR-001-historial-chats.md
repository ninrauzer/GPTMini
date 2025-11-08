# ADR-001: Implementación de Historial de Chats y Proyectos

**Estado:** Propuesto  
**Fecha:** 2025-11-08  
**Decisores:** Equipo de desarrollo  
**Contexto:** GPTMini necesita permitir a los usuarios guardar, organizar y recuperar conversaciones pasadas

---

## Contexto y Problema

Actualmente, GPTMini solo mantiene la conversación activa en memoria. Cuando el usuario recarga la página o cierra el navegador, pierde todo el historial. Los usuarios necesitan:

1. Guardar conversaciones para referencia futura
2. Organizar chats por temas o proyectos
3. Recuperar conversaciones anteriores
4. Exportar conversaciones importantes

### Restricciones

- La aplicación no tiene sistema de autenticación de usuarios
- Se busca una solución simple que no requiera infraestructura compleja
- Los datos deben ser accesibles de forma rápida
- Debe funcionar en modo local (desarrollo individual)

---

## Opciones Consideradas

### Opción 1: LocalStorage del Navegador

**Descripción:** Almacenar el historial de chats en el LocalStorage del navegador.

**Ventajas:**
- ✅ Implementación simple y rápida
- ✅ No requiere backend adicional
- ✅ Acceso instantáneo a los datos
- ✅ No requiere autenticación
- ✅ Funciona completamente offline

**Desventajas:**
- ❌ Limitado a ~10MB de almacenamiento
- ❌ Los datos están atados a un solo navegador
- ❌ Se pierden si el usuario borra el caché
- ❌ No sincroniza entre dispositivos

**Implementación:**
```typescript
// Estructura de datos
interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  model: string
  totalTokens: number
}

interface ChatHistory {
  chats: Chat[]
  currentChatId: string | null
}
```

---

### Opción 2: Base de Datos en Backend (SQLite/PostgreSQL)

**Descripción:** Implementar un sistema completo con backend, base de datos y autenticación.

**Ventajas:**
- ✅ Persistencia permanente
- ✅ Accesible desde cualquier dispositivo
- ✅ Sin límites de almacenamiento
- ✅ Búsqueda y consultas avanzadas
- ✅ Multi-usuario

**Desventajas:**
- ❌ Requiere implementar autenticación de usuarios
- ❌ Mayor complejidad de desarrollo
- ❌ Requiere infraestructura de servidor
- ❌ Más tiempo de implementación
- ❌ Posibles costos de hosting

**Stack sugerido:**
- Backend: ASP.NET Core
- DB: SQLite (desarrollo) / PostgreSQL (producción)
- Auth: JWT o ASP.NET Identity

---

### Opción 3: Archivos JSON en el Servidor

**Descripción:** Guardar cada chat como un archivo JSON en el sistema de archivos del servidor.

**Ventajas:**
- ✅ Relativamente simple
- ✅ Fácil de exportar/importar
- ✅ No requiere DB
- ✅ Legible por humanos

**Desventajas:**
- ❌ No escala bien con muchos chats
- ❌ Difícil hacer búsquedas eficientes
- ❌ Problemas de concurrencia
- ❌ Requiere gestión manual de archivos

---

### Opción 4: Solución Híbrida (LocalStorage + Backend Opcional)

**Descripción:** Usar LocalStorage como almacenamiento principal con opción de sincronización a backend en el futuro.

**Ventajas:**
- ✅ Rápida implementación inicial
- ✅ Experiencia fluida sin latencia
- ✅ Escalable: se puede agregar backend después
- ✅ Los usuarios controlan sus datos localmente
- ✅ Funciona sin conexión

**Desventajas:**
- ❌ Duplicación de lógica si se implementa backend
- ❌ Complejidad de sincronización en el futuro

---

## Decisión

**Se recomienda implementar la Opción 4: Solución Híbrida (LocalStorage + Backend Opcional)**

### Fase 1: LocalStorage (Implementación Inmediata)

Implementar un sistema de historial basado en LocalStorage con las siguientes características:

#### Funcionalidades:

1. **Gestión de Chats**
   - Crear nuevo chat
   - Guardar chat automáticamente
   - Cargar chat del historial
   - Eliminar chat
   - Renombrar chat

2. **Organización**
   - Auto-generación de títulos basados en el primer mensaje
   - Agrupación temporal (Hoy, Ayer, Esta Semana, Más Antiguo)
   - Sistema de carpetas/proyectos (opcional en v2)

3. **Interfaz**
   - Sidebar lateral colapsable con historial
   - Botón "Nuevo Chat" en el header
   - Búsqueda de chats por título o contenido
   - Indicador visual del chat actual

4. **Exportación**
   - Mantener funcionalidad actual de exportar a .txt y .md
   - Agregar opción de exportar todo el historial

#### Estructura de Datos:

```typescript
// LocalStorage key: 'gptmini-chat-history'
{
  version: "1.0",
  currentChatId: "uuid-v4",
  chats: [
    {
      id: "uuid-v4",
      title: "Script PowerShell duplicados",
      messages: [...],
      model: "gpt-5",
      totalTokens: 1250,
      createdAt: "2025-11-08T15:55:00Z",
      updatedAt: "2025-11-08T16:30:00Z",
      folder: null // Para v2
    }
  ],
  settings: {
    maxChatsInHistory: 100,
    autoSaveEnabled: true,
    autoDeleteAfterDays: 30
  }
}
```

### Fase 2: Backend Opcional (Futuro)

Cuando sea necesario (múltiples usuarios, sincronización, etc.):

1. Implementar API de autenticación (JWT)
2. Endpoints CRUD para chats
3. Sincronización bidireccional LocalStorage ↔ Backend
4. Migración automática de datos locales al crear cuenta

---

## Consecuencias

### Positivas

- ✅ Los usuarios pueden recuperar conversaciones anteriores
- ✅ Mejora significativa en la experiencia de usuario
- ✅ Implementación rápida (1-2 días)
- ✅ No requiere cambios en el backend actual
- ✅ Escalable hacia una solución más robusta
- ✅ Los datos permanecen privados en el dispositivo del usuario

### Negativas

- ⚠️ Los usuarios deben hacer backups manuales (exportar)
- ⚠️ Limitación de ~10MB (aprox. 100-200 chats largos)
- ⚠️ No sincroniza entre dispositivos
- ⚠️ Depende del navegador y puede perderse

### Mitigaciones

1. **Límite de almacenamiento:** 
   - Implementar límite de chats guardados (ej: últimos 100)
   - Auto-eliminar chats antiguos con confirmación
   - Advertir cuando se acerque al límite

2. **Pérdida de datos:**
   - Botón de "Exportar Todo" para backup
   - Instrucciones claras sobre la naturaleza local del almacenamiento
   - Opción de importar historial desde archivo

3. **Sincronización futura:**
   - Diseñar estructura de datos compatible con backend
   - Preparar migraciones desde el inicio

---

## Implementación Técnica

### Archivos a Crear/Modificar

1. **Nuevo Hook:** `frontend/src/hooks/useChatHistory.ts`
   - Gestión de CRUD de chats
   - Sincronización con LocalStorage
   - Utilidades de búsqueda y filtrado

2. **Nuevo Componente:** `frontend/src/components/ChatHistorySidebar.tsx`
   - Lista de chats históricos
   - Botones de acción (nuevo, eliminar, renombrar)
   - Búsqueda

3. **Modificar:** `frontend/src/App.tsx`
   - Integrar sidebar
   - Gestionar cambio entre chats
   - Auto-guardado

4. **Nuevo Servicio:** `frontend/src/services/chatStorage.ts`
   - Abstracción del almacenamiento
   - Facilita migración a backend futuro

### Estimación de Tiempo

- **Diseño de estructura de datos:** 2 horas
- **Implementación de hooks y servicios:** 4 horas
- **Componente Sidebar:** 4 horas
- **Integración y pruebas:** 2 horas
- **Total estimado:** 12 horas (1.5 días)

---

## Referencias

- [Web Storage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [LocalStorage limits](https://web.dev/storage-for-the-web/)
- [Progressive Web Apps - Offline First](https://web.dev/offline-cookbook/)

---

## Notas Adicionales

- Esta decisión puede revisarse si los requisitos cambian (ej: necesidad de colaboración multi-usuario)
- Se recomienda recolectar feedback de usuarios antes de implementar Fase 2
- Considerar IndexedDB en lugar de LocalStorage si se requiere >10MB
