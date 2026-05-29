import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HistorialClinico } from '../models/historial-clinico.model';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class HistorialClinicoService {
  private readonly http = inject(HttpClient);

  obtener(pacienteId: number): Observable<HistorialClinico> {
    return this.http.get<HistorialClinico>(`${API}/historial/paciente/${pacienteId}`);
  }

  guardar(pacienteId: number, dto: Partial<HistorialClinico>): Observable<HistorialClinico> {
    return this.http.put<HistorialClinico>(`${API}/historial/paciente/${pacienteId}`, dto);
  }
}
