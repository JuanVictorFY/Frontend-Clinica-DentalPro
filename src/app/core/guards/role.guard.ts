import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard funcional que controla el acceso a rutas según el rol del usuario.
 *
 * Lee los roles permitidos desde `route.data['roles']` y verifica que el rol
 * del usuario autenticado esté incluido. Si no tiene permiso, redirige a
 * `/acceso-denegado`.
 *
 * Permisos por rol:
 * - Administrador: acceso a todos los módulos
 * - Recepcionista: pacientes y citas
 * - Odontólogo: atención y reportes
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();

  // Si no hay rol (usuario no autenticado), redirigir a acceso denegado
  if (!userRole) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  // Administrador tiene acceso a todo
  if (userRole === UserRole.ADMINISTRADOR) {
    return true;
  }

  // Obtener roles permitidos desde la configuración de la ruta
  const allowedRoles: UserRole[] = route.data?.['roles'] ?? [];

  // Verificar si el rol del usuario está en la lista de roles permitidos
  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Rol no permitido: redirigir a página de acceso denegado
  router.navigate(['/acceso-denegado']);
  return false;
};
