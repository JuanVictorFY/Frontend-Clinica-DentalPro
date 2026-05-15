/**
 * Estados posibles de una cita en el sistema.
 */
export enum EstadoCita {
  PENDIENTE = 'PENDIENTE',
  ATENDIDO = 'ATENDIDO',
  CANCELADO = 'CANCELADO',
  REAGENDADO = 'REAGENDADO'
}

/**
 * Mapa de transiciones válidas entre estados de cita.
 *
 * Transiciones permitidas:
 * - PENDIENTE → ATENDIDO, CANCELADO, REAGENDADO
 * - REAGENDADO → ATENDIDO, CANCELADO
 * - ATENDIDO y CANCELADO son estados terminales (sin transiciones salientes)
 */
const TRANSICIONES_VALIDAS: Record<EstadoCita, EstadoCita[]> = {
  [EstadoCita.PENDIENTE]: [EstadoCita.ATENDIDO, EstadoCita.CANCELADO, EstadoCita.REAGENDADO],
  [EstadoCita.REAGENDADO]: [EstadoCita.ATENDIDO, EstadoCita.CANCELADO],
  [EstadoCita.ATENDIDO]: [],
  [EstadoCita.CANCELADO]: []
};

/**
 * Verifica si una transición de estado es válida según la máquina de estados de citas.
 *
 * @param from Estado actual de la cita
 * @param to Estado destino deseado
 * @returns true si la transición es permitida, false en caso contrario
 */
export function isTransicionValida(from: EstadoCita, to: EstadoCita): boolean {
  const transicionesPermitidas = TRANSICIONES_VALIDAS[from];
  return transicionesPermitidas.includes(to);
}
