import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Tratamiento, TratamientoRequest } from '../models/tratamiento.model';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class TratamientoService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${API}/tratamientos`);
  }

  crear(dto: TratamientoRequest): Observable<Tratamiento> {
    return this.http.post<Tratamiento>(`${API}/tratamientos`, dto);
  }

  actualizar(id: number, dto: TratamientoRequest): Observable<Tratamiento> {
    return this.http.put<Tratamiento>(`${API}/tratamientos/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/tratamientos/${id}`);
  }
}



