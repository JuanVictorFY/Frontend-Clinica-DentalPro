export interface NotaClinica {
  id: number;
  citaId: number;
  pacienteId: number;
  pacienteNombre: string;
  odontologoNombre: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  fecha: string;
}

export interface NotaClinicaRequest {
  citaId: number;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}
