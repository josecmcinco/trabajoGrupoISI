# 📸 SIGER (Journ SL) — Guía Maestra de Prompts: Módulo de Exclusivas (Ejercicio 3)

> **Rol del Asistente:** Senior Full-Stack Architect & Prompt Engineer (Java 21 / Spring Boot 4.1 + Angular 21 Standalone / Angular Material)  
> **Objetivo:** Extender de forma incremental el proyecto existente **`reportero` (SIGER)** añadiendo la gestión completa de **Exclusivas** (alta, oferta, asignación y finalización).  
> **Técnicas de Prompting Aplicadas:** *CO-STAR Framework*, *Role Prompting*, *Incremental Context Grounding*, *State-Machine Specification*, *Phased Prompt Pipeline (Chain-of-Thought)*, *Few-Shot Structural Anchoring* y *Strict Negative Prompting*.

---

## 🎯 1. Marco CO-STAR y Anclaje al Proyecto Existente

Antes de ejecutar cualquier prompt de implementación, fija el contexto real del repositorio **`trabajoGrupoISI/reportero`** para evitar alucinaciones o rupturas de estilo:

| Dimensión CO-STAR | Definición para este proyecto |
| :--- | :--- |
| **C — Context (Contexto)** | Sistema **SIGER** ya operativo en `/backend` (`com.siger.backend`, Spring Boot 4.1.2, Java 21, PostgreSQL `reportero_db`, JPA `ddl-auto: update`, `open-in-view: false`, Lombok) y `/frontend` (Angular 21 Standalone Components, Signals, Angular Material 21, servicios en `core/services`, modelos en `core/models/siger.models.ts`). |
| **O — Objective (Objetivo)** | Incorporar el módulo funcional de **Exclusivas** (Ejercicio 3): alta por el secretario, consulta de ofertas por reporteros, asignación exclusiva a un reportero en bolsa y finalización con desasignación. |
| **S — Style (Estilo)** | Código limpio, idiomático e idéntico en convenciones al resto del repositorio (Java `record` para DTOs con método estático `from(...)`, `@Transactional`, `@RestControllerAdvice` existente, componentes Standalone en Angular con `inject()`). |
| **T — Tone (Tono)** | Técnico, determinista y orientado a invariantes de negocio. |
| **A — Audience (Audiencia)** | Agentes de desarrollo / desarrolladores que ejecutan fase por fase sobre el código existente sin reescribir módulos previos. |
| **R — Response (Formato)** | Archivos concretos por fase (entidades, repositorios, DTOs, servicios, controladores, modelos TS, servicios Angular y componente standalone), **sin código de pruebas/tests**. |

---

## 🏗️ 2. Decisiones Arquitectónicas Consolidadas

Las siguientes decisiones cierran cualquier ambigüedad funcional del **Ejercicio 3**:

| Eje Arquitectónico | Decisión Cerrada | Impacto Técnico |
| :--- | :--- | :--- |
| **1. Estado y Desasignación** | **`EstadoExclusiva` (`OFERTADA`, `ASIGNADA`, `FINALIZADA`) + `reportero = null` al finalizar** | La entidad `Exclusiva` posee un enum explícito `estado`. Al finalizar, el secretario **desasigna poniendo `reportero = null`**, fija `fechaFinalizacion` y cambia `estado` a `FINALIZADA`. |
| **2. Elegibilidad del Reportero** | **Solo reporteros aprobados en bolsa (`categoria != null`), múltiples exclusivas permitidas** | Al asignar, validar que `reportero.getCategoria() != null` (usando el patrón de `ReportajeService` y `ReporteroRepository.findByCategoriaIsNotNullOrderByApellidosAscNombreAsc()`). Un reportero puede tener varias exclusivas en estado `ASIGNADA` simultáneamente. |
| **3. Control Temporal** | **Fechas `LocalDate` estrictamente manuales y obligatorias** | `fechaCreacion`, `fechaAsignacion` y `fechaFinalizacion` se envían explícitamente desde la UI/API en las 3 operaciones. Prohibido inferir fechas del reloj del sistema. |
| **4. Estructura Frontend** | **Nueva ruta `/exclusivas` en el `mat-toolbar` de `AppComponent`** | Sin login ni selector de roles global: una vista unificada en `features/exclusivas/exclusivas.component.ts` con pestañas/filtros (*Todas / Ofertadas (vista reportero), Asignadas, Finalizadas*) y formularios/acciones para el secretario. |
| **5. Alcance al Finalizar** | **Exclusiva autocontenida** | Al finalizar solo se actualiza `Exclusiva` (`estado = FINALIZADA`, `fechaFinalizacion`, `reportero = null`). No se crean registros automáticos en `Reportaje` ni en `Albaran`. |

