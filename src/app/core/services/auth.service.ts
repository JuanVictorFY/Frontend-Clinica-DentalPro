import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { UserProfile, UserRole, TokenPayload } from '../models/user.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'dental_pro_token';
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Signal reactivo con el perfil del usuario autenticado */
  currentUser = signal<UserProfile | null>(null);

  /** Computed signal que indica si hay un usuario autenticado */
  isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    this.restoreSession();
  }

  /**
   * Inicia sesión enviando credenciales al backend.
   * Almacena el token en localStorage y actualiza el signal del usuario.
   * Redirige según el rol del usuario tras login exitoso.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.currentUser.set(response.user);
          this.redirectByRole(response.user.rol);
        })
      );
  }

  /**
   * Cierra la sesión del usuario.
   * Elimina el token de localStorage, limpia el signal y redirige a login.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el token JWT almacenado en localStorage.
   * Retorna null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el rol del usuario actual desde el token decodificado.
   * Retorna null si no hay token o es inválido.
   */
  getUserRole(): UserRole | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.decodeToken(token);
      return payload.rol;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el token JWT ha expirado.
   * Retorna true si no hay token o si está expirado.
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Decodifica el payload de un token JWT (base64url).
   * Lanza error si el token es malformado.
   */
  decodeToken(token: string): TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT malformado');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as TokenPayload;
  }

  /**
   * Restaura la sesión del usuario si hay un token válido en localStorage.
   * Se ejecuta al inicializar el servicio.
   */
  private restoreSession(): void {
    const token = this.getToken();
    if (!token || this.isTokenExpired()) {
      this.currentUser.set(null);
      return;
    }

    try {
      const payload = this.decodeToken(token);
      const user: UserProfile = {
        id: parseInt(payload.sub, 10),
        nombreCompleto: '',
        email: '',
        rol: payload.rol
      };
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Redirige al usuario a la ruta correspondiente según su rol.
   * Administrador → /intranet (acceso total)
   * Recepcionista → /intranet/pacientes
   * Odontólogo → /intranet/atencion
   */
  private redirectByRole(role: UserRole): void {
    switch (role) {
      case UserRole.ADMINISTRADOR:
        this.router.navigate(['/intranet']);
        break;
      case UserRole.RECEPCIONISTA:
        this.router.navigate(['/intranet/pacientes']);
        break;
      case UserRole.ODONTOLOGO:
        this.router.navigate(['/intranet/atencion']);
        break;
      default:
        this.router.navigate(['/intranet']);
        break;
    }
  }
}
