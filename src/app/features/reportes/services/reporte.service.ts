import { Injectable, inject } from '@angular/core';
import { AtencionService } from '../../atencion/services/atencion.service';
import { Reporte } from '../models/reporte.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly atencionService = inject(AtencionService);

  /** Retorna todas las notas clínicas como reportes */
  listar(): Reporte[] {
    return this.atencionService.listarNotasClinicas().map(nota => ({
      id: nota.id,
      citaId: nota.citaId,
      pacienteNombre: nota.pacienteNombre,
      odontologoNombre: nota.odontologoNombre,
      diagnostico: nota.diagnostico,
      tratamiento: nota.tratamiento,
      observaciones: nota.observaciones,
      fecha: nota.fecha
    }));
  }

  /** Obtiene un reporte por su ID */
  obtenerPorId(id: number): Reporte | undefined {
    return this.listar().find(r => r.id === id);
  }
}
