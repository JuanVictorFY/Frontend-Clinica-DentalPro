import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';
import { LoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const TOKEN_KEY = 'dental_pro_token';

  /** Helper: crea un token JWT fake con payload dado */
  function createFakeToken(payload: object): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = 'fake-signature';
    return `${header}.${body}.${signature}`;
  }

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login()', () => {
    it('should store token in localStorage and update currentUser on success', () => {
      const mockResponse: LoginResponse = {
        token: createFakeToken({
          sub: '1',
          rol: UserRole.ADMINISTRADOR,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        }),
        user: {
          id: 1,
          nombreCompleto: 'Admin User',
          email: 'admin@dental.com',
          rol: UserRole.ADMINISTRADOR,
        },
      };

      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      service.login({ email: 'admin@dental.com', password: '123456' }).subscribe((res) => {
        expect(res).toEqual(mockResponse);
        expect(localStorage.getItem(TOKEN_KEY)).toBe(mockResponse.token);
        expect(service.currentUser()).toEqual(mockResponse.user);
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(navigateSpy).toHaveBeenCalledWith(['/intranet']);
    });

    it('should redirect RECEPCIONISTA to /intranet/pacientes', () => {
      const mockResponse: LoginResponse = {
        token: createFakeToken({
          sub: '2',
          rol: UserRole.RECEPCIONISTA,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        }),
        user: {
          id: 2,
          nombreCompleto: 'Recepcionista',
          email: 'recep@dental.com',
          rol: UserRole.RECEPCIONISTA,
        },
      };

      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      service.login({ email: 'recep@dental.com', password: '123456' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(navigateSpy).toHaveBeenCalledWith(['/intranet/pacientes']);
    });

    it('should redirect ODONTOLOGO to /intranet/atencion', () => {
      const mockResponse: LoginResponse = {
        token: createFakeToken({
          sub: '3',
          rol: UserRole.ODONTOLOGO,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        }),
        user: {
          id: 3,
          nombreCompleto: 'Dr. Odontólogo',
          email: 'odon@dental.com',
          rol: UserRole.ODONTOLOGO,
        },
      };

      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      service.login({ email: 'odon@dental.com', password: '123456' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(navigateSpy).toHaveBeenCalledWith(['/intranet/atencion']);
    });
  });

  describe('logout()', () => {
    it('should remove token from localStorage, clear user, and navigate to /login', () => {
      localStorage.setItem(TOKEN_KEY, 'some-token');
      service.currentUser.set({
        id: 1,
        nombreCompleto: 'Test',
        email: 'test@test.com',
        rol: UserRole.ADMINISTRADOR,
      });

      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      service.logout();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken()', () => {
    it('should return the token from localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getUserRole()', () => {
    it('should return the role from a valid token', () => {
      const token = createFakeToken({
        sub: '1',
        rol: UserRole.ODONTOLOGO,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });
      localStorage.setItem(TOKEN_KEY, token);

      expect(service.getUserRole()).toBe(UserRole.ODONTOLOGO);
    });

    it('should return null when no token exists', () => {
      expect(service.getUserRole()).toBeNull();
    });

    it('should return null for a malformed token', () => {
      localStorage.setItem(TOKEN_KEY, 'not-a-valid-token');
      expect(service.getUserRole()).toBeNull();
    });
  });

  describe('isTokenExpired()', () => {
    it('should return true when no token exists', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true for an expired token', () => {
      const token = createFakeToken({
        sub: '1',
        rol: UserRole.ADMINISTRADOR,
        exp: Math.floor(Date.now() / 1000) - 3600,
        iat: Math.floor(Date.now() / 1000) - 7200,
      });
      localStorage.setItem(TOKEN_KEY, token);

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false for a valid non-expired token', () => {
      const token = createFakeToken({
        sub: '1',
        rol: UserRole.ADMINISTRADOR,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });
      localStorage.setItem(TOKEN_KEY, token);

      expect(service.isTokenExpired()).toBe(false);
    });

    it('should return true for a malformed token', () => {
      localStorage.setItem(TOKEN_KEY, 'invalid.token');
      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('decodeToken()', () => {
    it('should decode a valid JWT token payload', () => {
      const payload = {
        sub: '42',
        rol: UserRole.RECEPCIONISTA,
        exp: 1700000000,
        iat: 1699996400,
      };
      const token = createFakeToken(payload);

      const decoded = service.decodeToken(token);

      expect(decoded.sub).toBe('42');
      expect(decoded.rol).toBe(UserRole.RECEPCIONISTA);
      expect(decoded.exp).toBe(1700000000);
      expect(decoded.iat).toBe(1699996400);
    });

    it('should throw for a malformed token (less than 3 parts)', () => {
      expect(() => service.decodeToken('only.two')).toThrow();
    });
  });

  describe('session restoration', () => {
    it('should restore user from valid token on initialization', () => {
      const token = createFakeToken({
        sub: '5',
        rol: UserRole.RECEPCIONISTA,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      });
      localStorage.setItem(TOKEN_KEY, token);

      // Re-create the service to trigger constructor
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
        ],
      });
      const newService = TestBed.inject(AuthService);

      expect(newService.currentUser()).not.toBeNull();
      expect(newService.currentUser()?.rol).toBe(UserRole.RECEPCIONISTA);
      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should not restore user from expired token', () => {
      const token = createFakeToken({
        sub: '5',
        rol: UserRole.ADMINISTRADOR,
        exp: Math.floor(Date.now() / 1000) - 100,
        iat: Math.floor(Date.now() / 1000) - 3700,
      });
      localStorage.setItem(TOKEN_KEY, token);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
        ],
      });
      const newService = TestBed.inject(AuthService);

      expect(newService.currentUser()).toBeNull();
      expect(newService.isAuthenticated()).toBe(false);
    });
  });
});