---

## 📌 3. Especificación de Dominio y Máquina de Estados

### 3.1. Entidad `Exclusiva` (`exclusivas`)

| Atributo | Tipo Java / SQL | Obligatorio | Reglas y Ciclo de Vida |
| :--- | :--- | :--- | :--- |
| `id` | `Long` (`IDENTITY`) | Sí | Clave primaria autoincremental. |
| `editorial` | `@ManyToOne(EAGER)` -> `Editorial` | Sí | Editorial solicitante (`editorial_id`, `nullable = false`). |
| `tematica` | `String` (length 1000) | Sí | Breve descripción de la temática solicitada. |
| `precioReportero` | `BigDecimal` (`precision = 12, scale = 2`) | Sí | Precio a pagar al reportero (`> 0`). |
| `estado` | `EstadoExclusiva` (`EnumType.STRING`) | Sí | Valores: `OFERTADA`, `ASIGNADA`, `FINALIZADA`. Inicialmente `OFERTADA`. |
| `reportero` | `@ManyToOne(EAGER)` -> `Reportero` | No (`nullable = true`) | `null` en `OFERTADA`, obligatorio (`!= null`) en `ASIGNADA`, **vuelve a `null` al pasar a `FINALIZADA`** (desasignación). |
| `fechaCreacion` | `LocalDate` | Sí | Introducida manualmente en el alta (`3.1`). |
| `fechaAsignacion` | `LocalDate` | No | Introducida manualmente al asignar (`3.2`). Regla: `fechaAsignacion >= fechaCreacion`. |
| `fechaFinalizacion` | `LocalDate` | No | Introducida manualmente al finalizar (`3.3`). Regla: `fechaFinalizacion >= fechaAsignacion`. |

### 3.2. Máquina de Estados e Invariantes

```text
[OFERTADA]  --(asignar a reportero aprobado + fechaAsignacion >= fechaCreacion)-->  [ASIGNADA]
[ASIGNADA]  --(desasignar reportero = null + fechaFinalizacion >= fechaAsignacion)--> [FINALIZADA]
```

- **Transiciones prohibidas (lanzar `BusinessRuleException` -> HTTP `409 Conflict`):**
  - Asignar una exclusiva que ya está `ASIGNADA` ("ningún otro reportero puede tomarla").
  - Asignar una exclusiva que está `FINALIZADA` ("las exclusivas finalizadas tampoco se pueden asignar ya a ningún reportero").
  - Asignar a un reportero sin categoría asignada (`reportero.getCategoria() == null`).
  - Finalizar una exclusiva que no está en estado `ASIGNADA` (`OFERTADA` o ya `FINALIZADA`).
- **Validaciones temporales (lanzar `InvalidRequestException` -> HTTP `400 Bad Request`):**
  - `fechaAsignacion.isBefore(exclusiva.getFechaCreacion())` -> Rechazar.
  - `fechaFinalizacion.isBefore(exclusiva.getFechaAsignacion())` -> Rechazar.

---

## ⚠️ 4. Negative Prompting (Restricciones No Negociables)

Incluye este bloque de guarda en la ejecución de cada fase:

```text
[PROHIBICIONES ESTRICTAS — NEGATIVE PROMPTING]
1. CERO TESTS: NO generes tests unitarios, tests de integración, tests MockMvc, archivos *Test.java ni archivos *.spec.ts.
2. CERO RELOJ DEL SISTEMA EN EXCLUSIVAS: NO uses LocalDate.now(), LocalDateTime.now(), Instant.now(), new Date() ni @CreationTimestamp en la entidad, DTOs, servicios o formularios de Exclusiva. Todas las fechas provienen del input del usuario.
3. NO MODIFICAR MÓDULOS AJENOS: NO alteres la lógica ni el esquema de Reportaje, Albaran, Solicitud, Categoria ni DataInitializer.
4. DESASIGNACIÓN LITERAL: Al finalizar una exclusiva, exclusiva.setReportero(null) es obligatorio; no dejes el reportero vinculado ni añadas campos históricos paralelos.
5. NO INVENTAR AUTH: No implementes login, JWT, Spring Security ni selectores globales de rol. Sigue exactamente el patrón abierto del resto de vistas de SIGER.
6. RESPETAR CONTRATO DE ERRORES: Reutiliza ResourceNotFoundException (404), BusinessRuleException (409) e InvalidRequestException (400) ya gestionadas por GlobalExceptionHandler.
```

