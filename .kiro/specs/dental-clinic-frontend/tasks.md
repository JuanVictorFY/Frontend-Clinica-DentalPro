# Implementation Plan: Frontend Clínica DentalPro

## Overview

Implementación incremental del frontend Angular 21+ para la intranet DentalPro. Se construye desde la infraestructura core (modelos, servicios, guards, interceptor) hacia los módulos de feature (pacientes, citas, atención, usuarios, reportes), finalizando con la integración del layout y la navegación. Se utiliza TailwindCSS 4 para estilos, standalone components, signals, y lazy loading por feature.

## Tasks

- [x] 1. Configurar modelos core, servicios base y seguridad
  - [x] 1.1 Crear modelos e interfaces compartidas
    - Crear `src/app/core/models/user.model.ts` con interfaces `UserProfile`, `TokenPayload`, enum `UserRole`
    - Crear `src/app/core/models/auth.model.ts` con interfaces `LoginRequest`, `LoginResponse`
    - Crear `src/app/core/models/api-response.model.ts` con interfaces `PaginatedResponse`, `ApiError`
    - _Requirements: 1.1, 2.5, 2.6, 2.7_

  - [x] 1.2 Implementar AuthService
    - Crear `src/app/core/services/auth.service.ts` con signals (`currentUser`, `isAuthenticated`)
    - Implementar métodos: `login()`, `logout()`, `getToken()`, `getUserRole()`, `isTokenExpired()`, `decodeToken()`
    - Almacenar/eliminar Token_JWT en localStorage
    - Redirigir según rol tras login exitoso
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 1.3 Implementar NotificationService
    - Crear `src/app/core/services/notification.service.ts`
    - Implementar métodos `showSuccess()`, `showError()`, `showWarning()` con notificaciones visuales tipo toast
    - _Requirements: 16.3, 16.4_

  - [x] 1.4 Implementar Auth Guard funcional
    - Crear `src/app/core/guards/auth.guard.ts` con `CanActivateFn`
    - Verificar existencia y validez del token JWT
    - Redirigir a `/login` si token ausente, expirado o malformado
    - Eliminar token expirado y mostrar mensaje de sesión expirada
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 1.5 Implementar Role Guard funcional
    - Crear `src/app/core/guards/role.guard.ts` con `CanActivateFn`
    - Leer roles permitidos desde `route.data['roles']`
    - Redirigir a `/acceso-denegado` si el rol no está permitido
    - Administrador accede a todo, Recepcionista a pacientes/citas, Odontólogo a atención/reportes
    - _Requirements: 2.2, 2.5, 2.6, 2.7_

  - [x] 1.6 Implementar HTTP Interceptor funcional
    - Crear `src/app/core/interceptors/auth.interceptor.ts` con `HttpInterceptorFn`
    - Adjuntar token JWT en header `Authorization: Bearer {token}` en cada petición
    - Configurar timeout de 30 segundos
    - Manejar errores 401 (logout + redirect), 403 (notificación), 500 (notificación genérica), timeout
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 1.7 Write property test: Validación de acceso por token (Property 3)
    - **Property 3: Para cualquier estado del token (ausente, expirado, malformado, válido), el guard permite acceso solo con token existente y no expirado**
    - Generar tokens con fast-check (válidos, expirados, malformados, null)
    - Verificar que el guard permite/deniega correctamente
    - **Validates: Requirements 2.1, 2.3, 2.4**

  - [ ]* 1.8 Write property test: Control de acceso basado en roles (Property 4)
    - **Property 4: Para cualquier combinación rol × ruta, el acceso se concede si y solo si el rol está en la lista de roles permitidos**
    - Generar combinaciones de roles y rutas con fast-check
    - Verificar acceso concedido/denegado según tabla de permisos
    - **Validates: Requirements 2.2, 2.5, 2.6, 2.7, 15.1**

  - [ ]* 1.9 Write property test: Interceptor HTTP adjunta token (Property 9)
    - **Property 9: Para cualquier petición HTTP, el interceptor adjunta el token JWT en el header Authorization si existe**
    - Generar peticiones HTTP aleatorias con fast-check
    - Verificar presencia del header Authorization
    - **Validates: Requirements 16.1**

