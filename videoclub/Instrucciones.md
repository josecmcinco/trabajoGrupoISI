# 🎬 APPV Videoclub — Guía Maestra de Prompts de Desarrollo Full-Stack
> **Rol del Asistente:** Senior Full-Stack Architect & Prompt Engineer (Especialista en Spring Boot & Angular 21)  
> **Objetivo:** Construcción guiada paso a paso de la aplicación web de gestión para la cadena de videoclubs APPV.  
> **Metodología de Prompting:** *CO-STAR Framework*, Descomposición en Fases (*Chain-of-Thought*), Especificación de Invariantes y *Negative Prompting* estricto.

---

## 🏗️ 1. Definición Arquitectónica Consolidada

A partir de las decisiones tomadas para el proyecto, la arquitectura queda fijada con las siguientes directrices:

| Dimensión | Decisión Seleccionada | Detalle de Implementación |
| :--- | :--- | :--- |
| **Persistencia** | **PostgreSQL + Docker Compose** | Contenedor local con `docker-compose.yml`, Spring Data JPA, migraciones automáticas / script inicial SQL. |
| **Estructura Proyecto** | **Monorepo Estructurado** | Raíz con carpetas `/backend` (Maven/Gradle + Java 21 + Spring Boot) y `/frontend` (Angular 21 CLI). |
| **Seguridad / Roles** | **Mock Contextual de Roles** | Selector de perfil activo en la barra superior (`ADMIN`, `GERENTE`, `SOCIO`) para pruebas ágiles de reglas de negocio sin sobrecarga de tokens. |
| **Librería UI** | **Angular Material 3** | `@angular/material` para inputs, datepickers, tablas, diálogos modales y componentes accesibles. |

---

## 📌 2. Contexto del Negocio y Requisitos de Dominio

La cadena de videoclubs **APPV** requiere una plataforma web integral para gestionar sus sedes, catálogo de películas, socios, alquileres agrupados y estadísticas mensuales.

### 2.1. Entidades del Dominio y Atributos

| Entidad | Atributos | Modificable | Reglas Específicas |
| :--- | :--- | :--- | :--- |
| **Videoclub** | `id` (autonumérico)<br>`nombreGerente` (cadena, obligatorio)<br>`ciudad` (cadena, obligatorio)<br>`calle` (cadena, obligatorio)<br>`codigoPostal` (cadena 5 chars, obligatorio) | Sí (datos gerente y dirección) | Sede física de la cadena. |
| **Película** | `id` (autonumérico)<br>`nombre` (cadena, obligatorio)<br>`director` (cadena, opcional)<br>`fechaEstreno` (fecha, obligatorio)<br>`precioAlquiler` (decimal, obligatorio)<br>`videoclubId` (FK, obligatorio) | Sí | **Pertenencia obligatoria:** Cada película se asigna a un videoclub.<br>**Identidad:** Mismo título en diferentes videoclubs representa objetos/registros distintos. |
| **Socio** | `id` (autonumérico)<br>`nombre` (cadena, obligatorio)<br>`edad` (entero, obligatorio)<br>`videoclubOrigenId` (FK, obligatorio) | Sí | **Alcance global:** Se registra en un videoclub concreto, pero tiene derecho a alquilar en cualquier videoclub de la cadena. |
| **Alquiler** | `id` (autonumérico)<br>`socioId` (FK, obligatorio)<br>`videoclubId` (FK, obligatorio)<br>`fechaRecogida` (fecha, obligatorio)<br>`fechaDevolucion` (fecha, obligatorio)<br>`totalPagar` (decimal, calculado/derivado)<br>`peliculas` (Lista de Películas, 1..N) | `fechaRecogida`: **NO**<br>`fechaDevolucion`: **SÍ**<br>`totalPagar`: **NO** (derivado) | **Agrupación:** Un alquiler contiene 1 o más películas.<br>**Homogeneidad:** Todas las películas comparten fecha de recogida y devolución.<br>**Cálculo derivado:** `totalPagar = SUM(precioAlquiler de cada película)`.<br>**Validación de fecha:** `fechaDevolucion` solo puede actualizarse a una fecha posterior a la fecha de referencia/actual indicada por el usuario. |
| **Estadística Socio** | `id` (autonumérico)<br>`socioId` (FK, obligatorio)<br>`mesAnio` (YYYY-MM o número de mes, obligatorio)<br>`fechaCreacion` (fecha, obligatorio)<br>`totalGastado` (decimal, calculado/derivado) | `fechaCreacion`: **NO**<br>`totalGastado`: **NO** (derivado) | **Generación mensual:** El administrador introduce socio y mes de cálculo.<br>**Restricción de unicidad:** Máximo 1 registro estadístico por socio por mes.<br>**Cálculo derivado:** Suma de `totalPagar` de alquileres efectuados por ese socio en ese mes. |
| **Administrador** | `id` (autonumérico)<br>`nombre` (cadena, obligatorio) | Sí | Responsable de la generación de estadísticas y administración global. |

