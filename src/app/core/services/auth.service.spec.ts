import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('debe autenticar con credenciales validas de admin', () => {
      const result = service.login('admin@dental.com', '123456');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(service.currentUser()).not.toBeNull();
      expect(service.currentUser()?.rol).toBe(UserRole.ADMIN);
      expect(service.currentUser()?.email).toBe('admin@dental.com');
    });

    it('debe autenticar con credenciales validas de recepcionista', () => {
      const result = service.login('recepcion@dental.com', '123456');

      expect(result.success).toBe(true);
      expect(service.currentUser()?.rol).toBe(UserRole.RECEPCIONISTA);
    });

    it('debe autenticar con credenciales validas de odontologo', () => {
      const result = service.login('doctor@dental.com', '123456');

      expect(result.success).toBe(true);
      expect(service.currentUser()?.rol).toBe(UserRole.ODONTOLOGO);
    });

    it('debe fallar con email inexistente', () => {
      const result = service.login('noexiste@dental.com', '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(service.currentUser()).toBeNull();
    });

    it('debe fallar con contrasena incorrecta', () => {
      const result = service.login('admin@dental.com', 'wrongpass');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(service.currentUser()).toBeNull();
    });

    it('debe ser case-insensitive para el email', () => {
      const result = service.login('ADMIN@DENTAL.COM', '123456');

      expect(result.success).toBe(true);
      expect(service.currentUser()?.email).toBe('admin@dental.com');
    });

    it('debe almacenar el token en localStorage tras login exitoso', () => {
      service.login('admin@dental.com', '123456');

      const token = localStorage.getItem('dental_pro_token');
      expect(token).not.toBeNull();
      expect(token!.split('.')).toHaveLength(3);
    });
  });

  describe('logout', () => {
    it('debe limpiar el usuario y el token', () => {
      service.login('admin@dental.com', '123456');
      expect(service.currentUser()).not.toBeNull();

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('dental_pro_token')).toBeNull();
    });

    it('debe redirigir a /login', () => {
      service.login('admin@dental.com', '123456');
      service.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken', () => {
    it('debe retornar null si no hay token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('debe retornar el token almacenado', () => {
      service.login('admin@dental.com', '123456');
      expect(service.getToken()).not.toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('debe retornar null si no hay token', () => {
      expect(service.getUserRole()).toBeNull();
    });

    it('debe retornar ADMIN para admin logueado', () => {
      service.login('admin@dental.com', '123456');
      expect(service.getUserRole()).toBe(UserRole.ADMIN);
    });

    it('debe retornar RECEPCIONISTA para recepcion logueada', () => {
      service.login('recepcion@dental.com', '123456');
      expect(service.getUserRole()).toBe(UserRole.RECEPCIONISTA);
    });

    it('debe retornar ODONTOLOGO para doctor logueado', () => {
      service.login('doctor@dental.com', '123456');
      expect(service.getUserRole()).toBe(UserRole.ODONTOLOGO);
    });
  });

  describe('isTokenExpired', () => {
    it('debe retornar true si no hay token', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('debe retornar false para un token recien generado', () => {
      service.login('admin@dental.com', '123456');
      expect(service.isTokenExpired()).toBe(false);
    });

    it('debe retornar true para un token expirado', () => {
      // Crear un token con exp en el pasado
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: 'admin@dental.com',
        rol: UserRole.ADMIN,
        iat: 1000,
        exp: 1001 // Expirado hace mucho
      }));
      const signature = btoa('fake');
      localStorage.setItem('dental_pro_token', `${header}.${payload}.${signature}`);

      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('debe ser false sin sesion', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('debe ser true tras login exitoso', () => {
      service.login('admin@dental.com', '123456');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('debe ser false tras logout', () => {
      service.login('admin@dental.com', '123456');
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
