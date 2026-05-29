import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

const API = `${environment.apiUrl}/usuarios`;

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(API);
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${API}/${id}`);
  }

  crear(usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(API, usuario);
  }

  actualizar(id: number, usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${API}/${id}`, usuario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}



