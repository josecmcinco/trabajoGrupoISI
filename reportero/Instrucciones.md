# Prompt de Ingeniería: Ampliación del Sistema SIGER (`reportero`) — Ejercicio 2

> **Propósito del documento:** Este archivo está estructurado como un **prompt maestro ejecutable** aplicando técnicas de *Prompt Engineering* (Rol, Contexto Anclado al Repositorio, Descomposición *Plan-then-Execute*, Reglas y Restricciones Negativas, Contratos de Datos y *Definition of Done*) para implementar de forma segura, modular y verificable las nuevas funcionalidades del **Ejercicio 2** sobre el proyecto existente `reportero`.

---

## 1. Rol y Objetivo (Persona & Goal)

Actúa como un **Ingeniero Full-Stack Senior** especializado en **Java 21 + Spring Boot 4 (JPA/Hibernate + PostgreSQL/H2)** y **Angular 21 (Standalone Components + Angular Material + TypeScript)**.

Tu objetivo es **ampliar el proyecto `reportero` (SIGER · Journ SL)** implementando de principio a fin las funcionalidades del **Ejercicio 2** (Reportajes fotográficos, Editoriales y Albaranes de compra), **preservando íntegramente el stack, las convenciones arquitectónicas y toda la funcionalidad existente del Ejercicio 1** (Categorías, Reporteros y Solicitudes), y dejando el diseño desacoplado y modular para incorporar en el futuro el **Ejercicio 3 (Exclusivas)**.

---

## 2. Contexto del Repositorio (Grounding)

Antes de diseñar o escribir código, ten en cuenta la estructura real del proyecto en `reportero/`:

- **Backend (`reportero/backend`)**:
  - Stack: Java 21, Spring Boot `4.1.2`, Spring Data JPA, Spring Validation, Spring WebMVC, Lombok, PostgreSQL en ejecución (`application.yml`), H2 en tests (`application-test.yml`).
  - Paquete base: `com.siger.backend`
    - `config/`: `DataInitializer.java` (precarga idempotente de las 4 categorías), `WebConfig.java` (CORS para `/api/**`).
    - `model/`: `Categoria`, `Reportero`, `Solicitud`, `EstadoSolicitud`.
    - `repository/`, `service/`, `controller/`, `dto/`.
    - `exception/`: `GlobalExceptionHandler`, `ResourceNotFoundException` (404), `BusinessRuleException` (409), `InvalidRequestException` (400).
  - Tests existentes en `src/test/java/com/siger/backend/`: `CategoriaAndReporteroIntegrationTest`, `SolicitudServiceIntegrationTest`, `SigerApiMockMvcTest`.
- **Frontend (`reportero/frontend`)**:
  - Stack: Angular `^21.0.0`, Angular Material `^21.0.0`, RxJS, SCSS, Standalone Components.
  - Estructura en `src/app/`:
    - `core/models/siger.models.ts`
    - `core/services/` (`categorias.service.ts`, `reporteros.service.ts`, `solicitudes.service.ts`)
    - `core/utils/error.utils.ts`
    - `features/` (`solicitudes/`, `aceptadas/`, `categorias/`, `reporteros/`)
    - `app.routes.ts` y `app.component.ts` (barra de navegación `mat-toolbar`).

---

## 3. Reglas de Ejecución y Restricciones (Guardrails)

1. **Inspección previa obligatoria (Read-Before-Write):** Lee los archivos clave existentes (`Solicitud.java`, `SolicitudService.java`, `CategoriaService.java`, `ReporteroService.java`, `siger.models.ts`, `categorias.component.ts` y los tests) para replicar exactamente el estilo de DTOs, manejo de errores, formato de fechas, validaciones y diseño visual de Material.
2. **Cero regresiones sobre el Ejercicio 1:** No rompas entidades, endpoints, rutas ni tests existentes de Categorías, Reporteros y Solicitudes.
3. **Integridad de `Categoria` (`precioPorHoja` + `precioPorFoto`):**
   - Mantén `precioPorHoja` intacto y **añade un nuevo campo específico `precioPorFoto`** (`BigDecimal`, `precision = 10, scale = 2`, positivo/no nulo) en la entidad `Categoria`, en `CategoriaResponse` y en la API/UI de gestión de precios de categorías.
   - Actualiza `DataInitializer` de forma **idempotente** (si ya existen categorías previas en base de datos sin `precioPorFoto`, asegúrate de contemplar valores por defecto seguros o actualización inicial sin romper el arranque con `ddl-auto: update`).
