# Training Lab — Backlog & Plan de Sprints

> Documento vivo. Se actualiza al final de cada sesión de trabajo (sprint review/retro).
> Rol: Claude actúa como Project Manager / Scrum Master. El código lo escribe el desarrollador (tú).

## Visión del producto
Plataforma personal de análisis de entrenamiento que sincroniza datos reales desde Strava y Coros,
los almacena en una base de datos propia, y permite visualizar evolución, comparar sesiones y calcular
métricas de carga de entrenamiento. Autoalojada en Raspberry Pi, desplegada con Docker + CI/CD vía GitHub Actions.

## Objetivo de aprendizaje (no perder de vista)
- Consolidar Python (backend) y React (frontend) en un proyecto real de principio a fin
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
- Despliegue: Raspberry Pi — SSH ✅, Docker ✅. Runner self-hosted en la propia Pi (evita abrir puertos al router;
  build nativo arm64 sin necesidad de multi-arch/QEMU)
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
- [x] T0.1 — Verificar/instalar Docker + Docker Compose en la Raspberry Pi (por SSH)
- [x] T0.2 — Crear repo en GitHub con estructura `/backend` (FastAPI) y `/frontend` (React)
- [x] T0.3 — Endpoint "hello world" en FastAPI corriendo en local
- [x] T0.4 — Dockerfile del backend, build y run standalone funcionando en local
- [x] T0.4b — docker-compose.yml (backend + Postgres) funcionando en local
- [x] T0.5 — GitHub Actions: pipeline de CI (lint + test) en cada Pull Request
- [x] T0.6a — Instalar y registrar un runner self-hosted de GitHub Actions en la Raspberry Pi
- [x] T0.6b — GitHub Actions: pipeline de CD (build nativo + `docker compose up -d`) al mergear a main
- [ ] US14 — Gestión segura de secrets (tokens OAuth) desde el principio, nunca en el repo

## Sprint 1 — Vertical Slice (en curso)
Objetivo: un flujo completo end-to-end funcionando en la Pi.
- [x] T1.1 — Registrar aplicación en el portal de desarrolladores de Strava (Client ID + Client Secret)
- [x] T1.2 — Gestión de secrets: `.env` local (fuera de git) con las credenciales de Strava
- [x] T1.2b — Asegurar que el `.env` de producción sobrevive al `git clean` del runner (copiado desde ruta externa)
- [x] T1.3 — Endpoint backend que inicia el flujo OAuth (redirige a Strava)
- [x] T1.4a — Configurar SQLAlchemy + Alembic, modelar `strava_accounts`, aplicar migración en local
- [x] T1.4b — Aplicar la migración también en la Pi (producción) como parte del pipeline
- [x] T1.4c — Endpoint de callback: intercambiar el `code` por tokens y guardarlos en BD
- [x] T1.5a — Modelo de datos `activities` + migración
- [x] T1.5b — Lógica de refresco de token (refresh_token) cuando el access_token caduca
- [x] T1.5c — Script de sincronización: pedir actividades a Strava y guardarlas (sin duplicados)
- [x] T1.5d — Programar la ejecución periódica (cron en la Pi)
- [x] T1.5e — Sync incremental (usar `after` en vez de repasar todo el historial en cada ejecución)
- [x] T1.6a — Arrancar proyecto React (Vite + TypeScript), conectividad básica con el backend
- [x] T1.6b — Dockerizar el frontend y desplegarlo en la Pi (CD)
- [x] T1.6c — Gráfica real de ritmo/distancia con las actividades sincronizadas
  - [x] T1.6c-1 — Backend: endpoint `GET /activities` (solo `activity_type=Run`, ordenado por `start_date`),
    devuelve ritmo (`pace_per_km`) ya calculado vía un response model de Pydantic
  - [x] T1.6c-2 — Frontend: instalar Recharts, componente que hace fetch a `/activities` y pinta ritmo/distancia
    en el tiempo
- [x] T1.6d — Botón/carga automática de sincronización desde el frontend
  - [x] T1.6d-1 — Frontend: `api/strava.ts` con `syncActivities()` (llama a `POST /strava/sync`)
  - [x] T1.6d-2 — Frontend: `useActivities` expone `refetch()` para poder re-consultar `/activities/` bajo demanda
  - [x] T1.6d-3 — Frontend: al montar `App.tsx`, sincroniza en paralelo a la carga de la gráfica (sin esperar);
    si `actividades_nuevas > 0`, dispara `refetch()`
