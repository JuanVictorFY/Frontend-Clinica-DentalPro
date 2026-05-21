import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

function makeToken(rol: string, expOffset = 86400): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({ sub: 'test@test.com', rol, userId: 1, iat: now, exp: now + expOffset }));
  return `${header}.${payload}.fakesig`;
}

function mockLoginResponse(rol: string, email = 'test@test.com') {
  return {
    token: makeToken(rol),
    user: { id: 1, nombreCompleto: 'Test User', email, rol }
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('debe autenticar como administrador vía endpoint de staff', async () => {
      const promise = firstValueFrom(service.login('admin@dental.com', '123456'));
      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse('ADMINISTRADOR', 'admin@dental.com'));
      const user = await promise;
      expect(user.rol).toBe(UserRole.ADMINISTRADOR);
      expect(service.currentUser()).not.toBeNull();
    });

    it('debe intentar login de paciente si el staff falla con 401', async () => {
      const promise = firstValueFrom(service.login('paciente@test.com', '123456'));
      httpMock.expectOne('http://localhost:8080/api/auth/login')
        .flush({ detail: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('http://localhost:8080/api/auth/login-paciente')
        .flush(mockLoginResponse('PACIENTE', 'paciente@test.com'));
      const user = await promise;
      expect(user.rol).toBe(UserRole.PACIENTE);
    });

    it('debe emitir error si ambos endpoints fallan', async () => {
      const promise = firstValueFrom(service.login('noexiste@test.com', 'wrong'));
      httpMock.expectOne('http://localhost:8080/api/auth/login')
        .flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('http://localhost:8080/api/auth/login-paciente')
        .flush({}, { status: 401, statusText: 'Unauthorized' });
      await expect(promise).rejects.toBeDefined();
      expect(service.currentUser()).toBeNull();
    });

    it('debe guardar token en localStorage tras login exitoso', async () => {
      const promise = firstValueFrom(service.login('admin@dental.com', '123456'));
      httpMock.expectOne('http://localhost:8080/api/auth/login')
        .flush(mockLoginResponse('ADMINISTRADOR', 'admin@dental.com'));
      await promise;
      expect(localStorage.getItem('dental_pro_token')).not.toBeNull();
    });
  });

  describe('logout', () => {
    it('debe limpiar usuario y token', () => {
      localStorage.setItem('dental_pro_token', makeToken('ADMINISTRADOR'));
      localStorage.setItem('dental_pro_user', JSON.stringify({ id: 1, nombreCompleto: 'Test', email: 'a@b.com', rol: 'ADMINISTRADOR' }));

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('dental_pro_token')).toBeNull();
    });

    it('debe redirigir a /login', () => {
      service.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken', () => {
    it('debe retornar null si no hay token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('debe retornar el token almacenado', () => {
      const token = makeToken('ADMINISTRADOR');
      localStorage.setItem('dental_pro_token', token);
      expect(service.getToken()).toBe(token);
    });
  });

  describe('getUserRole', () => {
    it('debe retornar null si no hay token', () => {
      expect(service.getUserRole()).toBeNull();
    });

    it('debe retornar el rol del token almacenado', () => {
      localStorage.setItem('dental_pro_token', makeToken('ADMINISTRADOR'));
      expect(service.getUserRole()).toBe(UserRole.ADMINISTRADOR);
    });
  });

  describe('isTokenExpired', () => {
    it('debe retornar true si no hay token', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('debe retornar false para un token vigente', () => {
      localStorage.setItem('dental_pro_token', makeToken('ADMINISTRADOR'));
      expect(service.isTokenExpired()).toBe(false);
    });

    it('debe retornar true para un token expirado', () => {
      localStorage.setItem('dental_pro_token', makeToken('ADMINISTRADOR', -100));
      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('debe ser false sin sesión', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('debe ser false tras logout', () => {
      localStorage.setItem('dental_pro_token', makeToken('ADMINISTRADOR'));
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
