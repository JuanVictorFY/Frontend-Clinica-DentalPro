import { Component, inject, signal, computed, effect, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserRole } from '../../core/models/user.model';
import { PacienteService } from '../../features/pacientes/services/paciente.service';
import { CitaService } from '../../features/citas/services/cita.service';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  allowedRoles: UserRole[];
}

interface SearchResult {
  id: string;
  type: 'paciente' | 'cita';
  title: string;
  subtitle: string;
  route: string[];
}

interface Breadcrumb {
  label: string;
  path: string;
}

@Component({
  selector: 'app-intranet-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <!-- Mobile/Tablet overlay -->
    @if (sidebarOpen()) {
      <div
        class="fixed inset-0 bg-black/60 z-40 xl:hidden"
        (click)="closeSidebar()"
      ></div>
    }

    <div class="min-h-screen flex" [class]="themeService.isDark() ? 'bg-gray-950' : 'bg-slate-100'">
      <!-- Sidebar -->
      <aside
        class="fixed xl:static inset-y-0 left-0 z-50 w-64 border-r flex flex-col transition-transform duration-300 xl:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
        [class]="themeService.isDark() ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center gap-3 px-6 border-b" [class]="themeService.isDark() ? 'border-gray-800' : 'border-gray-200'">
          <svg class="w-8 h-8 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
          </svg>
          <span class="text-lg font-black tracking-tighter uppercase" [class]="themeService.isDark() ? 'text-white' : 'text-gray-900'">Dental<span class="text-blue-400">Pro</span></span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          @for (item of visibleNavItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-blue-600/20 text-blue-400 border-blue-500/50"
              [routerLinkActiveOptions]="{ exact: false }"
              (click)="onNavClick()"
              class="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent transition-all duration-200 group"
              [class]="themeService.isDark() ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            >
              <span class="w-5 h-5 shrink-0" [innerHTML]="item.icon"></span>
              <span class="text-sm font-medium">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- User info at bottom -->
        <div class="p-4 border-t" [class]="themeService.isDark() ? 'border-gray-800' : 'border-gray-200'">
          @if (currentUser()) {
            <div class="flex items-center gap-3 px-3 py-2">
              <div class="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center shrink-0">
                <span class="text-xs font-bold text-blue-300">{{ userInitials() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate" [class]="themeService.isDark() ? 'text-white' : 'text-gray-900'">{{ currentUser()?.nombreCompleto }}</p>
                <p class="text-xs truncate" [class]="themeService.isDark() ? 'text-gray-500' : 'text-gray-500'">{{ currentUser()?.rol }}</p>
              </div>
            </div>
            <button
              (click)="logout()"
              class="mt-2 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
              </svg>
              Cerrar sesión
            </button>
          }
        </div>
      </aside>

      <!-- Main content area -->
      <div class="flex-1 flex flex-col min-h-screen">
        <!-- Top header -->
        <header class="h-16 backdrop-blur-sm border-b flex items-center justify-between px-6 sticky top-0 z-30"
          [class]="themeService.isDark() ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'"
        >
          <div class="flex items-center gap-4">
            <!-- Sidebar toggle (mobile + tablet) -->
            <button
              (click)="sidebarOpen.update(v => !v)"
              class="xl:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
              </svg>
            </button>
            <!-- Breadcrumbs -->
            <nav class="hidden sm:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              @for (crumb of breadcrumbs(); track crumb.path; let last = $last) {
                @if (!last) {
                  <a
                    [routerLink]="crumb.path"
                    class="transition-colors"
                    [class]="themeService.isDark() ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'"
                  >{{ crumb.label }}</a>
                  <svg class="w-3.5 h-3.5" [class]="themeService.isDark() ? 'text-gray-600' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                  </svg>
                } @else {
                  <span class="font-medium" [class]="themeService.isDark() ? 'text-white' : 'text-gray-900'">{{ crumb.label }}</span>
                }
              }
            </nav>
          </div>

          <!-- Buscador global -->
          <div class="relative flex-1 max-w-md mx-4 hidden md:block">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar pacientes, citas..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                (focus)="searchFocused.set(true)"
                class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              @if (searchQuery()) {
                <button
                  (click)="clearSearch()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>

            <!-- Resultados de búsqueda -->
            @if (searchFocused() && searchQuery().length >= 2) {
              <div class="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                @if (searchResults().length === 0) {
                  <div class="px-4 py-6 text-center text-gray-500 text-sm">
                    No se encontraron resultados
                  </div>
                } @else {
                  @for (result of searchResults(); track result.id) {
                    <button
                      (click)="navigateToResult(result)"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/60 transition-colors text-left cursor-pointer"
                    >
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        [class.bg-blue-500/20]="result.type === 'paciente'"
                        [class.bg-purple-500/20]="result.type === 'cita'"
                      >
                        @if (result.type === 'paciente') {
                          <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                          </svg>
                        } @else {
                          <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
                          </svg>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm text-white truncate">{{ result.title }}</p>
                        <p class="text-xs text-gray-400 truncate">{{ result.subtitle }}</p>
                      </div>
                      <span class="text-xs text-gray-500 shrink-0 px-2 py-0.5 rounded bg-gray-700">{{ result.type === 'paciente' ? 'Paciente' : 'Cita' }}</span>
                    </button>
                  }
                }
              </div>
            }
          </div>

          <div class="flex items-center gap-3">
            <!-- Search toggle mobile -->
            <button
              (click)="mobileSearchOpen.update(v => !v)"
              class="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer dark:text-gray-400 dark:hover:text-white"
              aria-label="Buscar"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
              </svg>
            </button>

            <!-- Theme toggle -->
            <button
              (click)="toggleTheme()"
              class="p-2 rounded-lg transition-colors cursor-pointer"
              [class]="themeService.isDark() ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-gray-600 hover:bg-gray-200'"
              [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              @if (themeService.isDark()) {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
                </svg>
              }
            </button>

            <!-- Notification bell -->
            <button class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- User avatar -->
            <div class="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
              <span class="text-xs font-bold text-blue-300">{{ userInitials() }}</span>
            </div>
          </div>
        </header>

        <!-- Mobile search bar -->
        @if (mobileSearchOpen()) {
          <div class="md:hidden px-4 py-3 bg-gray-900 border-b border-gray-800 relative">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar pacientes, citas..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                (focus)="searchFocused.set(true)"
                class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            @if (searchFocused() && searchQuery().length >= 2) {
              <div class="absolute left-4 right-4 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                @if (searchResults().length === 0) {
                  <div class="px-4 py-6 text-center text-gray-500 text-sm">
                    No se encontraron resultados
                  </div>
                } @else {
                  @for (result of searchResults(); track result.id) {
                    <button
                      (click)="navigateToResult(result)"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/60 transition-colors text-left cursor-pointer"
                    >
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        [class.bg-blue-500/20]="result.type === 'paciente'"
                        [class.bg-purple-500/20]="result.type === 'cita'"
                      >
                        @if (result.type === 'paciente') {
                          <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
                          </svg>
                        } @else {
                          <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
                          </svg>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm text-white truncate">{{ result.title }}</p>
                        <p class="text-xs text-gray-400 truncate">{{ result.subtitle }}</p>
                      </div>
                    </button>
                  }
                }
              </div>
            }
          </div>
        }

        <!-- Page content -->
        <main
          class="flex-1 p-6 transition-all duration-200 ease-out"
          [class.opacity-0]="pageAnimating()"
          [class.translate-y-2]="pageAnimating()"
          [class.opacity-100]="!pageAnimating()"
          [class.translate-y-0]="!pageAnimating()"
        >
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class IntranetLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly pacienteService = inject(PacienteService);
  private readonly citaService = inject(CitaService);
  readonly themeService = inject(ThemeService);

  readonly sidebarOpen = signal(false);
  readonly searchQuery = signal('');
  readonly searchFocused = signal(false);
  readonly mobileSearchOpen = signal(false);
  readonly searchResults = signal<SearchResult[]>([]);
  readonly pageAnimating = signal(false);
  readonly breadcrumbs = signal<Breadcrumb[]>([{ label: 'Dashboard', path: '/intranet/dashboard' }]);
  readonly currentUser = this.authService.currentUser;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.searchFocused.set(false);
    }
  }

  constructor() {
    // Fade out on navigation start
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.pageAnimating.set(true);
    });

    // Fade in on navigation end + close sidebar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (typeof window !== 'undefined' && window.innerWidth < 1280) {
        this.sidebarOpen.set(false);
      }
      this.clearSearch();
      this.mobileSearchOpen.set(false);
      this.buildBreadcrumbs((event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url);

      // Small delay to let the new view render, then fade in
      setTimeout(() => this.pageAnimating.set(false), 50);
    });
  }

  private readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/intranet/dashboard',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"/></svg>',
      allowedRoles: [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ODONTOLOGO]
    },
    {
      label: 'Pacientes',
      path: '/intranet/pacientes',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>',
      allowedRoles: [UserRole.ADMIN, UserRole.RECEPCIONISTA]
    },
    {
      label: 'Citas',
      path: '/intranet/citas',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>',
      allowedRoles: [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ODONTOLOGO]
    },
    {
      label: 'Atención',
      path: '/intranet/atencion',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.47 4.41a2.25 2.25 0 01-2.133 1.59H8.603a2.25 2.25 0 01-2.134-1.59L5 14.5m14 0H5"/></svg>',
      allowedRoles: [UserRole.ADMIN, UserRole.ODONTOLOGO]
    },
    {
      label: 'Usuarios',
      path: '/intranet/usuarios',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
      allowedRoles: [UserRole.ADMIN]
    },
    {
      label: 'Reportes',
      path: '/intranet/reportes',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>',
      allowedRoles: [UserRole.ADMIN, UserRole.ODONTOLOGO]
    }
  ];

  readonly visibleNavItems = computed(() => {
    const role = this.currentUser()?.rol;
    if (!role) return [];

    if (role === UserRole.ADMIN) {
      return this.navItems;
    }

    return this.navItems.filter(item => item.allowedRoles.includes(role));
  });

  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    const parts = user.nombreCompleto.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  });

  logout(): void {
    this.authService.logout();
  }

  /** Cierra el sidebar en pantallas menores a xl */
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  /** Al hacer clic en un enlace de navegación, cerrar sidebar en móvil/tablet */
  onNavClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      this.sidebarOpen.set(false);
    }
  }

  /** Alterna entre modo claro y oscuro */
  toggleTheme(): void {
    this.themeService.toggle();
  }

  /** Maneja el input de búsqueda global */
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchQuery.set(query);
    this.searchFocused.set(true);

    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.performSearch(query);
  }

  /** Limpia la búsqueda */
  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchFocused.set(false);
  }

  /** Navega al resultado seleccionado */
  navigateToResult(result: SearchResult): void {
    this.clearSearch();
    this.mobileSearchOpen.set(false);
    this.router.navigate(result.route);
  }

  private readonly segmentLabels: Record<string, string> = {
    'intranet': 'Inicio',
    'dashboard': 'Dashboard',
    'pacientes': 'Pacientes',
    'citas': 'Citas',
    'atencion': 'Atención',
    'usuarios': 'Usuarios',
    'reportes': 'Reportes',
    'nuevo': 'Nuevo',
    'nueva': 'Nueva',
    'editar': 'Editar',
    'acceso-denegado': 'Acceso Denegado'
  };

  /** Construye los breadcrumbs a partir de la URL actual */
  private buildBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(s => s.length > 0);
    const crumbs: Breadcrumb[] = [];
    let path = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      path += '/' + segment;

      // Skip 'intranet' as first crumb, start from the module
      if (segment === 'intranet') continue;

      const label = this.segmentLabels[segment];

      if (label) {
        crumbs.push({ label, path });
      } else if (!isNaN(Number(segment))) {
        // Es un ID numérico - intentar resolver nombre
        const prevSegment = segments[i - 1];
        const id = Number(segment);
        let resolvedLabel = `#${id}`;

        if (prevSegment === 'pacientes' || prevSegment === 'editar') {
          const paciente = this.pacienteService.obtenerPorId(id);
          if (paciente) resolvedLabel = paciente.nombreCompleto;
        } else if (prevSegment === 'reportes') {
          resolvedLabel = `Reporte #${id}`;
        }

        crumbs.push({ label: resolvedLabel, path });
      } else {
        // Segmento desconocido - capitalizar
        crumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1), path });
      }
    }

    // Si no hay crumbs, mostrar Dashboard
    if (crumbs.length === 0) {
      crumbs.push({ label: 'Dashboard', path: '/intranet/dashboard' });
    }

    this.breadcrumbs.set(crumbs);
  }

  /** Ejecuta la búsqueda en pacientes y citas */
  private performSearch(query: string): void {
    const results: SearchResult[] = [];
    const term = query.toLowerCase().trim();

    // Buscar en pacientes
    const pacientes = this.pacienteService.buscar(term).slice(0, 5);
    for (const p of pacientes) {
      results.push({
        id: `paciente-${p.id}`,
        type: 'paciente',
        title: p.nombreCompleto,
        subtitle: `DNI: ${p.dni} - ${p.email}`,
        route: ['/intranet/pacientes', String(p.id)]
      });
    }

    // Buscar en citas del día (por nombre de paciente)
    const hoy = new Date().toISOString().split('T')[0];
    const citas = this.citaService.listarPorFecha(hoy)
      .filter(c => c.pacienteNombre.toLowerCase().includes(term) || c.odontologoNombre.toLowerCase().includes(term) || c.motivo.toLowerCase().includes(term))
      .slice(0, 5);
    for (const c of citas) {
      results.push({
        id: `cita-${c.id}`,
        type: 'cita',
        title: `${c.pacienteNombre} - ${c.hora}`,
        subtitle: `${c.odontologoNombre} | ${c.motivo}`,
        route: ['/intranet/citas']
      });
    }

    this.searchResults.set(results);
  }
}