---

## ⚠️ 3. Invariantes Críticos y Negative Prompting (Reglas No Negociables)

```text
[PROHIBICIÓN CRÍTICA - MANEJO DE FECHAS]
BAJO NINGUNA CIRCUNSTANCIA se debe utilizar la fecha del reloj del sistema (ej. LocalDate.now(), new Date(), CURRENT_DATE).
Todas las fechas operativas (fecha del día de referencia, fecha de recogida, fecha de devolución, fecha de estreno, fecha de cálculo estadístico)
DEBEN ser solicitadas explícitamente al usuario a través de la interfaz de usuario y los payloads de la API.
```

1. **Inmutabilidad de Fecha de Recogida:** Una vez creado el alquiler, `fechaRecogida` es fija y no editable.
2. **Validación Temporal de Devolución:** La `fechaDevolucion` modificada debe ser estrictamente posterior a la fecha de referencia provista por el usuario.
3. **Unicidad Estadística:** Bloquear a nivel de base de datos (`UNIQUE(socio_id, mes_anio)`) y en capa de servicio la inserción de más de una estadística para un socio en el mismo mes.
4. **Objetos Película Independientes:** Las películas pertenecen a una sede física. Mismo título en sede A y sede B son entidades con IDs distintos.
5. **Cálculos siempre derivados:** Nunca persistir valores de precios o totales calculados manualmente por el cliente; el backend recalcula y valida siempre `totalPagar` y `totalGastado`.

---

## 🚀 4. Secuencia Maestra de Prompts de Ejecución (Phased Prompt Pipeline)

Sigue esta secuencia paso a paso. Cada fase actúa como un bloque modular autocontenido y listo para ejecutar.

---

### 🔹 Fase 0: Infraestructura y Estructura Monorepo

```markdown
### ROL & OBJETIVO:
Actúa como DevOps y Lead Developer. Configura la estructura monorepo para "APPV Videoclub" y la infraestructura local con Docker Compose.

### ACCIONES REQUERIDAS:
1. Estructura de carpetas:
   ├── /backend               # Proyecto Spring Boot (Maven, Java 21)
   ├── /frontend              # Proyecto Angular 21 (Standalone, Material 3)
   ├── docker-compose.yml     # PostgreSQL 16 y pgAdmin (opcional)
   └── README.md
2. Crear `docker-compose.yml` para levantar PostgreSQL:
   - Contenedor: `postgres:16-alpine`
   - Base de datos: `videoclub_db`
   - Usuario: `postgres` / Password: `password`
   - Puerto expuesto: `5432:5432`
   - Volumen persistente para datos.
3. Configuración inicial `application.yml` en `/backend`:
   - Conexión JDBC a PostgreSQL.
   - `spring.jpa.hibernate.ddl-auto=update`
   - `spring.jpa.properties.hibernate.format_sql=true`
4. Instrucciones para inicializar el workspace y verificar que el contenedor responda.

### FORMATO DE SALIDA:
Archivos de configuración listos (`docker-compose.yml`, `application.yml`), comandos de terminal powershell para inicializar ambos proyectos.
```

---

### 🔹 Fase 1: Modelado de Dominio y Capa de Persistencia (Backend)

```markdown
### ROL & OBJETIVO:
Actúa como Arquitecto Backend Senior en Java Spring Boot. Modela las entidades JPA y repositorios para la aplicación "APPV Videoclub" conectada a PostgreSQL.

### CONTEXTO & REGLAS:
1. Tecnologías: Java 21, Spring Boot, Spring Data JPA, PostgreSQL.
2. Entidades a generar en el paquete `com.videoclub.domain.model`:
   - `Videoclub`: id (autoincremental), nombreGerente (not null), ciudad (not null), calle (not null), codigoPostal (longitud 5).
   - `Pelicula`: id (autoincremental), nombre (not null), director (opcional), fechaEstreno (LocalDate, not null), precioAlquiler (BigDecimal, not null), videoclub (ManyToOne, FetchType.LAZY).
   - `Socio`: id (autoincremental), nombre (not null), edad (int, not null), videoclubOrigen (ManyToOne, FetchType.LAZY).
   - `Alquiler`: id (autoincremental), socio (ManyToOne), videoclub (ManyToOne), fechaRecogida (LocalDate, not null), fechaDevolucion (LocalDate, not null), totalPagar (BigDecimal, not null), peliculas (ManyToMany con join table `alquiler_peliculas`).
   - `EstadisticaSocio`: id (autoincremental), socio (ManyToOne), mesAnio (String formato "YYYY-MM", not null), fechaCreacion (LocalDate, not null), totalGastado (BigDecimal, not null). Constraint único: `@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"socio_id", "mesAnio"}))`.
   - `Administrador`: id (autoincremental), nombre (not null).
3. **REGLA CRÍTICA:** No usar `@CreationTimestamp`, `CURRENT_TIMESTAMP` ni `LocalDate.now()`. Toda fecha se inyecta desde los servicios.
4. Repositorios Spring Data (`JpaRepository`):
   - `AlquilerRepository`: Búsqueda de alquileres de un socio en un rango de fechas (`fechaRecogida BETWEEN :inicio AND :fin`).
   - `EstadisticaSocioRepository`: `existsBySocioIdAndMesAnio(Long socioId, String mesAnio)`, búsqueda de estadísticas por socio.
   - `PeliculaRepository`: Búsqueda por videoclub.

### FORMATO DE SALIDA:
Código Java de entidades completas con anotaciones Jakarta Persistence y repositorios Spring Data correspondientes.
```

