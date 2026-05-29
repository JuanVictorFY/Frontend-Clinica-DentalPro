import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';
import { Cita, CitaRequest, EstadoCita, Odontologo } from '../models/cita.model';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly http = inject(HttpClient);

  listarPorFecha(fecha: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API}/citas?fecha=${fecha}`);
  }

  listarConFiltros(fecha: string, odontologoId?: number, estado?: string): Observable<Cita[]> {
    const url = odontologoId
      ? `${API}/citas?fecha=${fecha}&odontologoId=${odontologoId}`
      : `${API}/citas?fecha=${fecha}`;

    return this.http.get<Cita[]>(url).pipe(
      map(citas => estado ? citas.filter(c => c.estado === estado) : citas)
    );
  }

  listarPorPaciente(pacienteId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${API}/citas?pacienteId=${pacienteId}`);
  }

  listarOdontologos(): Observable<Odontologo[]> {
    return this.http.get<{ id: number; nombreCompleto: string }[]>(`${API}/usuarios/odontologos`).pipe(
      map(users => users.map(u => ({ id: u.id, nombre: u.nombreCompleto })))
    );
  }

  obtenerPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${API}/citas/${id}`);
  }

  crear(request: CitaRequest): Observable<Cita> {
    return this.http.post<Cita>(`${API}/citas`, {
      pacienteId: request.pacienteId,
      odontologoId: request.odontologoId,
      fecha: request.fecha,
      hora: request.hora,
      motivo: request.motivo,
      tratamientoId: request.tratamientoId ?? null
    });
  }

  actualizar(id: number, request: CitaRequest): Observable<Cita> {
    return this.http.put<Cita>(`${API}/citas/${id}`, {
      pacienteId: request.pacienteId,
      odontologoId: request.odontologoId,
      fecha: request.fecha,
      hora: request.hora,
      motivo: request.motivo,
      tratamientoId: request.tratamientoId ?? null
    });
  }

  cancelar(id: number): Observable<Cita> {
    return this.http.patch<Cita>(`${API}/citas/${id}/cancelar`, {});
  }

  atender(id: number): Observable<void> {
    return this.http.put<void>(`${API}/citas/${id}/finalizar`, {});
  }

  cambiarEstado(id: number, estado: EstadoCita): Observable<Cita> {
    return this.http.patch<Cita>(`${API}/citas/${id}/estado`, { estado });
  }
}