---

## 🚀 5. Pipeline Secuencial de Prompts de Ejecución (Chain-of-Thought)

Ejecuta las fases en orden estricto. Cada bloque es un **prompt autocontenido** listo para copiar o ejecutar secuencialmente.

---

### 🔹 Fase 0: Auditoría Rápida de Anclaje (Context Grounding)

```markdown
### ROL & OBJETIVO:
Actúa como Arquitecto Full-Stack Senior. Antes de escribir código nuevo en `trabajoGrupoISI/reportero`, inspecciona los patrones existentes para garantizar 100% de consistencia estructural.

### ACCIONES REQUERIDAS (Solo lectura):
1. Revisa los modelos y repositorios existentes: `Editorial.java`, `Reportero.java`, `EditorialRepository.java`, `ReporteroRepository.java`.
2. Revisa el manejo de errores en `GlobalExceptionHandler.java` y los DTOs tipo `record` en `com.siger.backend.dto`.
3. Revisa en `/frontend/src/app` los archivos `app.routes.ts`, `app.component.ts`, `core/models/siger.models.ts` y `core/utils/error.utils.ts`.

### RESTRICCIÓN:
No edites ningún archivo todavía ni generes tests. Resume en una lista breve los nombres exactos de clases, paquetes, rutas base (`/api/...`) y convenciones de UI que vas a reutilizar.
```

---

### 🔹 Fase 1: Dominio y Persistencia (Backend)

```markdown
### ROL & OBJETIVO:
Actúa como Arquitecto Backend Senior en Java 21 / Spring Boot. Modela el dominio y la capa de persistencia para las **Exclusivas** en `com.siger.backend`.

### CONTEXTO & ANCLAJE:
- Reutiliza las entidades existentes `Editorial` y `Reportero` (sin modificarlas).
- Mantén el mismo estilo de anotaciones JPA y Lombok (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`) usado en `Solicitud.java` y `Reportaje.java`.

### ACCIONES REQUERIDAS:
1. Crear `com.siger.backend.model.EstadoExclusiva`:
   - Enum con valores: `OFERTADA`, `ASIGNADA`, `FINALIZADA`.
2. Crear `com.siger.backend.model.Exclusiva` (`@Table(name = "exclusivas")`):
   - `id` (`Long`, `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`).
   - `editorial` (`Editorial`, `@ManyToOne(fetch = FetchType.EAGER, optional = false)`, `@JoinColumn(name = "editorial_id", nullable = false)`).
   - `tematica` (`String`, `nullable = false`, `length = 1000`).
   - `precioReportero` (`BigDecimal`, `@Column(name = "precio_reportero", nullable = false, precision = 12, scale = 2)`).
   - `estado` (`EstadoExclusiva`, `@Enumerated(EnumType.STRING)`, `@Column(nullable = false, length = 20)`, `@Builder.Default` = `EstadoExclusiva.OFERTADA`).
   - `reportero` (`Reportero`, `@ManyToOne(fetch = FetchType.EAGER)`, `@JoinColumn(name = "reportero_id")` — nullable).
   - `fechaCreacion` (`LocalDate`, `@Column(name = "fecha_creacion", nullable = false)`).
   - `fechaAsignacion` (`LocalDate`, `@Column(name = "fecha_asignacion")`).
   - `fechaFinalizacion` (`LocalDate`, `@Column(name = "fecha_finalizacion")`).
3. Crear `com.siger.backend.repository.ExclusivaRepository` extendiendo `JpaRepository<Exclusiva, Long>`:
   - `List<Exclusiva> findAllByOrderByFechaCreacionDescIdDesc();`
   - `List<Exclusiva> findByEstadoOrderByFechaCreacionDescIdDesc(EstadoExclusiva estado);`

### RESTRICCIONES (NEGATIVE PROMPTING):
- Prohibido usar `@CreationTimestamp`, `LocalDate.now()` o valores por defecto de fecha.
- NO modificar `Editorial.java`, `Reportero.java`, `Reportaje.java` ni `Albaran.java`.
- NO generar tests.
```

---

### 🔹 Fase 2: DTOs, Reglas de Negocio y Servicio Transaccional (Backend)

```markdown
### ROL & OBJETIVO:
Actúa como Ingeniero Backend Senior. Implementa los DTOs (`record`) y la capa `@Service` transaccional para los casos de uso 3.1, 3.2 y 3.3 en `com.siger.backend`.

