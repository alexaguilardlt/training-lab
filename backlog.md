# Training Lab — Backlog & Plan de Sprints

> Documento vivo. Se actualiza al final de cada sesión de trabajo (sprint review/retro).
> Rol: Claude actúa como Project Manager / Scrum Master. El código lo escribe el desarrollador (tú).

## Visión del producto
Plataforma personal de análisis de entrenamiento que sincroniza datos reales desde Strava y Coros,
los almacena en una base de datos propia, y permite visualizar evolución, comparar sesiones y calcular
métricas de carga de entrenamiento. Autoalojada en Raspberry Pi, desplegada con Docker + CI/CD vía GitHub Actions.

## Objetivo de aprendizaje (no perder de vista)
- Consolidar Node.js/TypeScript en un proyecto real de principio a fin
- Docker y Docker Compose (multi-servicio)
- CI/CD con GitHub Actions (build, test, deploy)
- Despliegue y operación en Raspberry Pi (DevOps real)
- Aplicar conceptos de Big Data/IA (análisis de series temporales, detección de anomalías)

## Decisiones técnicas
- Backend: Python — FastAPI (recomendado: async nativo, encaja bien con jobs de sync e ideal para exponer luego endpoints de analítica/ML)
- Base de datos: PostgreSQL
- Frontend: React (elegido por demanda de mercado laboral sobre Vue)
- Contenedores: Docker + Docker Compose
- CI/CD: GitHub Actions
- Despliegue: Raspberry Pi — SSH ✅ disponible, Docker: por verificar/instalar (primera tarea de Sprint 0)
- Fuentes de datos: Strava (conectado) + Coros (conectado), vía OAuth
- Repo: empieza desde cero (se descarta el código de prueba que había en la Pi)

## Épicas e Historias de Usuario

### Épica A — Pipeline de datos
- US1: Conectar cuenta de Strava y Coros (OAuth) para sincronizar actividades automáticamente
- US2: Job programado que trae actividades nuevas cada noche sin intervención manual
- US3: Persistir los datos en base de datos propia (no depender de llamar a la API en cada carga)

### Épica B — Visualización
- US4: Evolución de ritmo/FC/distancia en el tiempo, por deporte (running/ciclismo)
- US5: Comparar entrenamientos similares entre sí
- US6: Calendario tipo "heatmap" de constancia (estilo GitHub contributions)

### Épica C — Analítica / IA
- US7: Métrica de carga de entrenamiento y forma física estimada (training load, fitness/fatigue)
- US8: Detección de riesgo de sobreentrenamiento (carga aguda/crónica anómala)
- US9 (stretch goal): Predicción simple de marca en distancia objetivo según progresión

### Épica D — Infraestructura / DevOps (transversal)
- US10: Repo con estructura /backend /frontend /worker
- US11: Dockerfiles + docker-compose.yml funcional en local
- US12: Pipeline CI (lint + test) en cada Pull Request
- US13: Pipeline CD (build + push imagen + deploy a Raspberry Pi) al mergear a main
- US14: Gestión segura de secrets (tokens OAuth) — nunca en el repo

## Sprint 0 — Infraestructura (en curso)
Objetivo: tener el esqueleto del proyecto corriendo en Docker, con CI en marcha, antes de tocar lógica de negocio.
Orden recomendado (pensado para sesiones de 3-5h/semana, ir tarea a tarea):
- [ ] T0.1 — Verificar/instalar Docker + Docker Compose en la Raspberry Pi (por SSH)
- [ ] T0.2 — Crear repo en GitHub con estructura `/backend` (FastAPI) y `/frontend` (React)
- [ ] T0.3 — Endpoint "hello world" en FastAPI corriendo en local
- [ ] T0.4 — Dockerfile del backend + docker-compose.yml (backend + Postgres) funcionando en local
- [ ] T0.5 — GitHub Actions: pipeline de CI (lint + test) en cada Pull Request
- [ ] T0.6 — GitHub Actions: pipeline de CD (build + push imagen a GHCR + deploy a la Pi) al mergear a main
- [ ] US14 — Gestión segura de secrets (tokens OAuth) desde el principio, nunca en el repo

## Sprint 1 — Vertical Slice (siguiente)
Objetivo: un flujo completo end-to-end funcionando en la Pi.
- [ ] US1, US2, US4 (versión básica)

## Definition of Done
- Pasa lint + tests en CI
- Se despliega solo a la Pi al mergear a main
- Funciona de extremo a extremo (no solo en local)

## Registro de sincronización (Sync Log)
- 2026-07-22 — Backlog inicial creado a partir de sesión de planificación con Claude (PM/Scrum Master).
- 2026-07-22 — Decisión: se descarta el prototipo previo en la Pi, repo nuevo desde cero. Backend en Python/FastAPI
  (para reforzar Python). Frontend en React (priorizado sobre Vue por demanda de mercado laboral). Docker en la Pi
  pendiente de confirmar instalación — primera tarea de Sprint 0 (T0.1).