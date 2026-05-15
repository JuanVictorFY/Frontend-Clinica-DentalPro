export interface Paciente {
  id: number;
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
}

export interface PacienteRequest {
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
}
