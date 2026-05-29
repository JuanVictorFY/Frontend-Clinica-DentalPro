import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, switchMap, map } from 'rxjs';
import { NotaClinica, NotaClinicaRequest } from '../models/atencion.model';

const API = environment.apiUrl;

interface AtencionBackend {
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

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private readonly http = inject(HttpClient);

  registrarNota(request: NotaClinicaRequest): Observable<void> {
    return this.http.post<AtencionBackend>(`${API}/atenciones`, {
      citaId: request.citaId,
      diagnostico: request.diagnostico,
      tratamiento: request.tratamiento,
      observaciones: request.observaciones
    }).pipe(
      switchMap(() => this.http.put<void>(`${API}/citas/${request.citaId}/finalizar`, {}))
    );
  }

  listarPorPaciente(pacienteId: number): Observable<NotaClinica[]> {
    return this.http.get<AtencionBackend[]>(`${API}/atenciones?pacienteId=${pacienteId}`).pipe(
      map(items => items.map(a => ({
        id: a.id,
        citaId: a.citaId,
        pacienteId: a.pacienteId,
        pacienteNombre: a.pacienteNombre,
        odontologoNombre: a.odontologoNombre,
        diagnostico: a.diagnostico,
        tratamiento: a.tratamiento,
        observaciones: a.observaciones ?? '',
        fecha: a.fecha
      })))
    );
  }
}
