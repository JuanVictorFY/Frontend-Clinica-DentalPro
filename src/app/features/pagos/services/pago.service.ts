import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pago, MetodoPago } from '../models/pago.model';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${API}/pagos`);
  }

  cobrar(id: number, monto: number, metodoPago: MetodoPago): Observable<Pago> {
    return this.http.patch<Pago>(`${API}/pagos/${id}/cobrar`, { monto, metodoPago });
  }

  cambiarEstado(id: number, estado: string): Observable<Pago> {
    return this.http.patch<Pago>(`${API}/pagos/${id}/estado`, { estado });
  }
}
