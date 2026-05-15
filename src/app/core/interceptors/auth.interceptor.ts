import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, timeout } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/** Timeout en milisegundos para las peticiones HTTP. */
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Interceptor funcional HTTP que:
 * 1. Adjunta el token JWT en el header Authorization de cada petición.
 * 2. Configura un timeout de 30 segundos.
 * 3. Maneja errores globales: 401, 403, 500 y timeout.
 *
 * Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((error: HttpErrorResponse | Error) => {
      if (error.name === 'TimeoutError') {
        notificationService.showError('Tiempo de espera agotado. Intente nuevamente.');
        return throwError(() => error);
      }

      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            authService.logout();
            router.navigate(['/login'], {
              queryParams: { reason: 'session-expired' }
            });
            break;
          case 403:
            notificationService.showWarning('No tiene permisos para realizar esta acción.');
            break;
          case 500:
            notificationService.showError('Error del servidor. Intente más tarde.');
            break;
          case 0:
            notificationService.showError('Sin conexión. Verifique su red.');
            break;
        }
      }

      return throwError(() => error);
    })
  );
};