4. **Cálculo en servidor (Server-Side Truth):** El frontend puede previsualizar el pago al reportero, pero **el backend debe calcular y persistir obligatoriamente `precioReportero`**; nunca confíes en un importe calculado desde el cliente.
5. **Diseño modular preparado para el Ejercicio 3:** Organiza cada nuevo dominio (`editorial`, `reportaje`, `albaran`) con su propia entidad, repositorio, servicio, DTOs, controlador y feature Angular sin acoplamientos innecesarios, de modo que `Editorial` y `Reportero` puedan reutilizarse en el futuro módulo de Exclusivas sin refactorizaciones destructivas.
6. **Validaciones HTTP consistentes:** Usa Jakarta Validation (`@Valid`) en los DTOs de entrada y lanza `ResourceNotFoundException` (404), `InvalidRequestException` (400) o `BusinessRuleException` (409) según las convenciones de `GlobalExceptionHandler`.

---

## 4. Especificación Funcional y Reglas de Negocio (Ejercicio 2)

### 4.1 Requisito previo: Gestión de tarifa por foto en `Categoria`
- Cada categoría (niveles 1 a 4) debe disponer de `precioPorFoto` además de `precioPorHoja`.
- El secretario debe poder consultar y actualizar `precioPorFoto` desde la API (`/api/categorias`) y desde la vista de Categorías en Angular.

### 4.2 Caso de Uso 2.1 — Dar de alta y listar reportajes (`Reportaje`)
- **Actores / Flujo:** El secretario registra un nuevo reportaje de fotos realizado por un reportero.
- **Datos del reportaje:**
  - `reportero` (relación `@ManyToOne` con `Reportero`, obligatorio).
  - `numeroFotos` (`Integer`, obligatorio, mayor que `0`).
  - `descripcion` (`String`, obligatorio, no vacío, longitud acotada).
  - Identificador único (`id`) y fecha de creación/registro si sigue el patrón del proyecto.
- **Regla de negocio crítica:**
  - **Solo un reportero aprobado en bolsa (`reportero.getCategoria() != null`) puede dar de alta un reportaje.** Si el reportero no tiene categoría asignada, rechazar la operación con `BusinessRuleException` (409).
- **Consultas requeridas:**
  - Listar todos los reportajes existentes (incluyendo los datos necesarios del reportero y su categoría/nivel para mostrarlos en UI y calcular compras).

### 4.3 Caso de Uso 2.2 — Gestionar datos de las editoriales (`Editorial`)
- **Actores / Flujo:** El secretario crea, lista, modifica y elimina editoriales con las que trabaja la agencia.
- **Datos de la editorial:**
  - `nombre` (`String`, obligatorio, no vacío).
  - `cif` (`String`, obligatorio, no vacío, **único** en el sistema).
  - `direccion` (`String`, obligatorio, no vacío).
- **Reglas de negocio críticas:**
  - No permitir crear ni modificar una editorial con un `cif` duplicado (`BusinessRuleException` 409).
  - **Bloqueo de borrado con integridad referencial:** Si la editorial tiene algún albarán asociado, **impedir su eliminación** lanzando `BusinessRuleException` (409) con un mensaje claro en español.
- **Consultas y operaciones requeridas:**
  - Listar todas las editoriales, crear nueva editorial, actualizar datos de una editorial existente y eliminar editorial (si no tiene albaranes asociados).

### 4.4 Caso de Uso 2.3 — Adquirir un reportaje (`Albaran`)
- **Actores / Flujo:** Cuando una editorial desea adquirir un reportaje, el secretario genera un albarán de compra.
- **Datos del albarán:**
  - `reportaje` (relación `@ManyToOne` con `Reportaje`, obligatorio).
  - `editorial` (relación `@ManyToOne` con `Editorial`, obligatorio).
  - `precioEditorial` (`BigDecimal`, cantidad que paga la editorial, obligatorio, `>= 0`).
  - `precioReportero` (`BigDecimal`, cantidad que percibe el reportero, **calculado automáticamente**).
  - `fechaCreacion` (fecha de creación del albarán; usar el tipo temporal coherente con `Solicitud` o `LocalDateTime`/`Instant` si se registra fecha exacta de emisión).
- **Fórmula y reglas de negocio críticas:**
  - **Cálculo automático del pago al reportero:**
    $$\text{precioReportero} = \text{categoria.precioPorFoto} \times \text{reportaje.numeroFotos}$$
    usando el nivel/categoría actual del reportero que realizó el reportaje. (Validar igualmente que el reportero tenga categoría con `precioPorFoto` definido).
  - **Restricción de margen mínimo:** El precio a cobrar a la editorial (`precioEditorial`) **nunca puede ser menor** que el precio a pagar al reportero (`precioReportero`), es decir, debe cumplirse `precioEditorial.compareTo(precioReportero) >= 0`. En caso contrario, rechazar con `BusinessRuleException` (409) o `InvalidRequestException` (400) según el criterio usado en el resto de servicios, documentando el motivo en el mensaje.
  - **Ventas no exclusivas:** Un mismo reportaje puede ser adquirido múltiples veces (por la misma o distintas editoriales); cada compra genera un nuevo `Albaran` independiente.