- [ ] (Coros se aborda como iteración posterior, una vez Strava funcione de punta a punta)
- [x] (Filtro por año en la gráfica de ritmo/distancia y en el heatmap — implementado el 2026-07-31 vía
  `YearSelect` + `lib/yearFilter.ts`. El filtro por mes dentro de un año concreto sigue sin resolver, y el
  `XAxis` de la gráfica de ritmo sigue siendo categórico, no una escala de tiempo real — pendiente si hace falta.)

## Sprint 2 — Épica B: Visualización (en curso)
Objetivo: ampliar la app con más vistas de análisis sobre las actividades ya sincronizadas.
- [x] T2.1 — US6: Heatmap de constancia (calendario estilo GitHub contributions), coloreado por distancia total
  del día (no por conteo — con 1 actividad/día como mucho, el conteo no da variación visual real)
  - [x] T2.1a — Backend: endpoint `GET /activities/heatmap`, agregación por día en SQL (`GROUP BY` fecha,
    `SUM(distance_meters)`), solo `activity_type=Run`, con su propio schema de salida (distinto de `ActivityOut`).
    Definición concreta para retomar mañana:
    - Query: `db.query(func.date(Activity.start_date), func.sum(Activity.distance_meters))` + `.filter(activity_type
      == "Run")` + `.group_by(func.date(Activity.start_date))` + `.all()` (recordar: `func` viene de `sqlalchemy`,
      y el resultado son tuplas `(fecha, distancia_total)`, no objetos `Activity`)
    - Schema nuevo en `schemas.py`: `DailyDistance` con `date: date` y `distance_meters: float`
    - Ruta: `@activities_router.get("/heatmap", response_model=list[DailyDistance])`, mismo router que ya existe
    - Sin parámetros de fecha en esta primera versión (igual que `/activities/`: devuelve todo el histórico)
  - [x] T2.1b — Frontend: `api/` + `types/` + hook para el nuevo endpoint (mismo patrón por capas que `activities`)
  - [x] T2.1c — Frontend: componente `HeatmapCalendar` con CSS Grid a mano (sin librería nueva), color por
    distancia del día
- [x] T2.2 — Filtro por año, aplicado tanto a la gráfica de ritmo/distancia como al heatmap
  - [x] T2.2a — Frontend: `lib/yearFilter.ts` (`getAvailableYears`, `filterActivitiesByYear`) y componente
    presentacional `YearSelect`
  - [x] T2.2b — Frontend: `generateDateRange` pasa de "últimos 365 días" a "1 de enero-31 de diciembre de un año
    concreto"; `HeatmapCalendar` recibe `year` como prop
- [ ] (Idea futura, sin planificar y deliberadamente aparcada por sobre-alcance: clasificar cada sesión —
  rodaje/series/tirada larga — para enriquecer el heatmap y alimentar US7 (carga de entrenamiento). Requeriría:
  guardar `average_heartrate` de Strava (columna nueva + migración + actualizar el sync), y clasificar de forma
  RELATIVA al propio histórico del corredor vía percentiles, no con umbrales absolutos de ritmo — un mismo ritmo
  significa cosas distintas para corredores distintos. Sin resolver: si haría falta re-sincronizar el histórico
  ya guardado para rellenar ppm retroactivamente. Aparcado el 2026-07-29 por escalar demasiado para una sesión —
  retomar solo si hay ganas reales de meterse en analítica de series temporales, no como progresión automática)

