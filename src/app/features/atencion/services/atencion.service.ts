import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NotaClinica, NotaClinicaRequest } from '../models/nota-clinica.model';

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/atenciones`;
  private readonly CITAS_URL = `${environment.apiUrl}/citas`;

  /**
   * Registra una nota clínica para una cita.
   * POST /atenciones
   */
  registrarNotaClinica(request: NotaClinicaRequest): Observable<NotaClinica> {
    return this.http.post<NotaClinica>(this.API_URL, request);
  }

  /**
   * Finaliza la atención de una cita, cambiando su estado a ATENDIDO.
   * PUT /citas/{citaId}/finalizar
   */
  finalizarAtencion(citaId: number): Observable<void> {
    return this.http.put<void>(`${this.CITAS_URL}/${citaId}/finalizar`, null);
  }
}
