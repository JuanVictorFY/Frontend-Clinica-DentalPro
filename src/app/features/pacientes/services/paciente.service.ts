import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';
import { Paciente, PacienteRequest } from '../models/paciente.model';

const API = environment.apiUrl;

interface PacientePage {
  content: Paciente[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);

  listar(page = 1, size = 5): Observable<PacientePage> {
    return this.http.get<PacientePage>(`${API}/pacientes?page=${page}&size=${size}`);
  }

  listarTodos(): Observable<Paciente[]> {
    return this.http.get<PacientePage>(`${API}/pacientes?page=1&size=1000`).pipe(
      map(r => r.content)
    );
  }

  buscar(q: string): Observable<Paciente[]> {
    if (!q || !q.trim()) return this.listarTodos();
    return this.http.get<Paciente[]>(`${API}/pacientes/buscar?q=${encodeURIComponent(q)}`);
  }

  obtenerPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${API}/pacientes/${id}`);
  }

  crear(dto: PacienteRequest): Observable<Paciente> {
    return this.http.post<Paciente>(`${API}/pacientes`, dto);
  }

  actualizar(id: number, dto: PacienteRequest): Observable<Paciente> {
    return this.http.put<Paciente>(`${API}/pacientes/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/pacientes/${id}`);
  }
}