- [x] 2. Checkpoint - Verificar core services
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implementar módulo de autenticación (Login y Access Denied)
  - [x] 3.1 Crear LoginComponent
    - Crear `src/app/features/auth/login/login.component.ts` (standalone, con template y estilos)
    - Formulario reactivo con campos email y contraseña
    - Botón de envío deshabilitado hasta que ambos campos tengan valores
    - Indicador de carga durante autenticación, formulario deshabilitado durante envío
    - Mostrar mensaje de error genérico en credenciales inválidas
    - Redirigir a `/intranet` tras login exitoso
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [x] 3.2 Crear AccessDeniedComponent
    - Crear `src/app/features/auth/access-denied/access-denied.component.ts`
    - Mostrar mensaje de acceso denegado con opción de volver al panel principal
    - _Requirements: 2.2_

  - [ ]* 3.3 Write property test: Flujo de autenticación round-trip (Property 1)
    - **Property 1: Para credenciales válidas con token JWT retornado, el token queda en localStorage y el usuario es redirigido según su rol**
    - Generar credenciales y tokens con roles aleatorios usando fast-check
    - Verificar almacenamiento de token y redirección correcta por rol
    - **Validates: Requirements 1.1, 1.3**

  - [ ]* 3.4 Write property test: Credenciales inválidas producen error genérico (Property 2)
    - **Property 2: Para cualquier combinación de credenciales inválidas, el sistema muestra el mismo mensaje de error genérico**
    - Generar combinaciones de email/contraseña inválidos con fast-check
    - Verificar que siempre se muestra el mismo mensaje sin revelar cuál campo es erróneo
    - **Validates: Requirements 1.2**

- [x] 4. Implementar componentes compartidos (Shared)
  - [x] 4.1 Crear ConfirmDialogComponent
    - Crear `src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`
    - Diálogo modal reutilizable con título, mensaje, botones confirmar/cancelar
    - Emitir eventos de confirmación y cancelación
    - _Requirements: 6.1, 6.3, 10.1, 10.3, 13.6_

  - [x] 4.2 Crear LoadingSpinnerComponent
    - Crear `src/app/shared/components/loading-spinner/loading-spinner.component.ts`
    - Indicador de carga animado reutilizable con TailwindCSS
    - _Requirements: 1.6, 3.5, 4.4, 5.5, 8.5, 12.5_

  - [x] 4.3 Crear PaginationComponent
    - Crear `src/app/shared/components/pagination/pagination.component.ts`
    - Controles de paginación con inputs de página actual, total de páginas
    - Emitir evento de cambio de página
    - _Requirements: 4.1, 14.4_

  - [x] 4.4 Crear SearchInputComponent
    - Crear `src/app/shared/components/search-input/search-input.component.ts`
    - Campo de búsqueda con debounce (300ms) para evitar peticiones excesivas
    - Emitir evento con texto de búsqueda
    - _Requirements: 4.2_

  - [x] 4.5 Crear EstadoCitaPipe y RoleVisibleDirective
    - Crear `src/app/shared/pipes/estado-cita.pipe.ts` para transformar estados a etiquetas con colores
    - Crear `src/app/shared/directives/role-visible.directive.ts` para mostrar/ocultar elementos según rol
    - _Requirements: 8.4, 15.1_