### CONTEXTO & ANCLAJE:
- Reutiliza `EditorialRepository`, `ReporteroRepository`, `EditorialResponse` y `ReporteroResponse` ya existentes en `com.siger.backend.dto`.
- Reutiliza `ResourceNotFoundException` (404), `BusinessRuleException` (409) e `InvalidRequestException` (400).

### ACCIONES REQUERIDAS:
1. Crear los DTOs en `com.siger.backend.dto`:
   - `CrearExclusivaRequest` (`record`):
     - `@NotNull Long editorialId`
     - `@NotBlank @Size(max = 1000) String tematica`
     - `@NotNull @DecimalMin(value = "0.01") BigDecimal precioReportero`
     - `@NotNull LocalDate fechaCreacion`
   - `AsignarExclusivaRequest` (`record`):
     - `@NotNull Long reporteroId`
     - `@NotNull LocalDate fechaAsignacion`
   - `FinalizarExclusivaRequest` (`record`):
     - `@NotNull LocalDate fechaFinalizacion`
   - `ExclusivaResponse` (`record`) con método estático `from(Exclusiva)`:
     - `id`, `editorial` (`EditorialResponse`), `tematica`, `precioReportero`, `estado`, `reportero` (`ReporteroResponse` o `null`), `fechaCreacion`, `fechaAsignacion`, `fechaFinalizacion`.
2. Crear `com.siger.backend.service.ExclusivaService` (`@Service`, `@RequiredArgsConstructor`):
   - `crearExclusiva(CrearExclusivaRequest)` (`@Transactional`):
     - Busca `Editorial` por `editorialId` (o `ResourceNotFoundException`).
     - Crea `Exclusiva` con `estado = OFERTADA`, `reportero = null`, `tematica.trim()`, `precioReportero`, `fechaCreacion`.
   - `listarExclusivas(EstadoExclusiva estado)` (`@Transactional(readOnly = true)`):
     - Si `estado == null`, devuelve todas ordenadas por `fechaCreacion DESC, id DESC`.
     - Si `estado != null`, filtra por estado (`OFERTADA`, `ASIGNADA`, `FINALIZADA`).
   - `asignarExclusiva(Long exclusivaId, AsignarExclusivaRequest)` (`@Transactional`):
     - Busca `Exclusiva` (o `ResourceNotFoundException`).
     - Si `exclusiva.getEstado() == EstadoExclusiva.ASIGNADA`, lanzar `BusinessRuleException("La exclusiva ya está asignada a un reportero")`.
     - Si `exclusiva.getEstado() == EstadoExclusiva.FINALIZADA`, lanzar `BusinessRuleException("Una exclusiva finalizada no puede asignarse a ningún reportero")`.
     - Busca `Reportero` por `reporteroId` (o `ResourceNotFoundException`).
     - Si `reportero.getCategoria() == null`, lanzar `BusinessRuleException("Solo un reportero aprobado en bolsa puede aceptar una exclusiva")`.
     - Si `request.fechaAsignacion().isBefore(exclusiva.getFechaCreacion())`, lanzar `InvalidRequestException("La fecha de asignación no puede ser anterior a la fecha de creación de la exclusiva")`.
     - Asigna `reportero`, `fechaAsignacion` y cambia `estado` a `ASIGNADA`.
   - `finalizarExclusiva(Long exclusivaId, FinalizarExclusivaRequest)` (`@Transactional`):
     - Busca `Exclusiva` (o `ResourceNotFoundException`).
     - Si `exclusiva.getEstado() != EstadoExclusiva.ASIGNADA`, lanzar `BusinessRuleException("Solo se pueden finalizar exclusivas que estén actualmente asignadas")`.
     - Si `request.fechaFinalizacion().isBefore(exclusiva.getFechaAsignacion())`, lanzar `InvalidRequestException("La fecha de finalización debe ser igual o posterior a la fecha de asignación")`.
     - **Desasigna explícitamente:** `exclusiva.setReportero(null)`.
     - Fija `fechaFinalizacion` y cambia `estado` a `FINALIZADA`.

### RESTRICCIONES (NEGATIVE PROMPTING):
- Prohibido `LocalDate.now()` o valores por defecto si una fecha viene nula (`@NotNull` obligatorio).
- Prohibido crear registros en `Reportaje` o `Albaran` al finalizar.
- NO generar tests.
```

---

### 🔹 Fase 3: API RESTful (Backend)

```markdown
### ROL & OBJETIVO:
Actúa como Desarrollador Spring WebMVC. Expón los endpoints REST de Exclusivas manteniendo exactamente la arquitectura de controladores de `com.siger.backend.controller`.

