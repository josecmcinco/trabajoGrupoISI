# Master Prompt: SIGER — Sistema de Gestión de Reporteros

> **Tipo de documento:** Especificación de Prompt Estructurado (Role + Context + Constraints + CoT Execution + Acceptance Criteria)  
> **Caso de Estudio 2:** Sistema de Gestión de Solicitudes para una Empresa de Reporteros (Journ SL)  
> **Autores:** [Nombre manuscrito parcialmente ilegible] / Andrés Silva  

---

## 1. Rol y Objetivo (Persona)

Actúa como un **Arquitecto de Software Senior Full-Stack** especializado en **Java con Spring Boot 4** y **Angular 21**. Tu objetivo es diseñar, implementar y verificar la aplicación web **SIGER (Sistema de Gestión de Reporteros)** para la empresa **Journ SL**, garantizando código limpio, tipado estricto, pruebas automatizadas y cumplimiento exacto de las reglas de negocio.

---

## 2. Regla Fundamental de Ejecución Incremental

El caso de estudio consta de **3 ejercicios** que se desarrollan de forma estrictamente incremental:
1. **No debes pasar al Ejercicio 2** hasta asegurarte de que el **Ejercicio 1 funciona perfectamente** (compila, pasa todos los tests y todas las funcionalidades operan extremo a extremo).
2. **No debes pasar al Ejercicio 3** hasta que el **Ejercicio 2 funcione perfectamente**.
3. **Prioridad de calidad:** Lo importante del ejercicio no es acabarlo todo rápido, sino que **lo que hagas, lo hagas bien**.

---

## 3. Contexto de Negocio (Dominio SIGER)

La empresa **Journ SL** gestiona artículos para su distribución a editoriales de prensa y opera con reporteros que trabajan como profesionales libres. Actualmente el proceso de presentación y gestión de solicitudes se realiza de forma manual y se desea automatizar mediante **SIGER**.

Flujo principal del negocio:
* Los reporteros presentan solicitudes para entrar en la bolsa de reporteros de la empresa.
* Una vez al mes, la dirección evalúa las solicitudes y comunica al secretario cuáles son aprobadas y con qué categoría entran.
* Los reporteros en bolsa están clasificados en **4 categorías de calidad**, cada una con un **precio fijo por página/hoja escrita**.
* Los reporteros pueden **promocionar** a categorías superiores cuando mejora la calidad de sus escritos.
* El **secretario** es el operador principal que introduce y gestiona la información en el sistema.

---

## 4. Arquitectura y Stack Tecnológico (Restricciones Técnicas)

### 4.1 Estructura del Repositorio (Monorepo)
Organiza el proyecto en un monorepo con dos carpetas raíz claramente separadas:
* `/backend` — API REST en **Java** (LTS compatible, ej. Java 21/25) + **Spring Boot 4**.
* `/frontend` — Aplicación SPA en **Angular 21**.
* `docker-compose.yml` en la raíz (o en `/backend`) para levantar la base de datos **PostgreSQL**.

### 4.2 Arquitectura del Backend (`/backend`)
* **Patrón:** Arquitectura en Capas clásica (`Controller` → `Service` → `Repository`).
  * `controller`: Controladores REST (`@RestController`), validación de entrada (`@Valid`), códigos HTTP semánticos (`200`, `201`, `204`, `400`, `404`, `409`).
  * `service`: Lógica de negocio, reglas de validación e invariantes del dominio, transacciones (`@Transactional`).
  * `repository`: Interfaces de **Spring Data JPA**.
  * `model` / `entity`: Entidades JPA y enumerados.
  * `dto`: Objetos de transferencia (`record` de Java) para request/response; **nunca exponer entidades JPA directamente en los controladores**.
  * `exception`: Manejo centralizado de errores con `@RestControllerAdvice` y respuestas estructuradas (ProblemDetail / JSON uniforme).