- [x] 5. Implementar módulo de Pacientes
  - [x] 5.1 Crear modelos y servicio de Pacientes
    - Crear `src/app/features/pacientes/models/paciente.model.ts` con interfaces `Paciente`, `PacienteRequest`
    - Crear `src/app/features/pacientes/services/paciente.service.ts` con métodos: `listar()`, `buscar()`, `obtenerPorId()`, `registrar()`, `actualizar()`, `eliminar()`
    - _Requirements: 3.1, 4.1, 5.1, 6.2_

  - [x] 5.2 Crear PacienteListComponent
    - Crear `src/app/features/pacientes/paciente-list/paciente-list.component.ts`
    - Tabla paginada con columnas: nombre, DNI, teléfono, email
    - Integrar SearchInputComponent para filtrado por nombre/DNI
    - Mostrar indicador de carga, mensaje de lista vacía, y botón reintentar en error
    - Botones de editar y eliminar por fila con diálogo de confirmación para eliminar
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4_

  - [x] 5.3 Crear PacienteFormComponent (registro y edición)
    - Crear `src/app/features/pacientes/paciente-form/paciente-form.component.ts`
    - Formulario reactivo con campos: nombre completo, DNI, fecha nacimiento, teléfono, email
    - Validación en tiempo real de campos obligatorios y formatos
    - Modo registro: enviar datos y mostrar confirmación
    - Modo edición: cargar datos existentes, aplicar mismas validaciones
    - Manejar error de DNI duplicado, indicador de carga durante envío
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4_

  - [x] 5.4 Crear rutas del módulo Pacientes
    - Crear `src/app/features/pacientes/pacientes.routes.ts` con rutas: lista, nuevo, editar/:id
    - _Requirements: 4.1, 3.1, 5.1_

  - [ ]* 5.5 Write property test: Validación de formularios rechaza datos inválidos (Property 5)
    - **Property 5: Para cualquier combinación de campos donde al menos uno esté vacío o con formato inválido, el formulario impide el envío**
    - Generar combinaciones de campos válidos/inválidos con fast-check para formulario de paciente
    - Verificar que el formulario es válido solo cuando todos los campos obligatorios son correctos
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 5.6 Write property test: Filtrado de búsqueda retorna resultados correctos (Property 6)
    - **Property 6: Para cualquier texto de búsqueda y conjunto de pacientes, el filtrado retorna solo los que coinciden parcialmente por nombre o DNI**
    - Generar listas de pacientes y queries aleatorias con fast-check
    - Verificar que todos los resultados coinciden y ningún no-coincidente está incluido
    - **Validates: Requirements 4.2**

- [x] 6. Checkpoint - Verificar módulo de Pacientes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implementar módulo de Citas
  - [x] 7.1 Crear modelos y servicio de Citas
    - Crear `src/app/features/citas/models/cita.model.ts` con interfaces `Cita`, `CitaRequest`
    - Crear `src/app/features/citas/models/estado-cita.model.ts` con enum `EstadoCita` y lógica de transiciones válidas
    - Crear `src/app/features/citas/services/cita.service.ts` con métodos: `listarPorFecha()`, `registrar()`, `actualizar()`, `cancelar()`, `cambiarEstado()`, `verificarDisponibilidad()`
    - _Requirements: 7.1, 7.6, 8.1, 9.2, 10.2, 11.1, 11.2_

  - [x] 7.2 Crear CitaListComponent
    - Crear `src/app/features/citas/cita-list/cita-list.component.ts`
    - Mostrar citas del día actual por defecto
    - Selector de fecha (calendario) para filtrar citas por fecha
    - Mostrar cada cita con: hora, paciente, odontólogo, motivo, estado
    - Diferenciar visualmente estados con colores/etiquetas (EstadoCitaPipe)
    - Botones de editar, cancelar y atender según estado y transiciones válidas
    - Deshabilitar acciones no permitidas según máquina de estados
    - Indicador de carga durante obtención de datos
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.3, 10.1, 11.2, 11.3_

  - [x] 7.3 Crear CitaFormComponent (registro y edición)
    - Crear `src/app/features/citas/cita-form/cita-form.component.ts`
    - Formulario reactivo con campos: paciente (selector con búsqueda), odontólogo (selector), fecha, hora, motivo
    - Validación de campos obligatorios
    - Verificación de conflicto de horario al seleccionar fecha/hora/odontólogo
    - Modo registro: asignar estado "pendiente" automáticamente
    - Modo edición: cargar datos, cambiar estado a "reagendado" si se modifica fecha/hora
    - Diálogo de confirmación para cancelación de citas
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.1, 9.2, 9.4, 10.1, 10.2, 10.3, 10.4_

  - [x] 7.4 Crear rutas del módulo Citas
    - Crear `src/app/features/citas/citas.routes.ts` con rutas: lista, nueva, editar/:id
    - _Requirements: 8.1, 7.1, 9.1_

  - [ ]* 7.5 Write property test: Máquina de estados de citas (Property 7)
    - **Property 7: Solo las transiciones PENDIENTE→{ATENDIDO,CANCELADO,REAGENDADO} y REAGENDADO→{ATENDIDO,CANCELADO} son válidas; ATENDIDO y CANCELADO son terminales**
    - Generar estados y transiciones aleatorias con fast-check
    - Verificar que solo transiciones válidas son aceptadas y las terminales son rechazadas
    - **Validates: Requirements 7.6, 9.2, 9.3, 11.1, 11.2, 11.3**

  - [ ]* 7.6 Write property test: Detección de conflictos de horario (Property 8)
    - **Property 8: Para cualquier odontólogo con cita existente (PENDIENTE/REAGENDADO), el sistema detecta conflicto al intentar crear otra cita en el mismo horario**
    - Generar citas existentes y nuevas citas aleatorias con fast-check
    - Verificar detección correcta de conflictos
    - **Validates: Requirements 7.5, 9.4**

