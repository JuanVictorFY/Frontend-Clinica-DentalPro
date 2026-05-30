export interface Tratamiento {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
}

export interface TratamientoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
}




