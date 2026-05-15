import { EstadoCita } from './estado-cita.model';

/**
 * Representa una cita registrada en el sistema.
 */
export interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  odontologoId: number;
  odontologoNombre: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: EstadoCita;
}

/**
 * Datos requeridos para registrar o actualizar una cita.
 */
export interface CitaRequest {
  pacienteId: number;
  odontologoId: number;
  fecha: string;
  hora: string;
  motivo: string;
}
