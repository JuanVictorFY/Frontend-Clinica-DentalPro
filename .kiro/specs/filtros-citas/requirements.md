# Requirements Document

## Introduction

La vista de Citas en la intranet de DentalPro actualmente solo permite filtrar citas por fecha. Esta funcionalidad es insuficiente para el flujo de trabajo diario donde recepcionistas y odontólogos necesitan localizar citas rápidamente por odontólogo asignado o por estado de la cita. Este documento especifica los requisitos para agregar filtros avanzados por odontólogo y por estado a la lista de citas existente.

## Glossary

- **Sistema_Filtros_Citas**: Módulo de filtrado de la vista de citas que permite reducir el listado según criterios combinados de fecha, odontólogo y estado.
- **Filtro_Odontologo**: Control de selección (dropdown) que permite elegir un odontólogo específico o ver todos.
- **Filtro_Estado**: Control de selección que permite elegir un estado de cita específico o ver todos.
- **Cita**: Registro de una cita programada con paciente, odontólogo, fecha, hora, motivo y estado.
- **EstadoCita**: Enumeración con los valores PENDIENTE, ATENDIDO, CANCELADO y REAGENDADO.
- **Odontologo**: Profesional dental registrado en el sistema con id y nombre.

## Requirements

### Requirement 1: Filtro por Odontólogo

**User Story:** Como recepcionista, quiero filtrar las citas por odontólogo, para poder ver rápidamente la agenda de un profesional específico.

#### Acceptance Criteria

1. THE Sistema_Filtros_Citas SHALL mostrar un dropdown de selección de odontólogo con la opción "Todos" seleccionada por defecto.
2. THE Sistema_Filtros_Citas SHALL poblar el dropdown con la lista completa de odontólogos registrados en el sistema.
3. WHEN el usuario selecciona un odontólogo en el Filtro_Odontologo, THE Sistema_Filtros_Citas SHALL mostrar únicamente las citas asignadas a ese odontólogo.
4. WHEN el usuario selecciona la opción "Todos" en el Filtro_Odontologo, THE Sistema_Filtros_Citas SHALL mostrar las citas de todos los odontólogos.
5. WHEN el usuario cambia el Filtro_Odontologo, THE Sistema_Filtros_Citas SHALL aplicar el filtro de forma inmediata sin requerir acción adicional del usuario.

### Requirement 2: Filtro por Estado

**User Story:** Como recepcionista, quiero filtrar las citas por estado, para poder identificar rápidamente las citas pendientes, atendidas, canceladas o reagendadas.

#### Acceptance Criteria

1. THE Sistema_Filtros_Citas SHALL mostrar un dropdown de selección de estado con la opción "Todos" seleccionada por defecto.
2. THE Sistema_Filtros_Citas SHALL poblar el dropdown con todos los valores del enum EstadoCita: PENDIENTE, ATENDIDO, CANCELADO y REAGENDADO.
3. WHEN el usuario selecciona un estado en el Filtro_Estado, THE Sistema_Filtros_Citas SHALL mostrar únicamente las citas que tengan ese estado.
4. WHEN el usuario selecciona la opción "Todos" en el Filtro_Estado, THE Sistema_Filtros_Citas SHALL mostrar las citas en cualquier estado.
5. WHEN el usuario cambia el Filtro_Estado, THE Sistema_Filtros_Citas SHALL aplicar el filtro de forma inmediata sin requerir acción adicional del usuario.

### Requirement 3: Combinación de Filtros

**User Story:** Como recepcionista, quiero que los filtros de fecha, odontólogo y estado funcionen en conjunto, para poder hacer búsquedas precisas combinando múltiples criterios.

#### Acceptance Criteria

1. THE Sistema_Filtros_Citas SHALL aplicar todos los filtros activos (fecha, odontólogo y estado) de forma conjunta usando lógica AND.
2. WHEN el usuario tiene filtros activos de fecha, odontólogo y estado simultáneamente, THE Sistema_Filtros_Citas SHALL mostrar solo las citas que cumplan con los tres criterios a la vez.
3. WHEN ninguna cita cumple con la combinación de filtros activos, THE Sistema_Filtros_Citas SHALL mostrar un mensaje indicando que no hay citas que coincidan con los filtros seleccionados.
4. WHEN el usuario cambia cualquiera de los filtros, THE Sistema_Filtros_Citas SHALL recalcular el listado aplicando todos los filtros activos de forma inmediata.

### Requirement 4: Disposición Visual de los Filtros

**User Story:** Como usuario de la intranet, quiero que los filtros estén organizados de forma clara y accesible, para poder utilizarlos de manera intuitiva.

#### Acceptance Criteria

1. THE Sistema_Filtros_Citas SHALL presentar los tres filtros (fecha, odontólogo y estado) en una misma fila horizontal en pantallas de escritorio.
2. WHILE la pantalla tiene un ancho menor al breakpoint sm, THE Sistema_Filtros_Citas SHALL apilar los filtros verticalmente.
3. THE Sistema_Filtros_Citas SHALL aplicar el estilo visual consistente con el tema oscuro del sistema (fondo bg-gray-800, borde border-gray-600, texto text-white).
4. THE Sistema_Filtros_Citas SHALL mostrar una etiqueta descriptiva junto a cada filtro para identificar su propósito.

### Requirement 5: Persistencia de Filtros en Sesión de Vista

**User Story:** Como recepcionista, quiero que los filtros seleccionados se mantengan mientras navego dentro de la vista de citas, para no tener que reconfigurarlos al volver de una acción.

#### Acceptance Criteria

1. WHEN el usuario cambia el estado de una cita (atender o cancelar) desde la tabla, THE Sistema_Filtros_Citas SHALL mantener los valores actuales de todos los filtros y refrescar el listado con los filtros aplicados.
2. WHEN el usuario regresa a la lista de citas después de crear o editar una cita, THE Sistema_Filtros_Citas SHALL restablecer los filtros de odontólogo y estado a "Todos" manteniendo la fecha actual.