- **Consultas requeridas:**
  - Listar todos los albaranes existentes mostrando reportaje, editorial, importe pagado por la editorial, importe percibido por el reportero, beneficio/margen de la agencia (opcional en UI) y fecha de creación.

---

## 5. Plan de Implementación Paso a Paso (Plan-then-Execute)

Ejecuta las tareas estrictamente en este orden, validando cada capa antes de pasar a la siguiente:

### Fase 1 — Análisis e Inspección
1. Lee `Solicitud.java`, `SolicitudService.java`, `CategoriaService.java`, `ActualizarPrecioCategoriaRequest.java`, `CategoriaResponse.java` y los tests del backend.
2. Lee `siger.models.ts`, `categorias.component.ts` y `solicitudes.component.ts` en el frontend para alinear patrones de UI, formularios reactivos/template-driven, tablas Material, `MatSnackBar` y manejo de errores.

### Fase 2 — Backend: Dominio, Persistencia y Servicios
1. **Categorías:** Añade `precioPorFoto` a `Categoria`, `CategoriaResponse`, `ActualizarPrecioCategoriaRequest` (o endpoint dedicado/unificado compatible hacia atrás) y `DataInitializer` (asegurando migración/inicialización segura si ya hay filas en `categorias`).
2. **Entidades y Repositorios:** Crea `Editorial`, `Reportaje`, `Albaran` y sus respectivos `JpaRepository` en `com.siger.backend.model` y `com.siger.backend.repository`.
3. **DTOs:** Crea los `Request` y `Response` necesarios con validaciones `@NotNull`, `@NotBlank`, `@Positive`, `@DecimalMin`, etc.
4. **Servicios transaccionales:** Implementa `EditorialService`, `ReportajeService` y `AlbaranService` con todas las reglas de negocio descritas en la sección 4.
5. **Controladores REST:** Expón `/api/editoriales`, `/api/reportajes` y `/api/albaranes` manteniendo la semántica HTTP y `ResponseEntity` del proyecto.

### Fase 3 — Frontend: Modelos, Servicios y Vistas Angular
1. Actualiza `core/models/siger.models.ts` y `core/services/categorias.service.ts` para soportar `precioPorFoto`.
2. Crea los servicios `editoriales.service.ts`, `reportajes.service.ts` y `albaranes.service.ts` en `core/services/`.
3. Actualiza `CategoriasComponent` para visualizar y editar `precioPorFoto` sin perder la edición de `precioPorHoja`.
4. Crea los componentes standalone bajo `src/app/features/`:
   - `reportajes/`: Alta de reportaje (seleccionando reporteros aprobados) y listado de reportajes.
   - `editoriales/`: Alta, edición, borrado (mostrando error claro si tiene albaranes) y listado de editoriales.
   - `albaranes/`: Formulario de adquisición de reportaje (mostrando cálculo orientativo de `precioReportero` y validando `precioEditorial >= precioReportero`) y listado de albaranes.
5. Registra las rutas en `app.routes.ts` y añade los enlaces en `app.component.ts` manteniendo la estética de `SIGER · Journ SL`.

### Fase 4 — Pruebas y Verificación Final
1. Añade tests unitarios/integración y `MockMvc` en `backend/src/test/java/com/siger/backend/` cubriendo:
   - Actualización y persistencia de `precioPorFoto` en categorías.
   - Alta y listado de reportajes + rechazo cuando el reportero no tiene categoría asignada.
   - CRUD completo de editoriales + rechazo por CIF duplicado + rechazo (`409`) al intentar borrar una editorial con albaranes asociados.
   - Compra de reportaje (albarán): cálculo automático exacto de `precioReportero`, rechazo si `precioEditorial < precioReportero`, y permiso de múltiples ventas (múltiples albaranes) del mismo reportaje.
2. Ejecuta la suite completa de tests del backend y la compilación de producción del frontend.

---

## 6. Criterios de Aceptación y Formato de Entrega (Definition of Done)

No des por finalizada la tarea hasta cumplir y verificar **todos** los puntos siguientes:

- [ ] `./mvnw test` (o `mvnw.cmd test` en Windows) finaliza con **0 fallos** incluyendo todos los tests del Ejercicio 1 y los nuevos tests del Ejercicio 2.
- [ ] `npm run build` en `reportero/frontend` compila sin errores de TypeScript ni de Angular.
- [ ] Todas las reglas de negocio (reportero con categoría, CIF único, bloqueo de borrado de editorial con albaranes, cálculo servidor de `precioReportero`, `precioEditorial >= precioReportero` y ventas múltiples) están validadas tanto en código como en tests automatizados.
- [ ] Al finalizar, presenta un resumen estructurado con:
  1. **Archivos creados y modificados** (Backend y Frontend).
  2. **Decisiones de diseño** (endpoints, esquema de entidades y extensibilidad para el Ejercicio 3).
  3. **Resultado exacto de los comandos de verificación ejecutados** (`mvnw test` y `npm run build`).