- [x] 8. Implementar módulo de Atención Médica
  - [x] 8.1 Crear modelos y servicio de Atención
    - Crear `src/app/features/atencion/models/nota-clinica.model.ts` con interfaces `NotaClinica`, `NotaClinicaRequest`
    - Crear `src/app/features/atencion/services/atencion.service.ts` con métodos: `registrarNotaClinica()`, `finalizarAtencion()`
    - _Requirements: 12.1, 12.2_

  - [x] 8.2 Crear AtencionFormComponent
    - Crear `src/app/features/atencion/atencion-form/atencion-form.component.ts`
    - Mostrar información del paciente y motivo de consulta de la cita
    - Formulario con campos: diagnóstico, tratamiento realizado, observaciones
    - Botón "Finalizar atención" que envía nota clínica y cambia estado a "atendido"
    - Indicador de carga durante envío, deshabilitar botón
    - Mantener datos en formulario si hay error del API
    - Solo accesible para citas con estado "pendiente" o "reagendado"
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 8.3 Crear rutas del módulo Atención
    - Crear `src/app/features/atencion/atencion.routes.ts` con ruta: `:citaId`
    - _Requirements: 12.1_

  - [ ]* 8.4 Write unit tests for AtencionFormComponent
    - Test envío exitoso de nota clínica y cambio de estado
    - Test indicador de carga y deshabilitación de botón
    - Test manejo de error manteniendo datos en formulario
    - _Requirements: 12.2, 12.4, 12.5_

- [x] 9. Implementar módulo de Usuarios
  - [x] 9.1 Crear modelos y servicio de Usuarios
    - Crear `src/app/features/usuarios/models/usuario.model.ts` con interfaces `Usuario`, `UsuarioRequest`
    - Crear `src/app/features/usuarios/services/usuario.service.ts` con métodos: `listar()`, `registrar()`, `actualizar()`, `eliminar()`, `listarOdontologos()`
    - _Requirements: 13.1, 13.2, 13.5, 13.6_

  - [x] 9.2 Crear UsuarioListComponent
    - Crear `src/app/features/usuarios/usuario-list/usuario-list.component.ts`
    - Tabla con columnas: nombre completo, email, rol, estado
    - Botones de editar y eliminar por fila
    - Diálogo de confirmación para eliminación
    - _Requirements: 13.1, 13.5, 13.6_

  - [x] 9.3 Crear UsuarioFormComponent (registro y edición)
    - Crear `src/app/features/usuarios/usuario-form/usuario-form.component.ts`
    - Formulario reactivo con campos: nombre completo, email, contraseña, rol (selector)
    - Selector de roles: Administrador, Recepcionista, Odontólogo
    - Validación de campos obligatorios
    - Manejar error de correo duplicado
    - Modo edición: cargar datos actuales del usuario
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.7_

  - [x] 9.4 Crear rutas del módulo Usuarios
    - Crear `src/app/features/usuarios/usuarios.routes.ts` con rutas: lista, nuevo, editar/:id
    - _Requirements: 13.1, 13.2, 13.5_

  - [ ]* 9.5 Write unit tests for UsuarioFormComponent
    - Test validación de campos obligatorios
    - Test manejo de error de correo duplicado
    - Test selector de roles
    - _Requirements: 13.3, 13.4, 13.7_

