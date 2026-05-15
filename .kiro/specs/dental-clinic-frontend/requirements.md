# Documento de Requisitos — Frontend Clínica DentalPro

## Introducción

Este documento define los requisitos funcionales del frontend para el sistema de gestión interna de la Clínica DentalPro. El sistema es una aplicación Angular de intranet privada que permite a los empleados de la clínica (administradores, recepcionistas y odontólogos) gestionar pacientes, citas, atención médica, usuarios y reportes. El frontend se comunica con un backend Spring Boot vía API REST.

## Glosario

- **Sistema_Frontend**: La aplicación Angular que constituye la interfaz de usuario del sistema DentalPro
- **Módulo_Pacientes**: Componente del sistema encargado de la gestión de información de pacientes
- **Módulo_Citas**: Componente del sistema encargado de la programación y seguimiento de citas
- **Módulo_Atención**: Componente del sistema encargado del registro de atención médica durante consultas
- **Módulo_Usuarios**: Componente del sistema encargado de la administración de cuentas de usuario
- **Módulo_Seguridad**: Componente del sistema encargado de la autenticación y control de acceso
- **Módulo_Reportes**: Componente del sistema encargado de la generación de reportes de atención
- **Guard_Autenticación**: Servicio Angular que protege rutas verificando la sesión activa del usuario
- **Guard_Roles**: Servicio Angular que restringe el acceso a rutas según el rol del usuario autenticado
- **Paciente**: Persona que recibe atención dental en la clínica, con datos personales registrados
- **Cita**: Registro de una consulta programada entre un paciente y un odontólogo en una fecha y hora específicas
- **Estado_Cita**: Valor que indica la situación actual de una cita (pendiente, atendido, cancelado, reagendado)
- **Nota_Clínica**: Observación médica registrada por el odontólogo durante la atención de un paciente
- **Reporte_Atención**: Documento generado al finalizar una cita que resume la atención brindada
- **Administrador**: Rol con acceso total a todos los módulos del sistema
- **Recepcionista**: Rol con acceso a gestión de pacientes y citas
- **Odontólogo**: Rol con acceso a atención médica, notas clínicas y reportes
- **Token_JWT**: Token de autenticación emitido por el backend que el frontend almacena para mantener la sesión
- **API_REST**: Interfaz de comunicación HTTP entre el frontend y el backend Spring Boot

## Requisitos

### Requisito 1: Autenticación de Usuarios (RF20)

**User Story:** Como empleado de la clínica, quiero iniciar sesión con mis credenciales, para acceder a las funcionalidades del sistema según mi rol asignado.

#### Criterios de Aceptación

1. WHEN el usuario envía credenciales válidas (correo y contraseña), THE Módulo_Seguridad SHALL enviar las credenciales al endpoint de autenticación de la API_REST y almacenar el Token_JWT recibido en el almacenamiento local del navegador.
2. WHEN el usuario envía credenciales inválidas, THE Módulo_Seguridad SHALL mostrar un mensaje de error indicando que las credenciales son incorrectas sin revelar cuál campo es erróneo.
3. WHEN el Token_JWT es almacenado exitosamente, THE Módulo_Seguridad SHALL redirigir al usuario al panel principal de la intranet correspondiente a su rol.
4. WHEN el usuario hace clic en el botón de cerrar sesión, THE Módulo_Seguridad SHALL eliminar el Token_JWT del almacenamiento local y redirigir al usuario a la página de inicio de sesión.
5. WHILE el formulario de inicio de sesión está visible, THE Módulo_Seguridad SHALL deshabilitar el botón de envío hasta que ambos campos (correo y contraseña) contengan valores.
6. WHILE se procesa la solicitud de autenticación, THE Módulo_Seguridad SHALL mostrar un indicador de carga y deshabilitar el formulario para evitar envíos duplicados.

---

### Requisito 2: Protección de Rutas y Control de Acceso

**User Story:** Como administrador del sistema, quiero que las rutas estén protegidas según roles, para que cada empleado acceda solo a las funcionalidades que le corresponden.

