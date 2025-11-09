# ADR-001 (Revisión 2025-11) — Elección de Arquitectura Base

**Estado:** Actualizado  
**Fecha original:** 2025-08-15  
**Revisión:** 2025-11-09  

## Contexto original
El MVP se diseñó con .NET 8 (Minimal API) y React + Vite + Tailwind para maximizar velocidad y control.  

## Revisión actual
Durante la expansión del proyecto se incorporó un microservicio Python (FastAPI + Chroma) para manejar embeddings y búsquedas semánticas.  

## Decisión actualizada
- .NET 8 continúa como **backend principal**, responsable de seguridad, límites de tokens y orquestación.  
- Python (FastAPI) se integra como **módulo cooperante**, dedicado al procesamiento semántico.  

## Razones
- Ecosistema Python maduro para IA (Chroma, FAISS, Transformers).  
- Evita sobrecargar .NET con bibliotecas externas.  
- Mantiene modularidad y facilidad de despliegue local.  

## Consecuencias
- Comunicación interna por HTTP (localhost:8001).  
- Nuevo token interno `EMBEDDINGS_API_TOKEN`.  
- Ajuste menor en pipeline de `ChatController`.  

## Estado final
La combinación **.NET 8 + Python FastAPI** pasa a ser la base oficial del sistema.
