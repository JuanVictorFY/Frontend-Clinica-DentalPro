import { Injectable, inject, signal } from '@angular/core';
import { NotaClinica, NotaClinicaRequest } from '../models/atencion.model';
import { CitaService } from '../../citas/services/cita.service';

@Injectable({
  providedIn: 'root'
})
export class AtencionService {
  private readonly citaService = inject(CitaService);

  private readonly notasClinicas = signal<NotaClinica[]>([
    {
      id: 1,
      citaId: 3,
      pacienteId: 3,
      pacienteNombre: 'Ana Lucía Fernández Torres',
      odontologoNombre: 'Dr. Carlos Mendoza',
      diagnostico: 'Tercera molar impactada con inflamación pericoronaria',
      tratamiento: 'Extracción quirúrgica de tercera molar inferior derecha bajo anestesia local',
      observaciones: 'Paciente toleró bien el procedimiento. Se recetó antibiótico y analgésico por 5 días.',
      fecha: new Date().toISOString().split('T')[0]
    },
    {
      id: 2,
      citaId: 99,
      pacienteId: 10,
      pacienteNombre: 'Fernando Daniel Castillo Rojas',
      odontologoNombre: 'Dra. Sofía Castro',
      diagnostico: 'Caries dental en premolar superior izquierdo',
      tratamiento: 'Restauración con resina compuesta',
      observaciones: 'Se recomienda control en 6 meses.',
      fecha: '2025-01-10'
    }
  ]);

  private nextId = 3;

  /** Retorna todas las notas clínicas */
  listarNotasClinicas(): NotaClinica[] {
    return this.notasClinicas();
  }

  /** Registra una nueva nota clínica y marca la cita como atendida */
  registrarNota(request: NotaClinicaRequest): void {
    const cita = this.citaService.obtenerPorId(request.citaId);

    const nueva: NotaClinica = {
      id: this.nextId++,
      citaId: request.citaId,
      pacienteId: cita?.pacienteId ?? 0,
      pacienteNombre: cita?.pacienteNombre ?? 'Paciente desconocido',
      odontologoNombre: cita?.odontologoNombre ?? 'Odontólogo desconocido',
      diagnostico: request.diagnostico,
      tratamiento: request.tratamiento,
      observaciones: request.observaciones,
      fecha: cita?.fecha ?? new Date().toISOString().split('T')[0]
    };

    this.notasClinicas.update(list => [...list, nueva]);

    // Cambiar estado de la cita a ATENDIDO
    this.citaService.atender(request.citaId);
  }

  /** Retorna las notas clínicas de un paciente específico */
  listarPorPaciente(pacienteId: number): NotaClinica[] {
    return this.notasClinicas().filter(n => n.pacienteId === pacienteId);
  }

  /** Obtiene una nota clínica por el ID de la cita */
  obtenerPorCitaId(citaId: number): NotaClinica | undefined {
    return this.notasClinicas().find(n => n.citaId === citaId);
  }
}
