/**
 * Modelo de Paciente retornado por la API REST.
 */
export interface Paciente {
  id: number;
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
}

/**
 * Modelo de solicitud para registrar o actualizar un paciente.
 * Omite el campo id ya que es generado por el backend.
 */
export interface PacienteRequest {
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
}
