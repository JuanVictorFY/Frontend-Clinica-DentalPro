import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[];
  const userRole = authService.getUserRole();

  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  // ADMIN always has full access
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  if (allowedRoles && allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/intranet/acceso-denegado']);
  return false;
};
