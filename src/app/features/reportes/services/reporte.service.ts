import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { Reporte, ReporteFiltros } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/reportes`;

  /**
   * Genera un reporte de atención para una cita finalizada.
   */
  generar(citaId: number): Observable<Reporte> {
    return this.http.post<Reporte>(`${this.API_URL}/generar/${citaId}`, null);
  }

  /**
   * Obtiene el reporte asociado a una cita específica.
   */
  obtenerPorCita(citaId: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.API_URL}/cita/${citaId}`);
  }

  /**
   * Lista reportes paginados con filtros opcionales.
   */
  listar(filtros: ReporteFiltros): Observable<PaginatedResponse<Reporte>> {
    let params = new HttpParams();

    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }
    if (filtros.pacienteId) {
      params = params.set('pacienteId', filtros.pacienteId.toString());
    }
    if (filtros.page != null) {
      params = params.set('page', filtros.page.toString());
    }
    if (filtros.size != null) {
      params = params.set('size', filtros.size.toString());
    }

    return this.http.get<PaginatedResponse<Reporte>>(this.API_URL, { params });
  }

  /**
   * Descarga el reporte en formato PDF.
   */
  descargarPdf(reporteId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${reporteId}/pdf`, {
      responseType: 'blob'
    });
  }
}