#### Criterios de Aceptación

1. WHEN un usuario no autenticado intenta acceder a una ruta protegida, THE Guard_Autenticación SHALL redirigir al usuario a la página de inicio de sesión.
2. WHEN un usuario autenticado intenta acceder a una ruta para la cual su rol no tiene permiso, THE Guard_Roles SHALL redirigir al usuario a una página de acceso denegado.
3. THE Guard_Autenticación SHALL verificar la existencia y validez del Token_JWT antes de permitir el acceso a cualquier ruta protegida.
4. WHEN el Token_JWT ha expirado, THE Guard_Autenticación SHALL eliminar el token almacenado y redirigir al usuario a la página de inicio de sesión con un mensaje indicando que la sesión expiró.
5. THE Guard_Roles SHALL permitir al Administrador acceder a todos los módulos del sistema.
6. THE Guard_Roles SHALL permitir al Recepcionista acceder únicamente al Módulo_Pacientes y al Módulo_Citas.
7. THE Guard_Roles SHALL permitir al Odontólogo acceder únicamente al Módulo_Atención y al Módulo_Reportes.

---

### Requisito 3: Registro de Pacientes (RF01)

**User Story:** Como recepcionista, quiero registrar nuevos pacientes en el sistema, para mantener un historial actualizado de las personas atendidas en la clínica.

#### Criterios de Aceptación

1. WHEN el usuario completa el formulario de registro de paciente con datos válidos y hace clic en guardar, THE Módulo_Pacientes SHALL enviar los datos al endpoint correspondiente de la API_REST y mostrar un mensaje de confirmación de registro exitoso.
2. WHILE el formulario de registro está visible, THE Módulo_Pacientes SHALL validar en tiempo real los campos obligatorios: nombre completo, DNI, fecha de nacimiento, teléfono y correo electrónico.
3. IF el usuario intenta enviar el formulario con campos obligatorios vacíos o con formato inválido, THEN THE Módulo_Pacientes SHALL resaltar los campos con error y mostrar mensajes de validación específicos para cada campo.
4. IF la API_REST retorna un error indicando que el DNI ya está registrado, THEN THE Módulo_Pacientes SHALL mostrar un mensaje indicando que el paciente ya existe en el sistema.
5. WHILE se envían los datos al servidor, THE Módulo_Pacientes SHALL mostrar un indicador de carga y deshabilitar el botón de envío.

---

### Requisito 4: Listado y Búsqueda de Pacientes (RF02, RF05)

**User Story:** Como recepcionista, quiero ver la lista de pacientes registrados y buscar por nombre o DNI, para localizar rápidamente la información de un paciente.

#### Criterios de Aceptación

1. WHEN el usuario accede al módulo de pacientes, THE Módulo_Pacientes SHALL obtener y mostrar la lista paginada de pacientes desde la API_REST con las columnas: nombre completo, DNI, teléfono y correo electrónico.
2. WHEN el usuario escribe en el campo de búsqueda, THE Módulo_Pacientes SHALL filtrar la lista de pacientes mostrando solo aquellos cuyo nombre o DNI coincidan parcialmente con el texto ingresado.
3. WHEN la API_REST retorna una lista vacía, THE Módulo_Pacientes SHALL mostrar un mensaje indicando que no se encontraron pacientes.
4. WHILE se cargan los datos desde la API_REST, THE Módulo_Pacientes SHALL mostrar un indicador de carga en la tabla.
5. IF ocurre un error de conexión con la API_REST, THEN THE Módulo_Pacientes SHALL mostrar un mensaje de error y un botón para reintentar la carga.

---

### Requisito 5: Edición de Pacientes (RF03)

