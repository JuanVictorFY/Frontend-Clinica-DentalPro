import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

describe('authGuard', () => {
  let authServiceMock: { getToken: ReturnType<typeof vi.fn>; isTokenExpired: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let notificationServiceMock: { showWarning: ReturnType<typeof vi.fn> };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/intranet' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(),
      isTokenExpired: vi.fn(),
      logout: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    notificationServiceMock = {
      showWarning: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
  });

  it('should allow access when token exists and is not expired', () => {
    authServiceMock.getToken.mockReturnValue('valid.jwt.token');
    authServiceMock.isTokenExpired.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(notificationServiceMock.showWarning).not.toHaveBeenCalled();
  });

  it('should redirect to /login when token is absent', () => {
    authServiceMock.getToken.mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(notificationServiceMock.showWarning).not.toHaveBeenCalled();
  });

  it('should logout, show warning and redirect when token is expired', () => {
    authServiceMock.getToken.mockReturnValue('expired.jwt.token');
    authServiceMock.isTokenExpired.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(notificationServiceMock.showWarning).toHaveBeenCalledWith(
      'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
    );
  });

  it('should logout, show warning and redirect when token is malformed', () => {
    authServiceMock.getToken.mockReturnValue('malformed-token');
    authServiceMock.isTokenExpired.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(false);
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(notificationServiceMock.showWarning).toHaveBeenCalledWith(
      'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
    );
  });
});