- [x] 10. Checkpoint - Verificar módulos de Atención y Usuarios
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implementar módulo de Reportes
  - [x] 11.1 Crear modelos y servicio de Reportes
    - Crear `src/app/features/reportes/models/reporte.model.ts` con interfaces `Reporte`, `ReporteFiltros`
    - Crear `src/app/features/reportes/services/reporte.service.ts` con métodos: `generar()`, `obtenerPorCita()`, `listar()`, `descargarPdf()`
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 11.2 Crear ReporteListComponent
    - Crear `src/app/features/reportes/reporte-list/reporte-list.component.ts`
    - Lista paginada de reportes con filtros por fecha y paciente
    - Botón para ver detalle de cada reporte
    - _Requirements: 14.4_

  - [x] 11.3 Crear ReporteViewComponent
    - Crear `src/app/features/reportes/reporte-view/reporte-view.component.ts`
    - Mostrar reporte en formato legible: fecha, paciente, odontólogo, diagnóstico, tratamiento, observaciones
    - Botón para descargar en formato PDF
    - Manejar error de generación con opción de reintentar
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

  - [x] 11.4 Crear rutas del módulo Reportes
    - Crear `src/app/features/reportes/reportes.routes.ts` con rutas: lista, :id
    - _Requirements: 14.2, 14.4_

  - [ ]* 11.5 Write unit tests for ReporteService
    - Test generación automática de reporte al finalizar atención
    - Test descarga de PDF (verificar tipo Blob)
    - Test filtrado por fecha y paciente
    - _Requirements: 14.1, 14.3, 14.4_

- [x] 12. Implementar Layout de Intranet y Navegación
  - [x] 12.1 Crear IntranetLayoutComponent con sidebar
    - Crear `src/app/layouts/intranet-layout/intranet-layout.component.ts`
    - Barra lateral con módulos de navegación filtrados según rol del usuario
    - Barra superior con nombre del usuario autenticado y botón de cerrar sesión
    - Resaltar visualmente el módulo activo en la barra lateral
    - Diseño responsivo para escritorio y tablets con TailwindCSS
    - Navegación SPA sin recarga de página
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 12.2 Configurar rutas principales en app.routes.ts
    - Actualizar `src/app/app.routes.ts` con estructura completa de rutas
    - Rutas públicas: home, servicios, nosotros, login, acceso-denegado
    - Rutas protegidas bajo `/intranet` con authGuard y roleGuard
    - Lazy loading para cada feature module
    - Configurar `app.config.ts` con `provideHttpClient(withInterceptors([authInterceptor]))` y `provideRouter(routes)`
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 15.5_

  - [ ]* 12.3 Write unit tests for IntranetLayoutComponent
    - Test que la sidebar muestra solo módulos permitidos por rol
    - Test que el módulo activo se resalta visualmente
    - Test que el botón de logout ejecuta cierre de sesión
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 13. Final checkpoint - Verificar integración completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- El proyecto ya tiene configurado Angular 21+, TailwindCSS 4 y Vitest como test runner
- Se utiliza fast-check para property-based testing
- Todos los componentes son standalone (sin NgModules)
- Los servicios usan signals para estado reactivo

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "1.6"] },
    { "id": 3, "tasks": ["1.7", "1.8", "1.9", "3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4", "4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 5, "tasks": ["5.1", "7.1", "8.1", "9.1", "11.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "7.2", "7.3", "7.4", "8.2", "8.3", "9.2", "9.3", "9.4", "11.2", "11.3", "11.4"] },
    { "id": 7, "tasks": ["5.5", "5.6", "7.5", "7.6", "8.4", "9.5", "11.5"] },
    { "id": 8, "tasks": ["12.1", "12.2"] },
    { "id": 9, "tasks": ["12.3"] }
  ]
}
```
