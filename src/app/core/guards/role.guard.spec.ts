import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

describe('roleGuard', () => {
  let authService: AuthService;
  let router: Router;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    mockState = {} as RouterStateSnapshot;
  });

  afterEach(() => {
    localStorage.clear();
  });

  function createRouteWithRoles(roles: UserRole[]): ActivatedRouteSnapshot {
    return { data: { roles } } as unknown as ActivatedRouteSnapshot;
  }

  describe('sin sesion activa', () => {
    it('debe redirigir a /login si no hay rol', () => {
      const route = createRouteWithRoles([UserRole.ADMIN]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('ADMIN - acceso total', () => {
    beforeEach(() => {
      authService.login('admin@dental.com', '123456');
    });

    it('debe permitir acceso a rutas de ADMIN', () => {
      const route = createRouteWithRoles([UserRole.ADMIN]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(true);
    });

    it('debe permitir acceso a rutas de RECEPCIONISTA', () => {
      const route = createRouteWithRoles([UserRole.RECEPCIONISTA]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(true);
    });

    it('debe permitir acceso a rutas de ODONTOLOGO', () => {
      const route = createRouteWithRoles([UserRole.ODONTOLOGO]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(true);
    });
  });

  describe('RECEPCIONISTA - acceso limitado', () => {
    beforeEach(() => {
      authService.login('recepcion@dental.com', '123456');
    });

    it('debe permitir acceso a rutas que incluyen RECEPCIONISTA', () => {
      const route = createRouteWithRoles([UserRole.ADMIN, UserRole.RECEPCIONISTA]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(true);
    });

    it('debe denegar acceso a rutas solo de ADMIN', () => {
      const route = createRouteWithRoles([UserRole.ADMIN]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/intranet/acceso-denegado']);
    });

    it('debe denegar acceso a rutas solo de ODONTOLOGO', () => {
      const route = createRouteWithRoles([UserRole.ADMIN, UserRole.ODONTOLOGO]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/intranet/acceso-denegado']);
    });
  });

  describe('ODONTOLOGO - acceso limitado', () => {
    beforeEach(() => {
      authService.login('doctor@dental.com', '123456');
    });

    it('debe permitir acceso a rutas que incluyen ODONTOLOGO', () => {
      const route = createRouteWithRoles([UserRole.ADMIN, UserRole.ODONTOLOGO]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(true);
    });

    it('debe denegar acceso a rutas solo de ADMIN', () => {
      const route = createRouteWithRoles([UserRole.ADMIN]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/intranet/acceso-denegado']);
    });

    it('debe denegar acceso a rutas solo de RECEPCIONISTA', () => {
      const route = createRouteWithRoles([UserRole.ADMIN, UserRole.RECEPCIONISTA]);

      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/intranet/acceso-denegado']);
    });
  });
});
