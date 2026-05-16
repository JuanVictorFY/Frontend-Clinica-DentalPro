# Bugfix Requirements Document

## Introduction

Al registrar un nuevo paciente en el sistema, no se valida si el DNI ingresado ya existe en la lista de pacientes. Esto permite la creación de registros duplicados con el mismo DNI, lo cual viola la unicidad del documento de identidad y puede generar inconsistencias en los datos clínicos del sistema. El mismo problema aplica al editar un paciente: la validación de unicidad debe excluir al paciente que se está editando.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN un usuario registra un nuevo paciente con un DNI que ya existe en el sistema THEN the system acepta el registro y crea un paciente duplicado sin mostrar ningún error

1.2 WHEN un usuario edita un paciente existente y cambia el DNI a uno que ya pertenece a otro paciente THEN the system acepta la actualización sin validar la unicidad del DNI contra otros pacientes

### Expected Behavior (Correct)

2.1 WHEN un usuario registra un nuevo paciente con un DNI que ya existe en el sistema THEN the system SHALL mostrar un mensaje de error indicando que el DNI ya está registrado y SHALL prevenir el registro del paciente

2.2 WHEN un usuario edita un paciente existente y cambia el DNI a uno que ya pertenece a otro paciente THEN the system SHALL mostrar un mensaje de error indicando que el DNI ya está registrado y SHALL prevenir la actualización

2.3 WHEN un usuario edita un paciente existente y mantiene su mismo DNI sin cambios THEN the system SHALL permitir la actualización sin mostrar error de duplicidad (la validación excluye al paciente actual)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN un usuario registra un nuevo paciente con un DNI que no existe en el sistema THEN the system SHALL CONTINUE TO registrar el paciente exitosamente y navegar a la lista de pacientes

3.2 WHEN un usuario edita un paciente existente y cambia el DNI a uno que no pertenece a ningún otro paciente THEN the system SHALL CONTINUE TO actualizar el paciente exitosamente y navegar a la lista de pacientes

3.3 WHEN un usuario ingresa un DNI con formato inválido (no son 8 dígitos numéricos) THEN the system SHALL CONTINUE TO mostrar el error de validación de formato existente y prevenir el envío del formulario

3.4 WHEN un usuario deja el campo DNI vacío THEN the system SHALL CONTINUE TO mostrar el error de campo obligatorio y prevenir el envío del formulario

---

## Bug Condition (Formal)

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type PacienteRequest, context: { pacientes: Paciente[], pacienteIdActual: number | null }
  OUTPUT: boolean

  // Returns true when the DNI already belongs to another patient in the system
  IF context.pacienteIdActual IS NULL THEN
    // Modo registro: el DNI ya existe en cualquier paciente
    RETURN EXISTS p IN context.pacientes WHERE p.dni = X.dni
  ELSE
    // Modo edición: el DNI ya existe en otro paciente distinto al actual
    RETURN EXISTS p IN context.pacientes WHERE p.dni = X.dni AND p.id ≠ context.pacienteIdActual
  END IF
END FUNCTION
```

```pascal
// Property: Fix Checking - Validación de DNI duplicado
FOR ALL X WHERE isBugCondition(X) DO
  result ← registrarOActualizar'(X)
  ASSERT result.registroPrevenido = TRUE
  ASSERT result.mensajeError CONTAINS "DNI ya está registrado"
  ASSERT listaPacientes NO CAMBIA
END FOR
```

```pascal
// Property: Preservation Checking - Registro/edición normal sin duplicados
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT registrarOActualizar(X) = registrarOActualizar'(X)
END FOR
```
