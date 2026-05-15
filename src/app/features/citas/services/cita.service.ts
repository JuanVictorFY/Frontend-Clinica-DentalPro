import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Cita, CitaRequest } from '../models/cita.model';
import { EstadoCita } from '../models/estado-cita.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly API_URL = `${environment.apiUrl}/citas`;
  private readonly http = inject(HttpClient);

  /**
   * Obtiene las citas programadas para una fecha específica.
   * @param fecha Fecha en formato 'YYYY-MM-DD'
   */
  listarPorFecha(fecha: string): Observable<Cita[]> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<Cita[]>(this.API_URL, { params });
  }

  /**
   * Obtiene una cita por su ID.
   */
  obtenerPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.API_URL}/${id}`);
  }

  /**
   * Registra una nueva cita en el sistema.
   * La cita se crea con estado PENDIENTE automáticamente.
   */
  registrar(cita: CitaRequest): Observable<Cita> {
    return this.http.post<Cita>(this.API_URL, cita);
  }

  /**
   * Actualiza los datos de una cita existente.
   * Si se modifica fecha u hora, el backend cambia el estado a REAGENDADO.
   */
  actualizar(id: number, cita: CitaRequest): Observable<Cita> {
    return this.http.put<Cita>(`${this.API_URL}/${id}`, cita);
  }

  /**
   * Cancela una cita cambiando su estado a CANCELADO.
   * Solo válido para citas en estado PENDIENTE o REAGENDADO.
   */
  cancelar(id: number): Observable<Cita> {
    return this.http.patch<Cita>(`${this.API_URL}/${id}/cancelar`, {});
  }

  /**
   * Cambia el estado de una cita.
   * Respeta la máquina de estados: solo transiciones válidas son aceptadas.
   */
  cambiarEstado(id: number, estado: EstadoCita): Observable<Cita> {
    return this.http.patch<Cita>(`${this.API_URL}/${id}/estado`, { estado });
  }

  /**
   * Verifica si un odontólogo está disponible en una fecha y hora específicas.
   * Retorna true si el horario está libre, false si hay conflicto.
   */
  verificarDisponibilidad(odontologoId: number, fecha: string, hora: string): Observable<boolean> {
    const params = new HttpParams()
      .set('odontologoId', odontologoId.toString())
      .set('fecha', fecha)
      .set('hora', hora);
    return this.http.get<boolean>(`${this.API_URL}/disponibilidad`, { params });
  }
}
