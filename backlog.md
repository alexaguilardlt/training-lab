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
- [ ] T1.5c — Script de sincronización: pedir actividades a Strava y guardarlas (sin duplicados)
- [x] T1.5d — Programar la ejecución periódica (cron en la Pi)
- [x] T1.5e — Sync incremental (usar `after` en vez de repasar todo el historial en cada ejecución)
- [x] T1.6a — Arrancar proyecto React (Vite + TypeScript), conectividad básica con el backend
- [x] T1.6b — Dockerizar el frontend y desplegarlo en la Pi (CD)
- [ ] T1.6c — Gráfica real de ritmo/distancia con las actividades sincronizadas
  - [ ] T1.6c-1 — Backend: endpoint `GET /activities` (solo `activity_type=Run`, ordenado por `start_date`),
    devuelve ritmo (`pace_per_km`) ya calculado vía un response model de Pydantic
  - [ ] T1.6c-2 — Frontend: instalar Recharts, componente que hace fetch a `/activities` y pinta ritmo/distancia
    en el tiempo
- [ ] T1.6d — Botón/carga automática de sincronización desde el frontend
- [ ] (Coros se aborda como iteración posterior, una vez Strava funcione de punta a punta)

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