import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guard funcional de autenticación.
 * Verifica la existencia y validez del token JWT antes de permitir
 * el acceso a rutas protegidas.
 *
 * - Si el token no existe: redirige a /login.
 * - Si el token está expirado o malformado: elimina el token,
 *   muestra mensaje de sesión expirada y redirige a /login.
 *
 * Validates: Requirements 2.1, 2.3, 2.4
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const token = authService.getToken();

  // Token ausente: redirigir a login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Token expirado o malformado: eliminar, notificar y redirigir
  if (authService.isTokenExpired()) {
    authService.logout();
    notificationService.showWarning('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    return false;
  }

  // Token válido: permitir acceso
  return true;
};