## Sprint 3 — Épica C: Analítica (en curso)
Objetivo: primera métrica de carga de entrenamiento, con tests desde el principio.
- [ ] T3.1 — US7/US8: Carga de entrenamiento (ACWR — Acute:Chronic Workload Ratio), usando `moving_time_seconds`
  como proxy de carga (sin pulsaciones todavía). Media móvil de 7 días (aguda) frente a media móvil de 28 días
  (crónica); el mismo ratio sirve tanto para "forma física estimada" (US7) como para detectar riesgo de
  sobreentrenamiento (US8, ratio muy por encima de 1).
  - [x] T3.1a — Backend: función pura de cálculo (dado un histórico diario de carga ya "densificado" — con 0 en
    los días de descanso, no solo los días con actividad — devuelve carga aguda/crónica/ratio por día), con
    tests `pytest` desde el principio (primera vez que se testea lógica de negocio en el proyecto)
  - [ ] T3.1b — Backend: endpoint que expone la serie temporal (fecha, carga_aguda, carga_cronica, ratio)
  - [ ] T3.1c — Frontend: gráfica (Recharts) del ratio en el tiempo, con referencia visual de la "zona segura"
    (aprox. 0.8-1.3)

## Definition of Done
- Pasa lint + tests en CI
- Se despliega solo a la Pi al mergear a main
- Funciona de extremo a extremo (no solo en local)

## Registro de sincronización (Sync Log)
- 2026-07-22 — Backlog inicial creado a partir de sesión de planificación con Claude (PM/Scrum Master).
- 2026-07-22 — Decisión: se descarta el prototipo previo en la Pi, repo nuevo desde cero. Backend en Python/FastAPI
  (para reforzar Python). Frontend en React (priorizado sobre Vue por demanda de mercado laboral). Docker en la Pi
  pendiente de confirmar instalación — primera tarea de Sprint 0 (T0.1).
- 2026-07-22 — T0.1 y T0.2 completadas: Docker instalado en la Pi, repo creado y pusheado a GitHub.
  Preferencia de trabajo del desarrollador: explicar el "por qué" de cada paso (formato curso), no solo comandos —
  conoce lo básico pero quiere entender bien los fundamentos.
- 2026-07-22 — T0.3 completada: FastAPI "hello world" + /health funcionando en local (resuelto ModuleNotFoundError
  ejecutando con `python -m uvicorn` en vez de `uvicorn` directo).
- 2026-07-22 — T0.4 completada: Dockerfile del backend construido y probado standalone (`docker build` + `docker run`),
  /health responde correctamente desde el contenedor.
- 2026-07-22 — T0.4b completada: docker-compose.yml con backend + Postgres funcionando en local, ambos servicios
  arriba y /health respondiendo.
- 2026-07-22 — T0.5 completada: pipeline de CI en GitHub Actions verde (tras corregir que `.github/workflows/`
  no se había subido por estar en el directorio equivocado).
- 2026-07-22 — Decisión de despliegue: runner self-hosted de GitHub Actions instalado en la propia Raspberry Pi
  (Pi confirmada como aarch64), en vez de build multi-arch + SSH desde runner de GitHub. Evita exponer la Pi a
  internet y elimina la necesidad de QEMU/multi-arquitectura.
- 2026-07-22 — Tarjeta SD original sin espacio (6.8GB, 100% usado); reflasheada con Raspberry Pi OS Lite (64-bit)
  en tarjeta de 32GB, hostname `personal-server`, SSH por clave pública. Docker reinstalado y verificado
  (`docker run hello-world` correcto, arm64v8).
- 2026-07-23 — T0.6a completada: runner self-hosted registrado (tras reintentar con token fresco, el primero había
  caducado) e instalado como servicio systemd — activo y en verde "Idle" en GitHub.
- 2026-07-23 — **Sprint 0 CERRADO.** T0.6b completada y verificada end-to-end: PR → CI verde → merge → CD despliega
  automáticamente en la Pi vía runner self-hosted → /health responde en `personal-server.local:8000`. Toda la
  infraestructura (repo, Docker, Postgres, CI, CD) funcionando. Arranca Sprint 1 (Épica A: pipeline de datos).
- 2026-07-23 — T1.1 completada: app registrada en Strava (Client ID/Secret obtenidos, callback domain =
  personal-server.local). T1.2 completada: pydantic-settings + .env (gitignored) + .env.example. Bug encontrado y
  resuelto: `pip freeze` se ejecutó con el entorno base de conda activo en vez del `.venv` del proyecto, generando
  un requirements.txt roto — lección aprendida, verificar siempre `which pip` antes de instalar/congelar deps.
  Siguiente: T1.3 (endpoint que inicia el flujo OAuth).
