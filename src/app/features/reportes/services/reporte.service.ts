import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reporte } from '../models/reporte.model';

const API = 'http://localhost:8080/api';

interface ReportePage {
  content: Reporte[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);

  listar(page = 1, size = 5): Observable<ReportePage> {
    return this.http.get<ReportePage>(`${API}/reportes?page=${page}&size=${size}`);
  }

  obtenerPorId(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${API}/reportes/${id}`);
  }

  obtenerPorCita(citaId: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${API}/reportes/cita/${citaId}`);
  }

  generarPdf(id: number): Observable<Blob> {
    return this.http.get(`${API}/reportes/${id}/pdf`, { responseType: 'blob' });
  }
}
