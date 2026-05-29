export interface Pago {
  id: number;
  atencionId: number;
  pacienteId: number;
  pacienteNombre: string;
  odontologoNombre: string;
  citaFecha: string;
  monto: number;
  metodoPago: MetodoPago;
  fechaPago: string;
  estado: EstadoPago;
}

export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'ANULADO';



