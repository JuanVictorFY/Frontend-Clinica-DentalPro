import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { Paciente, PacienteRequest } from '../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/pacientes`;

  /**
   * Obtiene la lista paginada de pacientes.
   */
  listar(page: number, size: number): Observable<PaginatedResponse<Paciente>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<Paciente>>(this.API_URL, { params });
  }

  /**
   * Busca pacientes por nombre o DNI.
   */
  buscar(query: string): Observable<Paciente[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Paciente[]>(`${this.API_URL}/buscar`, { params });
  }

  /**
   * Obtiene un paciente por su ID.
   */
  obtenerPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.API_URL}/${id}`);
  }

  /**
   * Registra un nuevo paciente.
   */
  registrar(paciente: PacienteRequest): Observable<Paciente> {
    return this.http.post<Paciente>(this.API_URL, paciente);
  }

  /**
   * Actualiza los datos de un paciente existente.
   */
  actualizar(id: number, paciente: PacienteRequest): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.API_URL}/${id}`, paciente);
  }

  /**
   * Elimina un paciente por su ID.
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
