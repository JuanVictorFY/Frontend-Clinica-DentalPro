import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole, UserProfile, TokenPayload } from '../models/user.model';

const MOCK_USERS: Record<string, { password: string; profile: UserProfile }> = {
  'admin@dental.com': {
    password: '123456',
    profile: { id: 1, nombreCompleto: 'Administrador General', email: 'admin@dental.com', rol: UserRole.ADMIN }
  },
  'recepcion@dental.com': {
    password: '123456',
    profile: { id: 2, nombreCompleto: 'Ana García López', email: 'recepcion@dental.com', rol: UserRole.RECEPCIONISTA }
  },
  'doctor@dental.com': {
    password: '123456',
    profile: { id: 3, nombreCompleto: 'Dr. Carlos Mendoza', email: 'doctor@dental.com', rol: UserRole.ODONTOLOGO }
  }
};

const TOKEN_KEY = 'dental_pro_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  readonly currentUser = signal<UserProfile | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null && !this.isTokenExpired());

  constructor() {
    this.restoreSession();
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserRole(): UserRole | null {
    const payload = this.decodeToken();
    return payload ? payload.rol : null;
  }

  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    const user = MOCK_USERS[email.toLowerCase()];

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    const token = this.generateFakeToken(user.profile);
    localStorage.setItem(TOKEN_KEY, token);
    this.currentUser.set(user.profile);

    return { success: true };
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private restoreSession(): void {
    if (typeof window === 'undefined') return;

    const token = this.getToken();
    if (!token || this.isTokenExpired()) {
      this.currentUser.set(null);
      return;
    }

    const payload = this.decodeToken();
    if (payload) {
      const email = payload.sub;
      const user = MOCK_USERS[email];
      if (user) {
        this.currentUser.set(user.profile);
      }
    }
  }

  private generateFakeToken(profile: UserProfile): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      sub: profile.email,
      rol: profile.rol,
      iat: now,
      exp: now + 86400 // 24 hours
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.base64UrlEncode('fake-signature-dental-pro');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private decodeToken(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  private base64UrlEncode(str: string): string {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