- 2026-07-23 — T1.4a completada tras varias vueltas de depuración real: `target_metadata` quedó en `None` la
  primera vez (línea por defecto de la plantilla sobrescribía el import); después una migración autogenerada
  vacía (`models.py` importado pero sin registrar ninguna tabla, y luego se descubrió que el archivo no estaba
  ni siquiera guardado en disco); y una `alembic_version` fantasma en la BD sin migración real detrás, que obligó
  a resetear con `DROP TABLE alembic_version`. Confirmado con `\dt`: `strava_accounts` existe en local.
  Buena lección de depuración: verificar el contenido real de los archivos en disco antes de seguir iterando a
  ciegas. Siguiente: T1.4b (aplicar la misma migración en la Pi vía el pipeline de CD).
- 2026-07-23 — CI fallaba por falta de STRAVA_CLIENT_ID/SECRET en el runner hosted (esperado, se resolvió con env
  vars de prueba en el step de tests). Se detectó un problema más importante: `actions/checkout` hace `git clean
  -ffdx` en cada ejecución, que borraría un `.env` puesto a mano dentro del workspace del runner self-hosted
  (aunque esté gitignored). Solución: `.env` real de producción vive en `~/secrets/training-lab/backend.env`
  (fuera de cualquier repo git) y un paso del workflow de CD lo copia a `backend/.env` tras el checkout, antes de
  construir. T1.2b pendiente de confirmar en la Pi.
- 2026-07-23 — Bug de contraseñas de Postgres: `POSTGRES_PASSWORD` estaba duplicado a mano en `db` y `backend`
  (desincronizados), y luego un paso duplicado en `cd.yml` copiaba el `.env` de la raíz *después* de construir y
  migrar, no antes. Solución: variable `POSTGRES_PASSWORD` unificada vía `.env` de raíz + `${POSTGRES_PASSWORD}`
  en docker-compose.yml, y un único paso de copia de env files bien posicionado antes de construir.
  Preferencia de trabajo añadida: etiquetar siempre cada bloque de comandos con dónde se ejecuta (Mac/repo local,
  SSH en la Pi, o GitHub/navegador), para no perder el hilo entre entornos.
- 2026-07-23 — T1.4b completada (tras una sesión larga de depuración). Causa raíz real de toda la cadena de fallos
  de autenticación: en `docker-compose.yml` faltaba el símbolo `$` en `{POSTGRES_PASSWORD}` dentro de
  `DATABASE_URL` — Compose solo interpola `${VARIABLE}` con el signo dólar; sin él es texto literal. Ningún reset
  de volumen podía arreglarlo porque el valor nunca fue el correcto. Verificado end-to-end: CD en verde,
  `strava_accounts` y `alembic_version` presentes en la Pi. Lección: cuando un mismo síntoma persiste tras varios
  intentos de arreglo distintos, revisar el archivo real caracter a caracter en vez de seguir iterando sobre la
  misma hipótesis. Siguiente: T1.4c (endpoint de callback real).
- 2026-07-23 — T1.4c completada y verificada end-to-end en producción: flujo OAuth completo (login → consentimiento
  en Strava → callback → tokens guardados en `strava_accounts` en la Pi). De paso se corrigió `expires_at` para
  guardar con timezone (`DateTime(timezone=True)`), vía nueva migración. Cierra la épica de autenticación.
  Siguiente: T1.5 (sincronización de actividades), desglosada en modelo de datos, refresco de token, llamada a
  la API y programación periódica.
- 2026-07-24 — T1.5b completada y verificada en la Pi (token y refresh_token rotados correctamente, expires_at
  saltó ~6h al futuro). Sesión de depuración instructiva sobre cómo funciona Docker sin bind mounts: `scp` a la Pi
  no mete nada en un contenedor ya construido (hace falta `--build` después, siempre); un `git clean` del checkout
  del runner borra archivos no trackeados (como el script de depuración) entre ejecuciones del CD; y de nuevo el
  patrón `python archivo.py` vs `python -m paquete.modulo` para la resolución de imports. Siguiente: T1.5c
  (llamar a la API de actividades de Strava y guardarlas, de forma idempotente).
