import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  OnDestroy
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

/**
 * Directiva estructural que muestra u oculta elementos del DOM según el rol del usuario autenticado.
 *
 * Uso en template:
 *   <div *appRoleVisible="['ADMINISTRADOR', 'RECEPCIONISTA']">
 *     Solo visible para administradores y recepcionistas
 *   </div>
 *
 * Si el rol del usuario actual está incluido en el array de roles permitidos,
 * el elemento se renderiza. De lo contrario, se elimina del DOM.
 */
@Directive({
  selector: '[appRoleVisible]',
  standalone: true
})
export class RoleVisibleDirective implements OnDestroy {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private hasView = false;

  @Input()
  set appRoleVisible(allowedRoles: (UserRole | string)[] | null | undefined) {
    const shouldShow = this.checkAccess(allowedRoles);

    if (shouldShow && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!shouldShow && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }

  private checkAccess(allowedRoles: (UserRole | string)[] | null | undefined): boolean {
    if (!allowedRoles || allowedRoles.length === 0) {
      return false;
    }

    const userRole = this.authService.getUserRole();
    if (!userRole) {
      return false;
    }

    return allowedRoles.includes(userRole);
  }
}