---

### 🔹 Fase 2: Lógica de Negocio, DTOs y Validaciones (Backend)

```markdown
### ROL & OBJETIVO:
Actúa como Ingeniero de Software Spring Boot. Implementa los DTOs, mappers y la capa de servicios `@Service` con transaccionalidad para "APPV Videoclub".

### CASOS DE USO OBLIGATORIOS:
1. **CRUD Videoclubs, Películas y Socios:**
   - DTOs separados para Request y Response (usando `record` o clases inmutables).
   - Validaciones con Jakarta Bean Validation (`@NotBlank`, `@NotNull`, `@Size(min=5, max=5)` para CP).
2. **Creación de Alquiler:**
   - Request DTO: `socioId`, `videoclubId`, `List<Long> peliculaIds`, `fechaRecogida` (manual), `fechaDevolucion` (manual).
   - Validación: `fechaDevolucion.isAfter(fechaRecogida)`.
   - Cálculo del total: Sumar `pelicula.getPrecioAlquiler()` de todas las películas asociadas. Asignar al alquiler.
3. **Modificación de Fecha de Devolución:**
   - Request DTO: `alquilerId`, `nuevaFechaDevolucion`, `fechaReferenciaUsuario` (la fecha que el usuario introduce como fecha actual en la interfaz).
   - Validación: `nuevaFechaDevolucion.isAfter(fechaReferenciaUsuario)`.
   - Invariante: `fechaRecogida` NO se modifica bajo ninguna circunstancia.
4. **Cálculo de Estadística Mensual (Triggered by Admin):**
   - Request DTO: `socioId`, `mesAnio` (ej. "2026-11"), `fechaOperacion` (manual).
   - Validación de Unicidad: Si `existsBySocioIdAndMesAnio` es true, lanzar `DuplicateStatisticException("Ya existe una estadística para este socio en el mes indicado")`.
   - Cálculo: Consultar todos los alquileres del socio cuya `fechaRecogida` corresponda al mes y año indicados. Sumar sus `totalPagar`.
   - Persistir la entidad `EstadisticaSocio` con el total acumulado y la `fechaOperacion` introducida.

### RESTRICCIÓN:
Prohibido el uso de `LocalDate.now()`.

### FORMATO DE SALIDA:
DTOs (Records), Excepciones de negocio personalizadas y Servicios con `@Transactional`.
```

---

### 🔹 Fase 3: Exposición de API RESTful y Documentación (Backend)

```markdown
### ROL & OBJETIVO:
Desarrolla los `@RestController` y el manejador global de excepciones para "APPV Videoclub" en Spring Boot.

### ENDPOINTS ESPECÍFICOS:
- **Videoclubs:**
  - `POST /api/videoclubs`, `GET /api/videoclubs`, `GET /api/videoclubs/{id}`, `PUT /api/videoclubs/{id}`
- **Películas:**
  - `POST /api/peliculas`, `GET /api/peliculas?videoclubId={id}`
- **Socios:**
  - `POST /api/socios`, `GET /api/socios`
- **Alquileres:**
  - `POST /api/alquileres` (crear alquiler con lista de películas y fechas manuales)
  - `PATCH /api/alquileres/{id}/fecha-devolucion` (actualizar devolución validada con fecha de referencia)
  - `GET /api/alquileres/socio/{socioId}` (historial de alquileres)
- **Estadísticas:**
  - `POST /api/estadisticas/calcular` (calcular y persistir estadística mensual para un socio)
  - `GET /api/estadisticas/socio/{socioId}` (consultar estadísticas históricas)

### REQUISITOS ADICIONALES:
1. `@RestControllerAdvice` con respuestas estructuradas `ErrorResponse(timestamp, status, error, message, path)`.
2. Habilitar CORS para `http://localhost:4200`.
3. Anotaciones OpenAPI / Swagger para prueba interactiva en `/swagger-ui.html`.

