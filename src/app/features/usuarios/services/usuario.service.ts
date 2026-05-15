import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Usuario, UsuarioRequest } from '../models/usuario.model';
import { environment } from '../../../../environments/environment';

/**
 * Servicio para la gestión de usuarios del sistema DentalPro.
 * Provee operaciones CRUD y listado de odontólogos para selectores.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly API_URL = `${environment.apiUrl}/usuarios`;
  private readonly http = inject(HttpClient);

  /**
   * Obtiene la lista completa de usuarios registrados.
   * GET /usuarios
   */
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL);
  }

  /**
   * Obtiene un usuario por su ID.
   * GET /usuarios/{id}
   */
  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${id}`);
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * POST /usuarios
   */
  registrar(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, request);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * PUT /usuarios/{id}
   */
  actualizar(id: number, request: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/${id}`, request);
  }

  /**
   * Elimina un usuario del sistema.
   * DELETE /usuarios/{id}
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtiene la lista de usuarios con rol Odontólogo.
   * Utilizado en selectores de citas para asignar odontólogo.
   * GET /usuarios/odontologos
   */
  listarOdontologos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/odontologos`);
  }
}
