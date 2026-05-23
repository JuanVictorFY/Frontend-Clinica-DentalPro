import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago } from '../models/pago.model';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${API}/pagos`);
  }

  cambiarEstado(id: number, estado: string): Observable<Pago> {
    return this.http.patch<Pago>(`${API}/pagos/${id}/estado`, { estado });
  }
}
