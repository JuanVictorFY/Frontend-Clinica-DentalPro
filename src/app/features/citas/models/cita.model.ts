export enum EstadoCita {
  PENDIENTE = 'PENDIENTE',
  ATENDIDO = 'ATENDIDO',
  CANCELADO = 'CANCELADO',
  REAGENDADO = 'REAGENDADO'
}

export interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  odontologoId: number;
  odontologoNombre: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  motivo: string;
  estado: EstadoCita;
}

export interface CitaRequest {
  pacienteId: number;
  odontologoId: number;
  fecha: string;
  hora: string;
  motivo: string;
}

export interface Odontologo {
  id: number;
  nombre: string;
}

export function isTransicionValida(from: EstadoCita, to: EstadoCita): boolean {
  const transiciones: Record<EstadoCita, EstadoCita[]> = {
    [EstadoCita.PENDIENTE]: [EstadoCita.ATENDIDO, EstadoCita.CANCELADO, EstadoCita.REAGENDADO],
    [EstadoCita.REAGENDADO]: [EstadoCita.ATENDIDO, EstadoCita.CANCELADO],
    [EstadoCita.ATENDIDO]: [],
    [EstadoCita.CANCELADO]: []
  };
  return transiciones[from].includes(to);
}
