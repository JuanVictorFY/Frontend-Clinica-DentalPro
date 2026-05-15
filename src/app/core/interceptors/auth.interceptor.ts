import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, timeout, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP funcional para autenticación JWT.
 * - Inyecta el token en cada petición saliente.
 * - Maneja errores globales (401, 403, 500, timeout).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener token del localStorage
  const token = authService.getToken();

  // Clonar la petición para agregar el header de autorización
  const clonedReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(clonedReq).pipe(
    // Timeout de 30 segundos para evitar peticiones colgadas
    timeout(30000),

    catchError((error: HttpErrorResponse | Error) => {
      // Manejar timeout de RxJS (no es HttpErrorResponse)
      if (error.name === 'TimeoutError') {
        console.error('[DentalPro] La petición ha excedido el tiempo límite (30s).');
        return throwError(() => error);
      }

      // Manejar errores HTTP
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            // Token expirado o inválido: cerrar sesión y redirigir
            console.warn('[DentalPro] Sesión expirada o no autorizada. Redirigiendo al login...');
            authService.logout();
            break;

          case 403:
            // Acceso denegado: el usuario no tiene permisos
            console.warn('[DentalPro] Acceso denegado (403). No tiene permisos para este recurso.');
            break;

          case 500:
            // Error interno del servidor
            console.error('[DentalPro] Error interno del servidor (500):', error.message);
            break;

          default:
            console.error(`[DentalPro] Error HTTP ${error.status}:`, error.message);
            break;
        }
      }

      // Re-lanzar el error para que los componentes puedan manejarlo también
      return throwError(() => error);
    })
  );
};