### ACCIONES REQUERIDAS:
1. Crear `com.siger.backend.controller.ExclusivaController` con `@RestController`, `@RequestMapping("/api/exclusivas")`, `@RequiredArgsConstructor`:
   - `GET /api/exclusivas` (`@RequestParam(required = false) EstadoExclusiva estado`) -> `200 OK` con `List<ExclusivaResponse>` (permite listar todas o filtrar por `OFERTADA`, `ASIGNADA`, `FINALIZADA`).
   - `POST /api/exclusivas` (`@Valid @RequestBody CrearExclusivaRequest`) -> `201 CREATED` con `ExclusivaResponse`.
   - `PATCH /api/exclusivas/{id}/asignar` (`@PathVariable Long id`, `@Valid @RequestBody AsignarExclusivaRequest`) -> `200 OK` con `ExclusivaResponse`.
   - `PATCH /api/exclusivas/{id}/finalizar` (`@PathVariable Long id`, `@Valid @RequestBody FinalizarExclusivaRequest`) -> `200 OK` con `ExclusivaResponse`.
2. Verificar que `WebConfig.java` mantiene habilitados los métodos `GET`, `POST`, `PATCH` y `http://localhost:*` (sin necesidad de cambios si ya están configurados).
3. Verificar compilación del backend ejecutando `.\mvnw.cmd compile` desde `/backend` (sin ejecutar ni crear tests).

### RESTRICCIONES (NEGATIVE PROMPTING):
- NO añadas controladores separados ni rutas redundantes fuera de `/api/exclusivas`.
- NO generes tests ni modifiques `src/test`.
```

---

### 🔹 Fase 4: Modelos TypeScript y Servicio Angular (Frontend)

```markdown
### ROL & OBJETIVO:
Actúa como Frontend Architect en Angular 21. Amplía la capa `core` de `/frontend/src/app` para consumir la API de Exclusivas.

### CONTEXTO & ANCLAJE:
- Modelos compartidos en `frontend/src/app/core/models/siger.models.ts`.
- Servicios HTTP con `inject(HttpClient)` y `environment.apiUrl` siguiendo el patrón de `ReportajesService` y `EditorialesService`.

### ACCIONES REQUERIDAS:
1. Actualizar `frontend/src/app/core/models/siger.models.ts` añadiendo:
   - `export type EstadoExclusiva = 'OFERTADA' | 'ASIGNADA' | 'FINALIZADA';`
   - `export interface Exclusiva` (`id`, `editorial: Editorial`, `tematica`, `precioReportero`, `estado: EstadoExclusiva`, `reportero: Reportero | null`, `fechaCreacion`, `fechaAsignacion: string | null`, `fechaFinalizacion: string | null`).
   - `export interface CrearExclusivaRequest` (`editorialId`, `tematica`, `precioReportero`, `fechaCreacion`).
   - `export interface AsignarExclusivaRequest` (`reporteroId`, `fechaAsignacion`).
   - `export interface FinalizarExclusivaRequest` (`fechaFinalizacion`).
2. Crear `frontend/src/app/core/services/exclusivas.service.ts` (`@Injectable({ providedIn: 'root' })`):
   - `listarExclusivas(estado?: EstadoExclusiva): Observable<Exclusiva[]>` (usando `HttpParams` cuando `estado` esté definido).
   - `crearExclusiva(request: CrearExclusivaRequest): Observable<Exclusiva>`.
   - `asignarExclusiva(id: number, request: AsignarExclusivaRequest): Observable<Exclusiva>`.
   - `finalizarExclusiva(id: number, request: FinalizarExclusivaRequest): Observable<Exclusiva>`.

### RESTRICCIONES (NEGATIVE PROMPTING):
- NO uses `new Date().toISOString()` para autocompletar fechas por defecto ni servicios de simulación global.
- NO generes archivos `*.spec.ts`.
```

---

### 🔹 Fase 5: Componente Standalone, Rutas y Navegación UI (Frontend)

```markdown
### ROL & OBJETIVO:
Actúa como Desarrollador Angular 21 + Angular Material. Crea la pantalla de gestión y oferta de Exclusivas e intégrala en la navegación principal de SIGER.

