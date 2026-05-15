import { Component, computed, inject, signal } from '@angular/core';
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
    <div class="flex h-screen bg-gray-950">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-30 flex flex-col bg-gray-900 text-white transition-all duration-300"
        [class.w-64]="!sidebarCollapsed()"
        [class.w-20]="sidebarCollapsed()"
        [class.-translate-x-full]="mobileHidden()"
        [class.translate-x-0]="!mobileHidden()"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <svg class="w-8 h-8 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
          </svg>
          @if (!sidebarCollapsed()) {
            <div>
              <h1 class="text-lg font-bold text-white">DentalPro</h1>
              <p class="text-xs text-gray-400">Sistema de Gestion</p>
            </div>
          }
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegacion principal">
          @for (item of visibleNavItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-blue-600/20 text-blue-400 border-l-2 border-blue-400"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              [class.justify-center]="sidebarCollapsed()"
              [attr.title]="sidebarCollapsed() ? item.label : null"
            >
              <span class="shrink-0" [innerHTML]="item.icon" aria-hidden="true"></span>
              @if (!sidebarCollapsed()) {
                <span>{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <!-- User info & Logout -->
        <div class="p-4 border-t border-gray-800">
          @if (!sidebarCollapsed()) {
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center">
                <span class="text-sm font-semibold text-blue-400">
                  {{ userInitial() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ userName() }}</p>
                <p class="text-xs text-gray-400 truncate">{{ userRoleLabel() }}</p>
              </div>
            </div>
          }
          <button
            (click)="logout()"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
            [attr.title]="sidebarCollapsed() ? 'Cerrar sesion' : null"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>Cerrar sesion</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main content area -->
      <div class="flex-1 flex flex-col transition-all duration-300"
        [class.ml-64]="!sidebarCollapsed() && !mobileHidden()"
        [class.ml-20]="sidebarCollapsed() && !mobileHidden()"
        [class.ml-0]="mobileHidden()"
      >
        <!-- Top Header Bar -->
        <header class="sticky top-0 z-20 bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Sidebar Toggle -->
            <button (click)="toggleSidebar()" class="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" aria-label="Toggle sidebar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
              </svg>
            </button>
            <!-- Breadcrumb area -->
            <div class="hidden sm:block">
              <p class="text-sm font-medium text-white">Panel de Administracion</p>
              <p class="text-xs text-gray-400">DentalPro Intranet</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Notification Bell -->
            <button class="relative p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" aria-label="Notificaciones">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <!-- User Avatar -->
            <div class="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
              <span class="text-sm font-semibold text-blue-400">{{ userInitial() }}</span>
            </div>
          </div>
        </header>

        <!-- Main content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile overlay -->
      @if (!mobileHidden()) {
        <div class="fixed inset-0 bg-black/50 z-20 md:hidden" (click)="closeMobileSidebar()"></div>
      }
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

  sidebarCollapsed = signal(false);
  mobileHidden = signal(true);

  private readonly navItems: NavItem[] = [
    {
      label: 'Pacientes',
      path: '/intranet/pacientes',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>',
      roles: [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA]
    },
    {
      label: 'Citas',
      path: '/intranet/citas',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>',
      roles: [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA, UserRole.ODONTOLOGO]
    },
    {
      label: 'Atencion',
      path: '/intranet/atencion',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>',
      roles: [UserRole.ADMINISTRADOR, UserRole.ODONTOLOGO]
    },
    {
      label: 'Usuarios',
      path: '/intranet/usuarios',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
      roles: [UserRole.ADMINISTRADOR]
    },
    {
      label: 'Reportes',
      path: '/intranet/reportes',
      icon: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>',
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
      case UserRole.ODONTOLOGO: return 'Odontologo';
      default: return '';
    }
  });

  toggleSidebar(): void {
    if (window.innerWidth < 768) {
      this.mobileHidden.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  closeMobileSidebar(): void {
    this.mobileHidden.set(true);
  }

  logout(): void {
    this.authService.logout();
  }
}