- 2026-07-24 — T1.5c completada: todas las actividades de Strava descargadas y guardadas, sincronización
  confirmada idempotente (segunda ejecución trae 0 nuevas). T1.5d completada: systemd timer diario a las 03:00
  con `Persistent=true`. Bug encontrado: el script `.sh` funcionaba ejecutado a mano (bash oculta silenciosamente
  errores de formato de ejecutable y reintenta como shell script) pero fallaba bajo systemd con "Exec format
  error" (probablemente CRLF en el archivo creado por heredoc) — resuelto invocando explícitamente
  `ExecStart=/bin/bash /ruta/al/script.sh` en vez de depender del shebang.
  **ÉPICA A (pipeline de datos) CERRADA.** Queda pendiente Coros como iteración futura (fuera de este sprint).
  Siguiente: T1.6, Épica B (visualización) — primera gráfica en React.
- 2026-07-24 — T1.5e completada: sync incremental con `after` (basado en la fecha de la última actividad
  guardada + margen de 1 día), verificado en producción. El sync ya es barato de llamar con frecuencia — abre la
  puerta a dispararlo también al cargar el frontend, además del cron nocturno, sin preocuparse por cuota de la
  API. Ahora sí, siguiente: T1.6 (primera gráfica en React).
- 2026-07-23 — T1.5a completada y desplegada en la Pi. Episodio adicional de depuración: una migración vacía
  aplicada localmente (mismo patrón de T1.4a: modelo con typo `iid` en vez de `id` detectado a tiempo gracias a
  revisar el `cat` antes de aplicar) dejó la BD apuntando a una revisión borrada; resuelto con
  `alembic stamp --purge`, que fija la revisión actual sin intentar recalcular el camino desde el historial.
  Tabla `activities` con FK a `strava_accounts` y `strava_activity_id` como `BigInteger` (para evitar overflow).
  Siguiente: T1.5b (lógica de refresco de token).
- 2026-07-24 — T1.6a completada (Vite+React+TS, CORS, conectividad real backend↔frontend). T1.6b completada:
  build multi-etapa (Node para compilar, nginx para servir), con dos lecciones de reproducibilidad de builds:
  usar el gestor de paquetes real (pnpm vía Corepack, no asumir npm) y fijar versiones exactas de Node/pnpm
  coherentes con el entorno local en vez de `@latest` (que rompió el build al resolver una versión de pnpm que
  exigía Node 22+, incompatible con la imagen base elegida). Frontend servido en la Pi vía nginx en el puerto 3000.
  Siguiente: T1.6c (gráfica real de actividades).
- 2026-07-28 — T1.6c desglosada en dos subtareas tras sesión de planificación. Decisiones: librería de gráficos
  Recharts (API declarativa por componentes, encaja con React frente a Chart.js/D3); el cálculo de ritmo
  (`pace_per_km`) se hace en el backend (centraliza la lógica de negocio, útil de cara a cuando Coros alimente la
  misma gráfica) en vez de en el frontend; la primera versión de la gráfica solo incluye actividades tipo `Run`
  (el ritmo en min/km no aplica a ciclismo). Siguiente: T1.6c-1 (endpoint `GET /activities`).