**User Story:** Como recepcionista, quiero editar la información de un paciente existente, para mantener sus datos actualizados.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en el botón de editar de un paciente, THE Módulo_Pacientes SHALL cargar los datos actuales del paciente en el formulario de edición.
2. WHEN el usuario modifica los datos y hace clic en guardar, THE Módulo_Pacientes SHALL enviar los datos actualizados al endpoint correspondiente de la API_REST y mostrar un mensaje de confirmación.
3. WHILE el formulario de edición está visible, THE Módulo_Pacientes SHALL aplicar las mismas validaciones que el formulario de registro.
4. IF la API_REST retorna un error durante la actualización, THEN THE Módulo_Pacientes SHALL mostrar un mensaje de error descriptivo y mantener los datos editados en el formulario.

---

### Requisito 6: Baja de Pacientes (RF04)

**User Story:** Como recepcionista, quiero dar de baja a un paciente del sistema, para mantener la base de datos organizada.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en el botón de eliminar de un paciente, THE Módulo_Pacientes SHALL mostrar un diálogo de confirmación solicitando verificar la acción.
2. WHEN el usuario confirma la eliminación en el diálogo, THE Módulo_Pacientes SHALL enviar la solicitud de baja al endpoint correspondiente de la API_REST y actualizar la lista de pacientes.
3. WHEN el usuario cancela la eliminación en el diálogo, THE Módulo_Pacientes SHALL cerrar el diálogo sin realizar cambios.
4. IF la API_REST retorna un error durante la baja, THEN THE Módulo_Pacientes SHALL mostrar un mensaje de error indicando que la operación no se completó.

---

### Requisito 7: Registro de Citas (RF06)

**User Story:** Como recepcionista, quiero registrar nuevas citas para los pacientes, para organizar la agenda de atención de la clínica.

#### Criterios de Aceptación

1. WHEN el usuario completa el formulario de nueva cita con datos válidos y hace clic en guardar, THE Módulo_Citas SHALL enviar los datos al endpoint correspondiente de la API_REST y mostrar un mensaje de confirmación.
2. WHILE el formulario de cita está visible, THE Módulo_Citas SHALL validar los campos obligatorios: paciente, odontólogo, fecha, hora y motivo de consulta.
3. THE Módulo_Citas SHALL mostrar un selector de pacientes que permita buscar y seleccionar un paciente registrado.
4. THE Módulo_Citas SHALL mostrar un selector de odontólogos disponibles obtenidos desde la API_REST.
5. IF el usuario selecciona una fecha u hora en la que el odontólogo ya tiene una cita programada, THEN THE Módulo_Citas SHALL mostrar un mensaje indicando el conflicto de horario.
6. THE Módulo_Citas SHALL asignar automáticamente el estado "pendiente" a toda cita recién creada.

---

### Requisito 8: Visualización de Citas por Fecha (RF07, RF12)

**User Story:** Como recepcionista, quiero visualizar las citas programadas filtradas por fecha, para gestionar la agenda diaria de la clínica.

#### Criterios de Aceptación

1. WHEN el usuario accede al módulo de citas, THE Módulo_Citas SHALL mostrar las citas del día actual obtenidas desde la API_REST.
2. WHEN el usuario selecciona una fecha en el calendario, THE Módulo_Citas SHALL obtener y mostrar las citas programadas para esa fecha.
3. THE Módulo_Citas SHALL mostrar cada cita con la información: hora, nombre del paciente, nombre del odontólogo, motivo y estado actual.
4. THE Módulo_Citas SHALL diferenciar visualmente las citas según su Estado_Cita mediante colores o etiquetas distintivas (pendiente, atendido, cancelado, reagendado).
5. WHILE se cargan las citas desde la API_REST, THE Módulo_Citas SHALL mostrar un indicador de carga.

---

### Requisito 9: Edición y Reagendamiento de Citas (RF08, RF10)

**User Story:** Como recepcionista, quiero editar o reagendar una cita existente, para ajustar la programación según las necesidades del paciente.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en editar una cita con estado "pendiente", THE Módulo_Citas SHALL cargar los datos actuales de la cita en el formulario de edición.
2. WHEN el usuario modifica la fecha u hora de una cita y guarda los cambios, THE Módulo_Citas SHALL actualizar el estado de la cita a "reagendado" y enviar los cambios a la API_REST.
3. IF el usuario intenta editar una cita con estado "atendido" o "cancelado", THEN THE Módulo_Citas SHALL deshabilitar la opción de edición para esa cita.
4. WHILE el formulario de edición está visible, THE Módulo_Citas SHALL aplicar las mismas validaciones de conflicto de horario que el formulario de registro.

