import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/api/auth';

export interface RegistroPacienteRequest {
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  password: string;
}

export interface ForgotPasswordResponse {
  mensaje: string;
  devCode: string | null;
}

@Injectable({ providedIn: 'root' })
export class PacienteAuthService {
  private readonly http = inject(HttpClient);

  registrar(data: RegistroPacienteRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${API}/registro-paciente`, data);
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${API}/forgot-password`, { email });
  }

  verifyCode(email: string, code: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${API}/verify-code`, { email, code });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${API}/reset-password`, { email, code, newPassword });
  }
}