### FORMATO DE SALIDA:
Código completo de los controladores REST, configuración de CORS y Global Exception Handler.
```

---

### 🔹 Fase 4: Arquitectura Base, Angular Material y Servicios (Frontend)

```markdown
### ROL & OBJETIVO:
Actúa como Frontend Architect especializado en Angular 21 y Angular Material 3. Configura la base del cliente web en `/frontend`.

### REQUISITOS:
1. Configuración de Angular 21 con Standalone Components (sin `NgModule`) y provideHttpClient.
2. Integración de `@angular/material` (temas M3, iconos, datepickers, botones, tablas, selectores, dialogs).
3. **Servicio Central de Fecha de Simulación (`UserDateContextService`):**
   - Servicio singleton con un Angular Signal: `currentSimulatedDate = signal<Date | null>(null)`.
   - Métodos: `setDate(date: Date)`, `getDate()`.
   - Garantiza que toda la aplicación use esta fecha definida manualmente por el usuario.
4. **Servicio Mock de Rol Activo (`UserRoleContextService`):**
   - Signal de rol actual: `currentRole = signal<'ADMIN' | 'GERENTE' | 'SOCIO'>('ADMIN')`.
   - Permite cambiar de rol dinámicamente desde el header de la aplicación.
5. Modelos e interfaces TypeScript (`Videoclub`, `Pelicula`, `Socio`, `Alquiler`, `EstadisticaSocio`).
6. Servicios HTTP (`VideoclubService`, `PeliculaService`, `SocioService`, `AlquilerService`, `EstadisticaService`) usando `inject(HttpClient)`.

### FORMATO DE SALIDA:
Modelos TypeScript, servicios Angular con Signals e inyección de dependencias moderna.
```

---

### 🔹 Fase 5: Vistas, Componentes Standalone y Formularios Reactivos (Frontend)

```markdown
### ROL & OBJETIVO:
Desarrolla la suite de componentes de Angular 21 con Angular Material 3 para cubrir todas las pantallas de "APPV Videoclub".

### COMPONENTES A IMPLEMENTAR:
1. **Header & Context Bar (`AppHeaderComponent`):**
   - Mat-Toolbar con:
     - Selector de Rol Activo (`ADMIN`, `GERENTE`, `SOCIO`).
     - Selector de Fecha de Referencia/Simulación con `mat-datepicker` manual.
2. **Módulo Videoclubs & Catálogo de Películas:**
   - Tabla `mat-table` de videoclubs.
   - Selector de videoclub activo para ver las películas de dicha sede.
   - Formulario modal (`MatDialog`) para dar de alta películas vinculadas a la sede elegida.
3. **Módulo de Alquileres (`AlquilerFormComponent` & `AlquilerListComponent`):**
   - Formulario reactivo:
     - Selector de socio.
     - Selector múltiple de películas (`mat-select` multiple).
     - Input manual de `fechaRecogida` y `fechaDevolucion` con `mat-datepicker`.
     - Campo calculado automático en tiempo real: `totalPagar` (suma reactiva de películas seleccionadas con `computed()`).
   - Listado de alquileres con acción "Modificar Fecha de Devolución": abre diálogo que valida que la nueva fecha sea posterior a `UserDateContextService.currentSimulatedDate()`.
4. **Módulo de Estadísticas Mensuales (`EstadisticasAdminComponent`):**
   - Visible y accesible para rol `ADMIN`.
   - Selector de socio y selector de mes/año (selector de mes o input fecha manual).
   - Botón "Calcular Estadística Mensual".
   - Alerta visual en caso de que ya exista estadística registrada para ese mes.
   - Tabla y tarjetas con el total de euros gastados.

### REQUISITOS TÉCNICOS:
- Formularios reactivos con validaciones visuales de Angular Material (`mat-error`).
- Feedback de éxito y error mediante `MatSnackBar`.

### FORMATO DE SALIDA:
Archivos `.ts`, `.html` y `.scss` de los componentes Standalone.
```

---

## 📋 5. Check-list de Validación Final

- [x] Monorepo con `/backend` y `/frontend`.
- [x] PostgreSQL 16 configurado en `docker-compose.yml`.
- [x] Spring Boot con Java 21 y arquitectura limpia por capas.
- [x] Angular 21 Standalone + Signals + Angular Material 3.
- [x] Control manual estricto de todas las fechas (cero dependencias de `LocalDate.now()`).
- [x] Validación de unicidad de estadística mensual por socio.
- [x] Modificación de fecha de devolución restringida a fechas posteriores a la referencia.
- [x] Películas homónimas admitidas con IDs independientes por videoclub.