---

### Requisito 10: Cancelación de Citas (RF09)

**User Story:** Como recepcionista, quiero cancelar una cita programada, para liberar el horario cuando un paciente no puede asistir.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en cancelar una cita con estado "pendiente" o "reagendado", THE Módulo_Citas SHALL mostrar un diálogo de confirmación.
2. WHEN el usuario confirma la cancelación, THE Módulo_Citas SHALL enviar la solicitud de cambio de estado a "cancelado" a la API_REST y actualizar la vista.
3. WHEN el usuario cancela la acción en el diálogo, THE Módulo_Citas SHALL cerrar el diálogo sin realizar cambios.
4. IF la API_REST retorna un error durante la cancelación, THEN THE Módulo_Citas SHALL mostrar un mensaje de error.

---

### Requisito 11: Control de Estados de Citas (RF11)

**User Story:** Como recepcionista, quiero visualizar y gestionar los estados de las citas, para tener control sobre el flujo de atención.

#### Criterios de Aceptación

1. THE Módulo_Citas SHALL representar los estados válidos de una cita como: "pendiente", "atendido", "cancelado" y "reagendado".
2. THE Módulo_Citas SHALL permitir transiciones de estado únicamente en las siguientes direcciones: de "pendiente" a "atendido", de "pendiente" a "cancelado", de "pendiente" a "reagendado", y de "reagendado" a "atendido" o "cancelado".
3. IF un usuario intenta realizar una transición de estado no permitida, THEN THE Módulo_Citas SHALL deshabilitar las acciones correspondientes en la interfaz.

---

### Requisito 12: Registro de Atención Médica y Notas Clínicas (RF13, RF14)

**User Story:** Como odontólogo, quiero registrar observaciones y notas clínicas durante la atención de un paciente, para documentar el tratamiento realizado.

#### Criterios de Aceptación

1. WHEN el odontólogo accede a una cita con estado "pendiente" o "reagendado", THE Módulo_Atención SHALL mostrar un formulario para registrar la Nota_Clínica con campos: diagnóstico, tratamiento realizado y observaciones.
2. WHEN el odontólogo completa la nota clínica y hace clic en finalizar atención, THE Módulo_Atención SHALL enviar la nota clínica a la API_REST y cambiar el estado de la cita a "atendido".
3. WHILE el formulario de atención está visible, THE Módulo_Atención SHALL mostrar la información del paciente y el motivo de consulta de la cita.
4. IF la API_REST retorna un error al guardar la nota clínica, THEN THE Módulo_Atención SHALL mostrar un mensaje de error y mantener los datos ingresados en el formulario.
5. WHILE se envía la nota clínica al servidor, THE Módulo_Atención SHALL mostrar un indicador de carga y deshabilitar el botón de envío.

---

### Requisito 13: Gestión de Usuarios (RF15-RF19)

**User Story:** Como administrador, quiero gestionar las cuentas de usuario del sistema, para controlar quién tiene acceso y con qué permisos.

#### Criterios de Aceptación

1. WHEN el administrador accede al módulo de usuarios, THE Módulo_Usuarios SHALL obtener y mostrar la lista de usuarios registrados con las columnas: nombre completo, correo electrónico, rol y estado.
2. WHEN el administrador completa el formulario de nuevo usuario con datos válidos, THE Módulo_Usuarios SHALL enviar los datos al endpoint de registro de la API_REST y mostrar un mensaje de confirmación.
3. WHILE el formulario de usuario está visible, THE Módulo_Usuarios SHALL validar los campos obligatorios: nombre completo, correo electrónico, contraseña y rol asignado.
4. THE Módulo_Usuarios SHALL mostrar un selector de roles con las opciones: Administrador, Recepcionista y Odontólogo.
5. WHEN el administrador hace clic en editar un usuario, THE Módulo_Usuarios SHALL cargar los datos actuales del usuario en el formulario de edición.
6. WHEN el administrador hace clic en eliminar un usuario, THE Módulo_Usuarios SHALL mostrar un diálogo de confirmación antes de enviar la solicitud de eliminación a la API_REST.
7. IF la API_REST retorna un error indicando que el correo ya está registrado, THEN THE Módulo_Usuarios SHALL mostrar un mensaje indicando que el correo ya existe en el sistema.

