import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

const API = 'http://localhost:8080/api';

export interface CitaDashboard {
  id: number;
  pacienteNombre: string;
  odontologoNombre: string;
  hora: string;
  motivo: string;
  estado: string;
}

export interface DashboardData {
  totalPacientes: number;
  citas: CitaDashboard[];
}

export interface ReporteResumen {
  id: number;
  pacienteNombre: string;
  odontologoNombre: string;
  diagnostico: string;
  tratamiento: string;
  fecha: string;
}

export interface OdontologoConReportes {
  id: number;
  nombre: string;
  reportes: ReporteResumen[];
}

export interface AdminStats {
  porEstado: Record<string, number>;
  porOdontologo: { nombre: string; total: number }[];
  ultimos7Dias: { fecha: string; dia: string; total: number }[];
  totalPacientes: number;
  totalCitasMes: number;
  mes: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  cargarStatsAdmin(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API}/stats/admin`);
  }

  cargarReportesOdontologos(): Observable<OdontologoConReportes[]> {
    return forkJoin({
      odontologos: this.http.get<{ id: number; nombreCompleto: string }[]>(`${API}/usuarios/odontologos`),
      reportes: this.http.get<{ content: ReporteResumen[] }>(`${API}/reportes?page=1&size=200`)
    }).pipe(
      map(({ odontologos, reportes }) =>
        odontologos.map(o => ({
          id: o.id,
          nombre: o.nombreCompleto,
          reportes: reportes.content
            .filter(r => r.odontologoNombre === o.nombreCompleto)
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
        }))
      )
    );
  }

  cargarMisReportes(odontologoNombre: string): Observable<ReporteResumen[]> {
    const nombre = encodeURIComponent(odontologoNombre);
    return this.http
      .get<{ content: ReporteResumen[] }>(`${API}/reportes?page=1&size=50&odontologoNombre=${nombre}`)
      .pipe(map(r => r.content));
  }

  cargar(fecha: string, odontologoId?: number): Observable<DashboardData> {
    const citasUrl = odontologoId
      ? `${API}/citas?fecha=${fecha}&odontologoId=${odontologoId}`
      : `${API}/citas?fecha=${fecha}`;

    if (odontologoId) {
      return this.http.get<CitaDashboard[]>(citasUrl).pipe(
        map(citas => ({ totalPacientes: 0, citas }))
      );
    }

    return forkJoin({
      pacientes: this.http.get<{ totalElements: number }>(`${API}/pacientes?page=1&size=1`),
      citas: this.http.get<CitaDashboard[]>(citasUrl)
    }).pipe(
      map(({ pacientes, citas }) => ({
        totalPacientes: pacientes.totalElements,
        citas
      }))
    );
  }
}
