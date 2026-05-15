/**
 * Representa un reporte de atención generado al finalizar una cita.
 */
export interface Reporte {
  id: number;
  citaId: number;
  pacienteNombre: string;
  odontologoNombre: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  fecha: string;
}

/**
 * Filtros para la búsqueda y listado de reportes.
 */
export interface ReporteFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  pacienteId?: number;
  page?: number;
  size?: number;
}
