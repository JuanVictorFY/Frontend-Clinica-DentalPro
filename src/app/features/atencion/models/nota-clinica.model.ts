/**
 * Modelo de Nota Clínica retornado por la API REST.
 */
export interface NotaClinica {
  id: number;
  citaId: number;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  fecha: string;
}

/**
 * Modelo de solicitud para registrar una nota clínica.
 * Incluye citaId para asociar la nota a una cita específica.
 */
export interface NotaClinicaRequest {
  citaId: number;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}