### CONTEXTO & ANCLAJE:
- Sigue el estilo visual, uso de Signals (`signal`, `computed`), `ReactiveFormsModule`, `MatCardModule`, `MatTableModule` / tarjetas, `MatTabsModule` (o filtro de estado), `MatSelectModule`, `MatSnackBar` y `extractErrorMessage` presentes en `reportajes.component.ts` y `solicitudes.component.ts`.

### ACCIONES REQUERIDAS:
1. Crear `frontend/src/app/features/exclusivas/exclusivas.component.ts` (Standalone):
   - **Panel de Alta de Exclusiva (Secretario — 3.1):**
     - Formulario reactivo con: selector de `Editorial` (`EditorialesService`), `tematica` (`textarea`), `precioReportero` (`number > 0`), `fechaCreacion` (`input type="date"`, obligatorio y sin valor automático del reloj).
     - Botón para registrar nueva exclusiva y recarga reactiva de los listados.
   - **Sección de Listados por Vista / Estado (`MatTabGroup` o selector de pestañas):**
     - **Todas** (visión completa del secretario — 3.1).
     - **Ofertadas (Vista Reportero — 3.2):** muestra exclusivas con `estado === 'OFERTADA'` disponibles para que el reportero las consulte y el secretario proceda a asignarlas.
       - Acción inline o diálogo por fila: seleccionar `Reportero` aprobado en bolsa (`ReporterosService.listarReporteros(true)`) + introducir `fechaAsignacion` manual (`input type="date"`) + botón **"Asignar a reportero"**.
     - **Asignadas (Vista Secretario — 3.2 / 3.3):** muestra exclusivas con `estado === 'ASIGNADA'`, indicando editorial, temática, precio, reportero asignado y `fechaAsignacion`.
       - Acción inline o diálogo por fila: introducir `fechaFinalizacion` manual (`input type="date"`) + botón **"Finalizar y desasignar"** (deposición de fotos).
     - **Finalizadas (Vista Secretario — 3.3):** muestra exclusivas con `estado === 'FINALIZADA'`, `fechaCreacion`, `fechaAsignacion`, `fechaFinalizacion` y sin reportero asignado (desasignada), sin permitir nuevas asignaciones.
   - Mostrar mensajes de error del backend mediante `extractErrorMessage(err)` en `MatSnackBar`.
2. Registrar la ruta en `frontend/src/app/app.routes.ts`:
   - `{ path: 'exclusivas', component: ExclusivasComponent }`.
3. Añadir el enlace en `frontend/src/app/app.component.ts` dentro de `<nav class="nav-links">`:
   - Botón `mat-button` hacia `/exclusivas` con icono Material (ej. `stars` o `work_outline`) y texto `Exclusivas`.
4. Verificar compilación del frontend ejecutando `npm run build` desde `/frontend`.

### RESTRICCIONES (NEGATIVE PROMPTING):
- Prohibido pre-rellenar `fechaCreacion`, `fechaAsignacion` o `fechaFinalizacion` con la fecha actual del navegador (`new Date()`).
- Prohibido mostrar acciones de "Asignar" en exclusivas `ASIGNADA` o `FINALIZADA`.
- NO generar archivos `*.spec.ts` ni modificar otros componentes de `features/`.
```

---

## 📋 6. Check-list de Verificación Final (Sin Tests)

- [ ] Entidad `Exclusiva` y enum `EstadoExclusiva` (`OFERTADA`, `ASIGNADA`, `FINALIZADA`) persistidos en PostgreSQL (`exclusivas`).
- [ ] Al finalizar (`3.3`), `exclusiva.getReportero()` queda en `null` y el estado pasa a `FINALIZADA`.
- [ ] Solo reporteros aprobados en bolsa (`categoria != null`) pueden recibir asignación (`3.2`), pudiendo acumular múltiples exclusivas activas.
- [ ] Validaciones temporales estrictas con fechas manuales: `fechaCreacion` -> `fechaAsignacion >= fechaCreacion` -> `fechaFinalizacion >= fechaAsignacion`.
- [ ] Cero usos de `LocalDate.now()`, `LocalDateTime.now()`, `new Date()` o `@CreationTimestamp` en el módulo de Exclusivas.
- [ ] Navegación integrada en `/exclusivas` con vistas diferenciadas para *Todas*, *Ofertadas (Reporteros)*, *Asignadas* y *Finalizadas*.
- [ ] Backend compila (`.\mvnw.cmd compile`) y Frontend compila (`npm run build`), sin haber generado ningún test.
