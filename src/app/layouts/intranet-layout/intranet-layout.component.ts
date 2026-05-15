import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-intranet-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-md flex flex-col">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-xl font-bold text-blue-600">DentalPro</h1>
          <p class="text-xs text-gray-500 mt-1">Sistema de Gestión</p>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Navegación principal">
          @for (item of visibleNavItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="text-lg" aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- User info & Logout -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-sm font-semibold text-blue-600">
                {{ userInitial() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ userName() }}</p>
              <p class="text-xs text-gray-500 truncate">{{ userRoleLabel() }}</p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }
  `
})
export class IntranetLayoutComponent {
  private readonly authService = inject(AuthService);

  private readonly navItems: NavItem[] = [
    {
      label: 'Pacientes',
      path: '/intranet/pacientes',
      icon: '👥',
      roles: [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA]
    },
    {
      label: 'Citas',
      path: '/intranet/citas',
      icon: '📅',
      roles: [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA, UserRole.ODONTOLOGO]
    },
    {
      label: 'Atención',
      path: '/intranet/atencion',
      icon: '🦷',
      roles: [UserRole.ADMINISTRADOR, UserRole.ODONTOLOGO]
    },
    {
      label: 'Usuarios',
      path: '/intranet/usuarios',
      icon: '⚙️',
      roles: [UserRole.ADMINISTRADOR]
    },
    {
      label: 'Reportes',
      path: '/intranet/reportes',
      icon: '📊',
      roles: [UserRole.ADMINISTRADOR, UserRole.ODONTOLOGO]
    }
  ];

  visibleNavItems = computed(() => {
    const role = this.authService.getUserRole();
    if (!role) return [];
    if (role === UserRole.ADMINISTRADOR) return this.navItems;
    return this.navItems.filter(item => item.roles.includes(role));
  });

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.nombreCompleto ?? 'Usuario';
  });

  userInitial = computed(() => {
    const name = this.userName();
    return name.charAt(0).toUpperCase();
  });

  userRoleLabel = computed(() => {
    const role = this.authService.getUserRole();
    switch (role) {
      case UserRole.ADMINISTRADOR: return 'Administrador';
      case UserRole.RECEPCIONISTA: return 'Recepcionista';
      case UserRole.ODONTOLOGO: return 'Odontólogo';
      default: return '';
    }
  });

  logout(): void {
    this.authService.logout();
  }
}