* **Persistencia:**
  * Base de datos principal: **PostgreSQL** (configurada vía `docker-compose.yml`) con **Spring Data JPA**.
  * Base de datos para pruebas: **H2 en memoria** exclusiva para el perfil `test` (`@ActiveProfiles("test")`).
* **Seguridad:**
  * **Sin autenticación por ahora** (API abierta enfocada al 100% en la lógica de negocio del Ejercicio 1).
  * Configurar **CORS** explícitamente para permitir peticiones desde el servidor de desarrollo de Angular (`http://localhost:4200`).

### 4.3 Arquitectura del Frontend (`/frontend`)
* **Framework:** **Angular 21** con:
  * **Standalone Components** (sin `NgModules`).
  * **Signals** (`signal`, `computed`, `effect`) para la gestión reactiva del estado local y de vistas.
  * Nuevo flujo de control nativo (`@if`, `@for`, `@switch`).
  * `HttpClient` tipado en servicios dedicados por recurso (`SolicitudesService`, `CategoriasService`, `ReporterosService`).
* **UI / Diseño:** **Angular Material** (tablas con `MatTable`, formularios reactivos con `MatFormField` / `MatInput` / `MatSelect`, diálogos de confirmación/edición, `MatSnackBar` para notificaciones de éxito o error de negocio).

---

## 5. Especificación Funcional — Ejercicio 1

Implementa las siguientes 4 funcionalidades respetando estrictamente todas sus reglas e invariantes:

### 5.1 Dar de alta una nueva solicitud
* **Histórico:** El sistema debe mantener un histórico completo de todas las solicitudes presentadas, ya que un reportero puede presentar varias solicitudes a lo largo del tiempo (por ejemplo, si fue rechazado anteriormente).
* **Datos de la solicitud:**
  * Identificador único.
  * Fecha de presentación.
  * Descripción del equipo fotográfico (opcional, si dispone de él).
  * Resumen del CV del reportero.
  * Estado de la solicitud (ej. `PENDIENTE`, `APROBADA`, `RECHAZADA`).
* **Datos del reportero:**
  * Si es la **primera solicitud** del reportero, debe proporcionar sus datos personales: `DNI`, `nombre`, `apellidos`, `dirección`, `ciudad`, `código postal`, `teléfono`.
  * **Invariante de inmutabilidad:** Entre varias solicitudes de un mismo reportero (identificado por su DNI), sus datos personales **no varían**; lo único que varía en nuevas solicitudes es su **equipo fotográfico** y su **CV**.
* **Regla de negocio (Restricción temporal):**
  * Un reportero **no puede presentar más de una solicitud por mes** (se considera que en menos de un mes no habrá modificado sustancialmente ni su equipo ni su CV). Si intenta registrar una solicitud dentro del mismo mes o antes de cumplirse el plazo mensual respecto a su última solicitud, el backend debe rechazarla con un error claro (`400` / `409`) y el frontend debe mostrar el mensaje correspondiente.
* **Acciones requeridas:** El secretario debe poder **registrar** una nueva solicitud y **listar todo el conjunto de solicitudes existentes** (incluyendo histórico).

### 5.2 Aprobar solicitudes
* Tras la reunión mensual de dirección, el secretario actualiza en el sistema las solicitudes aprobadas.
* Por cada solicitud/reportero aprobado, el secretario debe **especificar la categoría** (de entre las 4 disponibles) con la que entra en la bolsa de reporteros.
* **Acciones requeridas:**
  * Aprobar una solicitud pendiente asignándole una categoría inicial (lo que incorpora al reportero a la bolsa activa en dicha categoría).
  * **Listar el conjunto de solicitudes aceptadas**.

### 5.3 Gestionar categorías
* Existen **4 categorías de calidad** que clasifican a los reporteros en bolsa.
* Cada categoría tiene un **precio fijo por hoja/página escrita**.
* El secretario puede actualizar el precio por hoja escrita de cada categoría según las órdenes de dirección.
* **Acciones requeridas:**
  * **Listar** el conjunto de las 4 categorías con su nivel y precio actual.
  * **Actualizar el precio** por hoja escrita de una categoría (validando que el precio sea positivo).

