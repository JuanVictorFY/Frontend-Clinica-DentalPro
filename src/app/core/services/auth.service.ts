import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { UserRole, UserProfile } from '../models/user.model';

interface LoginApiResponse {
  token: string;
  user: {
    id: number;
    nombreCompleto: string;
    email: string;
    rol: string;
  };
}

const TOKEN_KEY = 'dental_pro_token';
const USER_KEY  = 'dental_pro_user';
const API = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser    = signal<UserProfile | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null && !this.isTokenExpired());

  constructor() { this.restoreSession(); }

  /** Login para personal de la clínica (tabla usuarios) */
  login(email: string, password: string): Observable<UserProfile> {
    return this.http.post<LoginApiResponse>(`${API}/login`, { email, password }).pipe(
      tap(res  => this.saveSession(res)),
      map(res  => ({ ...res.user, rol: res.user.rol as UserRole }))
    );
  }

  /** Login para pacientes (tabla pacientes) */
  loginPaciente(email: string, password: string): Observable<UserProfile> {
    return this.http.post<LoginApiResponse>(`${API}/login-paciente`, { email, password }).pipe(
      tap(res  => this.saveSession(res)),
      map(res  => ({ ...res.user, rol: res.user.rol as UserRole }))
    );
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserRole(): UserRole | null {
    const payload = this.decodeToken();
    return payload ? payload.rol as UserRole : null;
  }

  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) return true;
    return payload.exp < Math.floor(Date.now() / 1000);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(res: LoginApiResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUser.set({ ...res.user, rol: res.user.rol as UserRole });
  }

  private restoreSession(): void {
    if (typeof window === 'undefined') return;
    const token = this.getToken();
    if (!token || this.isTokenExpired()) { this.currentUser.set(null); return; }
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set({ ...user, rol: user.rol as UserRole });
      } catch { this.currentUser.set(null); }
    }
  }

  private decodeToken(): { sub: string; rol: string; userId: number; exp: number; iat: number } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch { return null; }
  }
}


