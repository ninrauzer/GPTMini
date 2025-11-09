## ADR-001 — Elección de arquitectura base para el MVP “ChatGPT Local”

**Estado:** Aprobado
**Autor:** Renan Ruiz
**Fecha:** 2025-11-01

---

### 1. Contexto

El proyecto **ChatGPT Local** busca ofrecer una alternativa auto-alojada al servicio ChatGPT Plus, con la misma experiencia conversacional moderna, pero bajo control total del usuario y con un modelo de pago por uso (tokens).
El sistema debe correr en **servidor Linux**, ser rápido, seguro, mantenible y permitir en el futuro añadir módulos de inteligencia (resúmenes, embeddings, análisis, etc.).

Se evaluaron dos tecnologías principales para el backend: **.NET 8** y **FastAPI (Python)**.
Ambas fueron consideradas viables y conocidas por el equipo.

---

### 2. Decisión

Para el MVP se adopta la siguiente arquitectura:

* **Backend:** .NET 8 (Minimal API)

  * Maneja autenticación básica, consumo de tokens, control de límites, persistencia local y comunicación con OpenAI/OpenRouter.
  * Proporciona endpoints REST estables y de alto rendimiento.

* **Frontend:** React + Vite + Tailwind + shadcn/ui

  * Replica la experiencia de ChatGPT con streaming, Markdown y exportación a `.md`.
  * Consume el backend mediante HTTPS en `localhost` o red local.

* **Persistencia:** SQLite o archivos JSON locales (por usuario).

* **Despliegue:** Servidor Linux sin contenedores (fase inicial).

* **Módulo IA Python:** previsto como microservicio futuro (FastAPI) para tareas analíticas o de NLP.

---

### 3. Justificación

**.NET 8** fue elegido por:

1. **Rendimiento y estabilidad.** Su servidor Kestrel supera ampliamente a frameworks interpretados; ideal para streaming SSE y concurrencia.
2. **Mantenimiento limpio.** Tipado fuerte, logging integrado y ecosistema maduro para proyectos con múltiples módulos (usuarios, cuotas, administración).
3. **Seguridad y despliegue sencillo.** Compilación en binario único y cifrado AES nativo multiplataforma.
4. **Experiencia existente.** El equipo domina C# y ya posee infraestructura Linux compatible.

**React + Vite + Tailwind** fue elegido por:

1. **Desarrollo rápido y moderno.** Ecosistema bien documentado, componentes reutilizables y compatibilidad con SSR o SPA.
2. **Streaming sencillo.** Soporta SSE o WebSocket sin configuración compleja.
3. **UI profesional y personalizable.** Integración fluida con shadcn/ui y resaltado de código vía `react-markdown`.

---

### 4. Alternativas consideradas

| Alternativa           | Razón de descarte                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **FastAPI (Python)**  | Excelente para prototipos y tareas de IA, pero menor rendimiento en producción y menor robustez estructural para control de usuarios y límites. |
| **Full Python stack** | Simplicidad, pero dificultaría la escalabilidad y el mantenimiento de módulos complejos.                                                        |
| **Node.js backend**   | Buen soporte SSE, pero menos afinidad con la experiencia del equipo y menor necesidad de su ecosistema para este caso.                          |

---

### 5. Consecuencias

**Positivas**

* Backend sólido, multiplataforma y listo para crecer hacia el modelo multiusuario con cuotas.
* UI moderna y fácilmente extensible.
* Base técnica coherente para añadir microservicios Python en fases futuras.

**Negativas**

* Para tareas de IA avanzada se necesitará integrar servicios externos (Python / REST).
* Ligeramente más tiempo de desarrollo inicial frente a un prototipo 100 % Python.

---

### 6. Próximos pasos

1. Crear repositorio inicial con estructura `/frontend`, `/backend`, `/data`.
2. Implementar endpoints `/chat`, `/usage`, `/export`.
3. Conectar frontend (React) al backend .NET y habilitar streaming SSE.
4. Añadir manejo de tokens y persistencia local.
5. Evaluar en fase 2 el microservicio Python para análisis inteligente y memoria semántica.

---

¿Deseas que prepare ahora el **ADR-002**, documentando cómo se integrará ese microservicio Python futuro (interfaz, protocolos y responsabilidades)?