### 5.4 Promocionar reportero
* Los reporteros en bolsa pueden aumentar de categoría cuando mejoran la calidad de sus escritos.
* El secretario registra la promoción en el sistema seleccionando al reportero y su nueva categoría.
* **Regla de negocio (Restricción de ascenso):**
  * **Solo se puede ascender a categorías superiores; nunca se puede bajar la categoría de un reportero.** (Si la categoría destino es igual o inferior a la actual, el backend debe rechazar la operación con un error descriptivo).
* **Acciones requeridas:**
  * Listar los reporteros en bolsa con su categoría actual.
  * Modificar (ascender) la categoría de un reportero respetando la restricción de no retroceso.

---

## 6. Plan de Ejecución Paso a Paso (Chain-of-Thought)

Ejecuta el desarrollo siguiendo estrictamente este orden, validando cada fase antes de avanzar a la siguiente:

1. **Fase 1 — Infraestructura Base:**
   * Crear `docker-compose.yml` con PostgreSQL.
   * Inicializar `/backend` (Spring Boot 4, Spring Web, Spring Data JPA, Validation, PostgreSQL Driver, H2 scope test).
   * Inicializar `/frontend` (Angular 21, Angular Material, configuración de proxy/environments hacia el backend).
2. **Fase 2 — Modelo de Dominio y Persistencia (Backend):**
   * Diseñar entidades JPA (`Reportero`, `Solicitud`, `Categoria`) y relaciones.
   * Precargar las **4 categorías iniciales** (ej. vía `data.sql` o `CommandLineRunner` idempotente).
   * Implementar repositorios Spring Data JPA.
3. **Fase 3 — Lógica de Negocio, Servicios y Tests (Backend):**
   * Implementar los servicios con todas las validaciones (1 solicitud/mes, datos personales inmutables, aprobación con categoría, promoción solo ascendente, precio > 0).
   * Escribir **tests unitarios y de integración** usando **H2** que cubran tanto los casos de éxito como todas las restricciones de negocio.
4. **Fase 4 — Capa REST y Manejo de Errores (Backend):**
   * Implementar controladores REST y DTOs (`record`).
   * Implementar `@RestControllerAdvice` y verificar con pruebas de integración (`MockMvc` / `TestRestTemplate`).
5. **Fase 5 — Interfaz de Usuario (Frontend Angular 21):**
   * Implementar layout principal con navegación clara (`Solicitudes`, `Aprobaciones / Aceptadas`, `Categorías`, `Reporteros / Promoción`).
   * Conectar cada vista a los endpoints del backend usando servicios tipados y `Signals`.
   * Manejar estados de carga, validaciones de formulario y mensajes de error del servidor.
6. **Fase 6 — Verificación Final del Ejercicio 1:**
   * Levantar PostgreSQL, backend y frontend.
   * Comprobar que todos los tests pasan y validar manualmente los 4 flujos del Ejercicio 1 antes de considerar el Ejercicio 2.

---

## 7. Criterios de Aceptación (Definition of Done)

Para dar por completado el **Ejercicio 1**, debe cumplirse todo lo siguiente:
- [ ] El proyecto compila sin errores tanto en `/backend` como en `/frontend`.
- [ ] Todos los tests automatizados del backend (con H2) pasan al 100%, incluyendo casos límite:
  - Rechazo de segunda solicitud de un mismo reportero dentro del mismo mes.
  - Conservación de datos personales en solicitudes sucesivas de un mismo DNI.
  - Rechazo de intento de bajar o mantener categoría al promocionar un reportero.
- [ ] Las 4 categorías existen desde el arranque y su precio es editable y listable.
- [ ] La interfaz Angular 21 + Angular Material permite ejecutar de forma intuitiva los 4 casos de uso del secretario sin errores en consola.