---

### Requisito 14: Generación de Reportes de Atención (RF21)

**User Story:** Como odontólogo, quiero generar un reporte al finalizar cada cita, para documentar formalmente la atención brindada al paciente.

#### Criterios de Aceptación

1. WHEN el odontólogo finaliza la atención de una cita (estado cambia a "atendido"), THE Módulo_Reportes SHALL generar automáticamente un Reporte_Atención con los datos: fecha, paciente, odontólogo, diagnóstico, tratamiento y observaciones.
2. WHEN el odontólogo solicita ver el reporte de una cita atendida, THE Módulo_Reportes SHALL obtener el reporte desde la API_REST y mostrarlo en formato legible.
3. THE Módulo_Reportes SHALL permitir al odontólogo descargar el Reporte_Atención en formato PDF.
4. WHEN el usuario accede al historial de reportes, THE Módulo_Reportes SHALL mostrar una lista paginada de reportes filtrable por fecha y paciente.
5. IF la API_REST retorna un error al generar el reporte, THEN THE Módulo_Reportes SHALL mostrar un mensaje de error y permitir reintentar la generación.

---

### Requisito 15: Navegación y Layout de la Intranet

**User Story:** Como empleado de la clínica, quiero una interfaz de navegación clara y organizada, para acceder fácilmente a las funcionalidades del sistema según mi rol.

#### Criterios de Aceptación

1. WHEN el usuario inicia sesión exitosamente, THE Sistema_Frontend SHALL mostrar un layout de intranet con barra lateral de navegación que contenga los módulos accesibles según el rol del usuario.
2. THE Sistema_Frontend SHALL mostrar en la barra superior el nombre del usuario autenticado y un botón de cerrar sesión.
3. WHILE el usuario navega entre módulos, THE Sistema_Frontend SHALL resaltar visualmente el módulo activo en la barra lateral.
4. THE Sistema_Frontend SHALL adaptar la interfaz a diferentes tamaños de pantalla (diseño responsivo) para su uso en computadoras de escritorio y tablets.
5. WHEN el usuario hace clic en un módulo de la barra lateral, THE Sistema_Frontend SHALL cargar el contenido del módulo seleccionado sin recargar la página completa (navegación SPA).

---

### Requisito 16: Interceptor HTTP y Manejo Global de Errores

**User Story:** Como desarrollador, quiero que las peticiones HTTP incluyan automáticamente el token de autenticación y que los errores se manejen de forma centralizada, para mantener la seguridad y consistencia del sistema.

#### Criterios de Aceptación

1. THE Sistema_Frontend SHALL adjuntar automáticamente el Token_JWT en el encabezado Authorization de cada petición HTTP dirigida a la API_REST.
2. WHEN la API_REST retorna un código de estado 401 (no autorizado), THE Sistema_Frontend SHALL eliminar el Token_JWT almacenado y redirigir al usuario a la página de inicio de sesión.
3. WHEN la API_REST retorna un código de estado 403 (prohibido), THE Sistema_Frontend SHALL mostrar un mensaje indicando que el usuario no tiene permisos para realizar la acción.
4. WHEN la API_REST retorna un código de estado 500 (error interno), THE Sistema_Frontend SHALL mostrar un mensaje genérico de error del servidor.
5. IF la petición HTTP no recibe respuesta dentro de 30 segundos, THEN THE Sistema_Frontend SHALL cancelar la petición y mostrar un mensaje de tiempo de espera agotado.
