# Requirements Document

## Introduction

Historial Clínico del Paciente — Actualmente, desde la ficha de un paciente solo se puede ver la lista y el formulario de edición. No existe una vista de detalle que muestre las citas anteriores ni las notas clínicas asociadas. Esta feature agrega una vista de detalle del paciente con su historial clínico completo (citas pasadas + notas clínicas), accesible desde el módulo de pacientes.

## Glossary

- **Sistema_Historial**: Módulo de historial clínico del paciente dentro de la intranet DentalPro
- **Vista_Detalle**: Componente de vista de detalle del paciente que muestra información personal y su historial clínico
- **Historial_Clinico**: Conjunto de citas anteriores y notas clínicas asociadas a un paciente específico
- **Cita**: Registro de una cita odontológica con fecha, hora, odontólogo, motivo y estado
- **Nota_Clinica**: Registro de atención médica con diagnóstico, tratamiento y observaciones vinculado a una cita
- **Lista_Pacientes**: Componente existente que muestra la tabla paginada de pacientes

## Requirements

### Requirement 1: Navegación al detalle del paciente

**User Story:** Como recepcionista o administrador, quiero acceder al historial clínico de un paciente desde la lista de pacientes, para poder consultar su información completa sin salir del módulo.

#### Acceptance Criteria

1. WHEN el usuario hace clic en el nombre de un paciente o en un botón "Ver historial" en la Lista_Pacientes, THE Sistema_Historial SHALL navegar a la Vista_Detalle del paciente seleccionado en la ruta `/intranet/pacientes/:id`
2. THE Sistema_Historial SHALL mostrar un botón o enlace "Ver historial" en cada fila de la Lista_Pacientes
3. WHEN el usuario navega directamente a `/intranet/pacientes/:id` con un ID válido, THE Vista_Detalle SHALL cargar los datos del paciente correspondiente
4. IF el usuario navega a `/intranet/pacientes/:id` con un ID inexistente, THEN THE Sistema_Historial SHALL mostrar un mensaje "Paciente no encontrado" y un botón para volver a la lista

### Requirement 2: Información personal del paciente en la vista de detalle

**User Story:** Como recepcionista, quiero ver los datos personales del paciente en la cabecera de su historial, para identificar rápidamente de quién es el historial que estoy consultando.

#### Acceptance Criteria

1. THE Vista_Detalle SHALL mostrar el nombre completo del paciente como título principal
2. THE Vista_Detalle SHALL mostrar los datos del paciente: DNI, fecha de nacimiento, teléfono y email en una sección de información personal
3. THE Vista_Detalle SHALL incluir un botón "Volver a la lista" que navegue a `/intranet/pacientes`
4. THE Vista_Detalle SHALL incluir un botón "Editar paciente" que navegue a `/intranet/pacientes/editar/:id`

### Requirement 3: Listado de citas del paciente

**User Story:** Como odontólogo o recepcionista, quiero ver todas las citas de un paciente ordenadas cronológicamente, para conocer su historial de visitas a la clínica.

#### Acceptance Criteria

1. THE Vista_Detalle SHALL mostrar una sección "Historial de Citas" con todas las citas asociadas al paciente
2. THE Sistema_Historial SHALL filtrar las citas utilizando el campo `pacienteId` de cada Cita
3. THE Vista_Detalle SHALL mostrar cada cita con: fecha, hora, odontólogo, motivo y estado
4. THE Vista_Detalle SHALL ordenar las citas de la más reciente a la más antigua por fecha y hora
5. THE Vista_Detalle SHALL diferenciar visualmente el estado de cada cita mediante etiquetas con colores (PENDIENTE: amarillo, ATENDIDO: verde, CANCELADO: rojo, REAGENDADO: azul)
6. IF el paciente no tiene citas registradas, THEN THE Vista_Detalle SHALL mostrar un mensaje "Este paciente no tiene citas registradas"

### Requirement 4: Listado de notas clínicas del paciente

**User Story:** Como odontólogo, quiero ver las notas clínicas de un paciente, para revisar diagnósticos y tratamientos anteriores antes de una nueva atención.

#### Acceptance Criteria

1. THE Vista_Detalle SHALL mostrar una sección "Notas Clínicas" con todas las notas clínicas asociadas al paciente
2. THE Sistema_Historial SHALL filtrar las notas clínicas vinculando cada Nota_Clinica con las citas del paciente a través del campo `citaId`
3. THE Vista_Detalle SHALL mostrar cada nota clínica con: fecha, odontólogo, diagnóstico, tratamiento y observaciones
4. THE Vista_Detalle SHALL ordenar las notas clínicas de la más reciente a la más antigua por fecha
5. IF el paciente no tiene notas clínicas registradas, THEN THE Vista_Detalle SHALL mostrar un mensaje "Este paciente no tiene notas clínicas registradas"

### Requirement 5: Indicadores de resumen del historial

**User Story:** Como recepcionista o administrador, quiero ver un resumen rápido del historial del paciente, para tener una visión general sin revisar cada registro individual.

#### Acceptance Criteria

1. THE Vista_Detalle SHALL mostrar el número total de citas del paciente
2. THE Vista_Detalle SHALL mostrar el número total de notas clínicas del paciente
3. THE Vista_Detalle SHALL mostrar la fecha de la última cita del paciente
4. IF el paciente no tiene citas registradas, THEN THE Vista_Detalle SHALL mostrar "Sin citas" en el indicador de última cita

### Requirement 6: Diseño visual y experiencia de usuario

**User Story:** Como usuario de la intranet, quiero que la vista de detalle del paciente sea consistente con el diseño del resto de la aplicación, para tener una experiencia visual coherente.

#### Acceptance Criteria

1. THE Vista_Detalle SHALL utilizar el tema oscuro de la aplicación (fondo principal bg-gray-950, secciones bg-gray-900, tarjetas bg-gray-800)
2. THE Vista_Detalle SHALL ser responsiva y funcionar correctamente en pantallas de escritorio y tablets
3. THE Vista_Detalle SHALL mostrar un indicador de carga mientras se obtienen los datos del paciente
4. THE Vista_Detalle SHALL organizar la información en secciones claramente separadas: datos personales, resumen, historial de citas y notas clínicas
