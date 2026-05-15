import { Injectable, inject, signal } from '@angular/core';
import { Cita, CitaRequest, EstadoCita, Odontologo, isTransicionValida } from '../models/cita.model';
import { PacienteService } from '../../pacientes/services/paciente.service';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly pacienteService = inject(PacienteService);

  private readonly odontologos: Odontologo[] = [
    { id: 1, nombre: 'Dr. Carlos Mendoza' },
    { id: 2, nombre: 'Dra. Sofía Castro' },
    { id: 3, nombre: 'Dr. Luis Paredes' }
  ];

  private readonly hoy = new Date().toISOString().split('T')[0];

  private readonly citas = signal<Cita[]>([
    {
      id: 1,
      pacienteId: 1,
      pacienteNombre: 'María Elena Rodríguez Huamán',
      odontologoId: 1,
      odontologoNombre: 'Dr. Carlos Mendoza',
      fecha: this.hoy,
      hora: '08:00',
      motivo: 'Limpieza dental',
      estado: EstadoCita.PENDIENTE
    },
    {
      id: 2,
      pacienteId: 2,
      pacienteNombre: 'Carlos Alberto Quispe Mamani',
      odontologoId: 2,
      odontologoNombre: 'Dra. Sofía Castro',
      fecha: this.hoy,
      hora: '08:30',
      motivo: 'Control de ortodoncia',
      estado: EstadoCita.PENDIENTE
    },
    {
      id: 3,
      pacienteId: 3,
      pacienteNombre: 'Ana Lucía Fernández Torres',
      odontologoId: 1,
      odontologoNombre: 'Dr. Carlos Mendoza',
      fecha: this.hoy,
      hora: '09:00',
      motivo: 'Extracción de muela del juicio',
      estado: EstadoCita.ATENDIDO
    },
    {
      id: 4,
      pacienteId: 4,
      pacienteNombre: 'José Luis Mendoza Vargas',
      odontologoId: 3,
      odontologoNombre: 'Dr. Luis Paredes',
      fecha: this.hoy,
      hora: '09:30',
      motivo: 'Blanqueamiento dental',
      estado: EstadoCita.CANCELADO
    },
    {
      id: 5,
      pacienteId: 5,
      pacienteNombre: 'Rosa María Chávez Díaz',
      odontologoId: 2,
      odontologoNombre: 'Dra. Sofía Castro',
      fecha: this.hoy,
      hora: '10:00',
      motivo: 'Revisión de caries',
      estado: EstadoCita.REAGENDADO
    },
    {
      id: 6,
      pacienteId: 6,
      pacienteNombre: 'Pedro Alejandro Sánchez Flores',
      odontologoId: 1,
      odontologoNombre: 'Dr. Carlos Mendoza',
      fecha: this.hoy,
      hora: '10:30',
      motivo: 'Colocación de corona',
      estado: EstadoCita.PENDIENTE
    },
    {
      id: 7,
      pacienteId: 7,
      pacienteNombre: 'Lucía Esperanza Paredes Ramos',
      odontologoId: 3,
      odontologoNombre: 'Dr. Luis Paredes',
      fecha: this.hoy,
      hora: '11:00',
      motivo: 'Endodoncia',
      estado: EstadoCita.PENDIENTE
    },
    {
      id: 8,
      pacienteId: 8,
      pacienteNombre: 'Miguel Ángel Huanca Condori',
      odontologoId: 2,
      odontologoNombre: 'Dra. Sofía Castro',
      fecha: this.hoy,
      hora: '11:30',
      motivo: 'Consulta general',
      estado: EstadoCita.PENDIENTE
    }
  ]);

  private nextId = 9;

  /** Retorna la lista de odontólogos disponibles */
  listarOdontologos(): Odontologo[] {
    return this.odontologos;
  }

  /** Filtra citas por fecha */
  listarPorFecha(fecha: string): Cita[] {
    return this.citas().filter(c => c.fecha === fecha);
  }

  /** Obtiene una cita por su ID */
  obtenerPorId(id: number): Cita | undefined {
    return this.citas().find(c => c.id === id);
  }

  /** Registra una nueva cita con estado PENDIENTE */
  registrar(request: CitaRequest): void {
    const paciente = this.pacienteService.obtenerPorId(request.pacienteId);
    const odontologo = this.odontologos.find(o => o.id === request.odontologoId);

    const nueva: Cita = {
      id: this.nextId++,
      pacienteId: request.pacienteId,
      pacienteNombre: paciente?.nombreCompleto ?? 'Paciente desconocido',
      odontologoId: request.odontologoId,
      odontologoNombre: odontologo?.nombre ?? 'Odontólogo desconocido',
      fecha: request.fecha,
      hora: request.hora,
      motivo: request.motivo,
      estado: EstadoCita.PENDIENTE
    };

    this.citas.update(list => [...list, nueva]);
  }

  /** Actualiza una cita existente. Si cambia fecha/hora, pasa a REAGENDADO */
  actualizar(id: number, request: CitaRequest): void {
    const paciente = this.pacienteService.obtenerPorId(request.pacienteId);
    const odontologo = this.odontologos.find(o => o.id === request.odontologoId);

    this.citas.update(list =>
      list.map(c => {
        if (c.id !== id) return c;

        const cambioFechaHora = c.fecha !== request.fecha || c.hora !== request.hora;
        const nuevoEstado = cambioFechaHora && isTransicionValida(c.estado, EstadoCita.REAGENDADO)
          ? EstadoCita.REAGENDADO
          : c.estado;

        return {
          ...c,
          pacienteId: request.pacienteId,
          pacienteNombre: paciente?.nombreCompleto ?? c.pacienteNombre,
          odontologoId: request.odontologoId,
          odontologoNombre: odontologo?.nombre ?? c.odontologoNombre,
          fecha: request.fecha,
          hora: request.hora,
          motivo: request.motivo,
          estado: nuevoEstado
        };
      })
    );
  }

  /** Cancela una cita (cambia estado a CANCELADO) */
  cancelar(id: number): void {
    this.citas.update(list =>
      list.map(c => {
        if (c.id !== id) return c;
        if (!isTransicionValida(c.estado, EstadoCita.CANCELADO)) return c;
        return { ...c, estado: EstadoCita.CANCELADO };
      })
    );
  }

  /** Marca una cita como atendida */
  atender(id: number): void {
    this.citas.update(list =>
      list.map(c => {
        if (c.id !== id) return c;
        if (!isTransicionValida(c.estado, EstadoCita.ATENDIDO)) return c;
        return { ...c, estado: EstadoCita.ATENDIDO };
      })
    );
  }
}