- 2026-07-28 — T1.6c-1 completada y desplegada en la Pi (PR #11 + PR #12 de fix). Dos lecciones de datos reales
  vs. datos de prueba: (1) `ActivityOut` se definió por error heredando de `Base` (SQLAlchemy) en vez de
  `BaseModel` (Pydantic) — confusión fácil al tener ambas clases visualmente cerca; se separó en `app/schemas.py`,
  dedicado solo a contratos de API, distinto de `models.py` (solo tablas). (2) En producción una actividad `Run`
  real con `distance_meters=0` (probablemente un toque accidental en Strava) tumbaba el endpoint con
  `ZeroDivisionError` — no se detectó en local hasta reproducirlo a propósito insertando una fila igual; resuelto
  añadiendo `Activity.distance_meters > 0` al filtro. Pendiente de vigilar: al menos una actividad con
  `start_date` en el epoch de Unix (1970), dato corrupto que puede distorsionar el eje temporal de la gráfica —
  se decidirá si se filtra al construir T1.6c-2. Ritmo (`pace_per_km`) se calcula en el backend como minutos
  decimales (p.ej. 5.83 = 5 min 50 s); formatearlo a `MM:SS` queda para el frontend. Siguiente: T1.6c-2
  (componente React con Recharts).
- 2026-07-29 — T1.6c-2 completada. **T1.6c CERRADA** (primera gráfica real del proyecto). Arquitectura de
  frontend definida por capas (`types/` → `api/` → `hooks/` → `components/`), pensada para reutilizarse cuando
  lleguen más vistas (US5 comparar, US6 heatmap): `types/activity.ts` (contrato), `api/activities.ts` (fetch
  tipado), `hooks/useActivities.ts` (estado + ciclo de vida), `components/charts/PaceDistanceChart.tsx`
  (100% presentacional, sin fetch). Decisión aparcada para cuando haya varias páginas: introducir `pages/` +
  React Router, y considerar TanStack Query si varios widgets de un futuro dashboard acaban duplicando peticiones
  a la misma API. Verificado con datos reales de producción (295 actividades vía
  `VITE_API_URL=http://personal-server.local:8000 pnpm dev`, sin desplegar nada): la actividad con fecha de 1970
  no rompe el eje porque el `XAxis` de Recharts es categórico por defecto (posiciona por orden de lista, no por
  tiempo real) — no hizo falta filtrarla. Idea futura sin planificar: filtro por mes/año en la gráfica (con 295
  puntos se ve apretada); si se aborda, revisar entonces si conviene pasar el eje X a una escala temporal real.
  Bugs de aprendizaje de esta sesión: arrow function con `{}` sin `return` explícito (el componente devolvía
  `undefined`, TypeScript lo señaló en el sitio de uso en `App.tsx`, no en el archivo de origen); `ResponsiveContainer`
  con `height="100%"` no funciona sin que toda la cadena de contenedores padre tenga alto explícito (a diferencia
  del ancho, que sí se comporta así por defecto en CSS) — resuelto con alto fijo en píxeles; tipado genérico de
  Recharts en `Tooltip`/`YAxis` (`ValueType | undefined`) requiere estrechar el tipo con `typeof` antes de pasarlo
  a una función que espera `number`. Siguiente: T1.6d (botón/carga automática de sincronización desde el
  frontend).
- 2026-07-29 — T1.6d desglosada tras sesión de diseño. Descartada la idea inicial de comprobar si la última
  actividad es "de hoy o ayer" antes de decidir sincronizar (añadía complejidad de comparación de fechas/husos
  horarios sin resolver mejor el problema real). Diseño final, más simple: sincronizar siempre al entrar a la
  app, sin condición — apoyado en que el sync ya es barato e idempotente (T1.5e). La gráfica se pinta primero con
  lo que ya hay en BD (rápido, no bloquea), y el sync corre en paralelo; si trae actividades nuevas, se vuelve a
  pedir `/activities/` para refrescar. Siguiente: T1.6d-1 (`api/strava.ts`).
- 2026-07-29 — T1.6d completada. **Sprint 1 (Vertical Slice) prácticamente cerrado** — solo queda Coros como
  iteración futura fuera de alcance. Verificado apuntando el frontend local a la API real de la Pi
  (`VITE_API_URL=http://personal-server.local:8000 pnpm dev`) en vez de a Postgres local (que solo tiene la
  cuenta de prueba con tokens falsos, insuficiente para probar un sync real). Bug real cazado antes de comitear:
  una llamada a `syncStravaActivities()` colocada por error en el cuerpo del componente (no dentro de
  `useEffect`) se re-ejecutaba en cada render — al no estar dentro del ciclo de vida controlado por React,
  disparaba un `POST /strava/sync` sin control en cada actualización de estado. Siguiente: revisar backlog para
  decidir el siguiente sprint (Épica B completa: US5 comparar, US6 heatmap; o Épica C analítica; o limpiar deuda
  técnica menor pendiente — el `{status}` roto en `App.tsx` que silenciosamente resuelve contra el global
  `window.status` del navegador).
- 2026-07-29 — Revisión de sprint: **Sprint 1 cerrado**. Corregida una casilla desincronizada del backlog
  (T1.5c aparecía sin marcar pese a estar completada y documentada desde el 2026-07-24 — lección: no fiarse solo
  de las casillas, contrastar con el Sync Log). Arranca **Sprint 2, Épica B (visualización)**, empezando por US6
  (heatmap de constancia) en vez de US5 (comparar entrenamientos) — más sencillo conceptualmente (agregación por
  día vs. UI de selección/comparación) y buen sitio para consolidar antes de algo más rico en interacción.
  Decisiones: el heatmap cuenta solo actividades `Run` (consistente con la gráfica de ritmo); la agregación por
  día se hace en el backend vía SQL (`GROUP BY` fecha), no trayendo todas las filas crudas al frontend; la
  rejilla visual se construye con CSS Grid a mano en vez de una librería tipo `react-calendar-heatmap` (Recharts
  no trae un componente de este tipo, y no se quiere añadir una dependencia nueva solo para esto). Siguiente:
  T2.1a (endpoint `GET /activities/heatmap`).
- 2026-07-29 — Corrección de rumbo: la conversación escaló T2.1 de "heatmap simple" a un diseño de clasificación
  de sesiones por percentiles + pulsaciones + posible backfill de histórico, sin pausar a comprobar si seguía
  aportando valor para una sesión de aprendizaje de 3-5h/semana. Se para a tiempo y se vuelve a un T2.1 pequeño y
  cerrable: heatmap coloreado por distancia total del día (en vez de conteo, que con ~1 actividad/día no aporta
  variación visual). Lo demás queda aparcado como idea futura, explícitamente no planificada. Lección de proceso:
  cuando una tarea de "esta sesión" empieza a necesitar decisiones de "esta épica entera", parar a validar
  alcance antes de seguir añadiendo capas.
- 2026-07-30 — **T2.1 (US6, heatmap de constancia) completada y desplegada.** Backend: `GET /activities/heatmap`
  con `GROUP BY` + `func.sum`/`func.date` de SQLAlchemy (primera vez agregando en SQL en vez de traer filas
  completas — el resultado son tuplas, no objetos `Activity`). Frontend: capas nuevas `lib/dateRange.ts`
  (generación de 365 días con relleno a lunes, reutilizado también por mes vía `padGroupToMonday` — cada bloque
  de mes necesita su propia alineación semanal, no solo el rango completo) y `lib/formatters.ts` ampliado con
  `getColorForDistance` (8 umbrales fijos: sin actividad, 5k/10k/15k/22k/30k/42k/>42k) y `formatMonthLabel`.
  Layout final: rejilla CSS Grid por mes (7 columnas lunes-domingo, filas automáticas), agrupados en una
  cuadrícula de 4 meses por fila. Se añadió Prettier al proyecto (semi:false, singleQuote:true, tabWidth:2),
  aplicado en dos pasadas separadas para no mezclar commits de formato con el commit de la funcionalidad — buena
  práctica a mantener en adelante. **Sprint 2 (Épica B) con su primer hito cerrado.** Siguiente: decidir qué
  abordar a continuación (comparar entrenamientos US5, empezar Épica C de analítica, o revisar deuda técnica
  menor pendiente).
- 2026-07-30 — Incidente de git: `git checkout main` estando en `feature/heatmap-component` con cambios sin
  commitear (el filtro por año) dejó `App.tsx` en conflicto sin marcas visibles (con una línea perdida,
  `<HeatmapCalendar />` sin pintar) y revirtió/borró silenciosamente otros 9 archivos sin cambios locales propios
  que solo existían en esa rama (`HeatmapCalendar.tsx`, `useHeatmap.ts`, `dateRange.ts`, `.prettierrc.json`,
  `formatters.ts`, `activities.ts`, `types/activity.ts`, `package.json`, `pnpm-lock.yaml`). Nada se perdió de
  verdad (todo seguía commiteado en la rama), pero costó diagnosticar porque `git status` no deja claro qué se
  ha revertido sin cambios locales de por medio. Recuperado restaurando cada archivo con
  `git show <rama>:<archivo> > <archivo>`. Lección: no cambiar de rama con trabajo sin commitear cuando las
  ramas han divergido bastante — mejor `git stash` o un commit "WIP" antes del checkout.
- 2026-07-31 — **T2.2 (filtro por año) completada y desplegada.** `YearSelect` extraído como componente
  presentacional puro; `getAvailableYears`/`filterActivitiesByYear` en `lib/yearFilter.ts`. El heatmap pasó de
  "últimos 365 días" a "año calendario completo" (`generateDateRange(year)`, 1 ene-31 dic) — con esto el relleno
  global a lunes que tenía la función se volvió redundante (y causaba un grupo fantasma de diciembre del año
  anterior al agrupar por mes) porque `padGroupToMonday` ya alinea cada mes por separado; se quitó. Bug real
  cazado gracias a un aviso de `oxlint` que se había descartado como menor: el `useMemo` de `cells` en
  `HeatmapCalendar` no tenía `days` en sus dependencias, así que al cambiar de año seguía devolviendo la rejilla
  vieja (closure obsoleto) — el aviso de "exhaustive-deps" señalaba exactamente esto. Lección: los avisos de
  dependencias de hooks casi nunca son solo estilo, casi siempre apuntan a un bug de estado obsoleto real.
  Se añadió leyenda de color al heatmap (reutilizando `COLOR_THRESHOLDS`, exportado para la ocasión) y se
  configuró formato automático al guardar en el editor (`.vscode/settings.json` + `.prettierrc.json`) para no
  depender de acordarse de ejecutar `pnpm format` a mano. Segundo incidente de git en la sesión: mientras se
  preparaban los commits, `feature/heatmap-component` (la rama con la versión más antigua del heatmap) se
  mergeó en `main` como PR #17 — al traer `main` a la rama de hoy, conflicto real en 4 archivos
  (`App.tsx`, `HeatmapCalendar.tsx`, `dateRange.ts`, `formatters.ts`) entre la versión antigua y la evolucionada;
  resuelto a favor de esta rama en los cuatro casos por ser superset estricto. Verificado end-to-end en
  producción. **Sprint 2 con dos hitos cerrados (heatmap + filtro por año).** Siguiente: decidir próximo bloque
  de trabajo — US5 (comparar entrenamientos), Épica C (analítica), o deuda técnica menor pendiente (el `{status}`
  roto en `App.tsx`, el `REDIRECT_URI` de OAuth hardcodeado a producción, los avisos de `exhaustive-deps`
  restantes en `App.tsx`).
- 2026-08-01 — **Deuda técnica menor cerrada y desplegada.** `{status}` ya no existía (se perdió sin querer en
  alguna reescritura anterior de `App.tsx`, nadie lo notó hasta ahora). `REDIRECT_URI` movido de constante
  hardcodeada en `strava.py` a `settings.redirect_uri` (con valor por defecto) — bug real cazado en el propio
  cambio: el valor por defecto nuevo apuntaba a `/strava/callback` en vez de `/auth/strava/callback` (la ruta
  real del router), se habría roto el login de Strava en producción de haber quedado así. Cadena de
  `exhaustive-deps` resuelta de principio a fin, con lección repetida en cada eslabón: `refetch` no estabilizado
  → riesgo de bucle si se añade a un array de dependencias sin más (resuelto envolviendo `fetchActivities` en
  `useCallback` dentro de `useActivities`); `distanceByDate` reconstruido con `new Map(...)` en cada render de
  `HeatmapCalendar` rompía la memoización de `cells` aunque sus propias dependencias parecieran correctas
  (resuelto memoizando también `distanceByDate` con `useMemo`). `tsc` y `oxlint` limpios de avisos. Decisión de
  próximo bloque: Épica C, US7 (carga de entrenamiento), en vez de US5 o Coros — es la única épica sin empezar y
  la que más conecta con el objetivo de aprendizaje de Big Data/IA. Versión inicial acotada a propósito, sin
  pulsaciones (no se sincronizan todavía): ACWR (Acute:Chronic Workload Ratio) usando distancia o tiempo como
  proxy de carga, comparando los últimos 7 días contra la media de las últimas 4 semanas — versión simplificada
  de lo que hace el "Fitness & Freshness" de Strava. Se aprovechará para introducir tests por primera vez, sobre
  la fórmula de carga (lógica determinista, buen primer caso de uso para tests unitarios). Siguiente: diseñar
  US7 en detalle antes de escribir nada.