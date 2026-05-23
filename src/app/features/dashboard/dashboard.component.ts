import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, CitaDashboard, OdontologoConReportes, ReporteResumen } from './dashboard.service';
import { EstadoCita } from '../citas/models/cita.model';
import { UserRole } from '../../core/models/user.model';
import { AdminChartsComponent } from './components/admin-charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminChartsComponent],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Bienvenido, {{ nombreUsuario() }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ fechaActual() }}</p>
      </div>

      <!-- Metric Cards -->
      <div [class]="gridClass()">

        <!-- Total Pacientes (solo Admin y Recepcionista) -->
        @if (!esOdontologo()) {
          <div class="bg-gray-900 border border-gray-700 rounded-xl p-5 border-l-4 border-l-blue-500">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ totalPacientes() }}</p>
                <p class="text-sm text-gray-400">Total Pacientes</p>
              </div>
            </div>
          </div>
        }

        <!-- Citas del Día -->
        <div class="bg-gray-900 border border-gray-700 rounded-xl p-5 border-l-4 border-l-purple-500">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
              </svg>
            </div>
            <div>
              <p class="text-3xl font-bold text-white">{{ citasDelDia() }}</p>
              <p class="text-sm text-gray-400">{{ esOdontologo() ? 'Mis Citas del Día' : 'Citas del Día' }}</p>
            </div>
          </div>
        </div>

        <!-- Citas Pendientes -->
        <div class="bg-gray-900 border border-gray-700 rounded-xl p-5 border-l-4 border-l-yellow-500">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-3xl font-bold text-white">{{ citasPendientes() }}</p>
              <p class="text-sm text-gray-400">Pendientes</p>
            </div>
          </div>
        </div>

        <!-- Atenciones Realizadas -->
        <div class="bg-gray-900 border border-gray-700 rounded-xl p-5 border-l-4 border-l-green-500">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-3xl font-bold text-white">{{ atencionesRealizadas() }}</p>
              <p class="text-sm text-gray-400">Atendidas</p>
            </div>
          </div>
        </div>

        <!-- Canceladas (Odontólogo y Recepcionista) -->
        @if (esOdontologo() || esRecepcionista()) {
          <div class="bg-gray-900 border border-gray-700 rounded-xl p-5 border-l-4 border-l-red-500">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">{{ citasCanceladas() }}</p>
                <p class="text-sm text-gray-400">Canceladas</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div>
        <h2 class="text-lg font-semibold text-white mb-4">Acciones Rápidas</h2>
        <div class="flex flex-wrap gap-3">
          <button
            (click)="navigateTo('/intranet/citas/nueva')"
            class="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Nueva Cita
          </button>
          @if (!esOdontologo()) {
            <button
              (click)="navigateTo('/intranet/pacientes/nuevo')"
              class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/>
              </svg>
              Nuevo Paciente
            </button>
          }
          <button
            (click)="navigateTo('/intranet/citas')"
            class="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Ver Citas del Día
          </button>
          @if (esOdontologo()) {
            <button
              (click)="navigateTo('/intranet/atencion')"
              class="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
              </svg>
              Registrar Atención
            </button>
          }
        </div>
      </div>

      <!-- Citas del Día -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">
            {{ esOdontologo() ? 'Mi Agenda de Hoy' : 'Agenda del Día' }}
          </h2>
          @if (hayMasCitas()) {
            <button
              (click)="navigateTo('/intranet/citas')"
              class="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ver todas ({{ citasDelDia() }})
            </button>
          }
        </div>
        @if (isLoading()) {
          <p class="text-gray-500 text-sm">Cargando citas...</p>
        } @else if (ultimasCitas().length === 0) {
          <p class="text-gray-500 text-sm">No hay citas registradas para hoy.</p>
        } @else {
          <div class="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div class="divide-y divide-gray-800">
              @for (cita of ultimasCitas(); track cita.id) {
                <div class="flex items-center justify-between px-5 py-4">
                  <div class="flex items-center gap-4 min-w-0">
                    <span class="text-sm font-mono text-gray-300 w-14 shrink-0">{{ cita.hora }}</span>
                    <div class="min-w-0">
                      <p class="text-sm text-white truncate">{{ cita.pacienteNombre }}</p>
                      @if (!esOdontologo() && cita.odontologoNombre) {
                        <p class="text-xs text-gray-500 truncate">Dr. {{ cita.odontologoNombre }}</p>
                      }
                    </div>
                  </div>
                  <div class="flex items-center gap-3 shrink-0">
                    <span
                      class="text-xs font-medium px-2.5 py-1 rounded-full"
                      [class]="getBadgeClass(cita.estado)"
                    >
                      {{ cita.estado }}
                    </span>
                    @if ((esOdontologo() || esRecepcionista()) && cita.estado === 'PENDIENTE') {
                      <button
                        (click)="navigateTo('/intranet/citas')"
                        class="text-xs text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap"
                      >
                        Gestionar
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Gráficos (solo Administrador) -->
      @if (esAdmin()) {
        <div>
          <div class="flex items-center gap-3 mb-5">
            <h2 class="text-lg font-semibold text-white">Estadísticas del Sistema</h2>
            <span class="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
              Tiempo real
            </span>
          </div>
          <app-admin-charts />
        </div>
      }

      <!-- Mis Reportes (solo Odontólogo) -->
      @if (esOdontologo()) {
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">Mis Reportes</h2>
            <button
              (click)="navigateTo('/intranet/reportes')"
              class="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ver todos
            </button>
          </div>
          @if (isLoadingMisReportes()) {
            <p class="text-gray-500 text-sm">Cargando reportes...</p>
          } @else if (misReportes().length === 0) {
            <p class="text-gray-500 text-sm">No tienes reportes registrados aún.</p>
          } @else {
            <div class="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div class="divide-y divide-gray-800">
                @for (reporte of misReportes().slice(0, 8); track reporte.id) {
                  <div class="px-5 py-3">
                    <div class="flex items-start justify-between gap-4">
                      <div class="min-w-0">
                        <p class="text-sm text-white truncate">{{ reporte.pacienteNombre }}</p>
                        <p class="text-xs text-gray-400 truncate mt-0.5">{{ reporte.diagnostico }}</p>
                        <p class="text-xs text-blue-400/70 truncate">{{ reporte.tratamiento }}</p>
                      </div>
                      <span class="text-xs text-gray-500 shrink-0">{{ reporte.fecha }}</span>
                    </div>
                  </div>
                }
              </div>
              @if (misReportes().length > 8) {
                <div class="px-5 py-3 border-t border-gray-800 text-center">
                  <span class="text-xs text-gray-500">+ {{ misReportes().length - 8 }} reporte(s) más</span>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Reportes por Odontólogo (solo Recepcionista) -->
      @if (esRecepcionista()) {
        <div>
          <h2 class="text-lg font-semibold text-white mb-4">Reportes por Odontólogo</h2>
          @if (isLoadingReportes()) {
            <p class="text-gray-500 text-sm">Cargando reportes...</p>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (odontologo of reportesOdontologos(); track odontologo.id) {
                <div class="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col">
                  <!-- Cabecera del odontólogo -->
                  <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
                    <div class="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-semibold text-white truncate">Dr. {{ odontologo.nombre }}</p>
                      <p class="text-xs text-gray-400">
                        {{ odontologo.reportes.length }} reporte{{ odontologo.reportes.length !== 1 ? 's' : '' }}
                      </p>
                    </div>
                    <span
                      class="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                      [class]="odontologo.reportes.length > 0 ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'"
                    >
                      {{ odontologo.reportes.length > 0 ? 'Activo' : 'Sin reportes' }}
                    </span>
                  </div>

                  <!-- Lista de reportes -->
                  @if (odontologo.reportes.length === 0) {
                    <div class="flex-1 flex items-center justify-center py-8 px-5">
                      <div class="text-center">
                        <svg class="w-8 h-8 text-gray-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                        </svg>
                        <p class="text-sm text-gray-500">Sin reportes registrados</p>
                      </div>
                    </div>
                  } @else {
                    <div class="divide-y divide-gray-800 overflow-y-auto max-h-64">
                      @for (reporte of odontologo.reportes.slice(0, 6); track reporte.id) {
                        <div class="px-5 py-3">
                          <div class="flex items-start justify-between gap-2">
                            <p class="text-sm text-white truncate">{{ reporte.pacienteNombre }}</p>
                            <span class="text-xs text-gray-500 shrink-0">{{ reporte.fecha }}</span>
                          </div>
                          <p class="text-xs text-gray-400 truncate mt-0.5">{{ reporte.diagnostico }}</p>
                          <p class="text-xs text-blue-400/70 truncate">{{ reporte.tratamiento }}</p>
                        </div>
                      }
                    </div>
                    @if (odontologo.reportes.length > 6) {
                      <div class="px-5 py-3 border-t border-gray-800 text-center">
                        <span class="text-xs text-gray-500">
                          + {{ odontologo.reportes.length - 6 }} reporte(s) más
                        </span>
                      </div>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  private readonly hoy = new Date().toISOString().split('T')[0];

  readonly isLoading = signal(true);
  readonly isLoadingReportes = signal(true);
  readonly isLoadingMisReportes = signal(true);
  private readonly citasHoy = signal<CitaDashboard[]>([]);

  readonly totalPacientes = signal(0);
  readonly reportesOdontologos = signal<OdontologoConReportes[]>([]);
  readonly misReportes = signal<ReporteResumen[]>([]);

  readonly esOdontologo = computed(() =>
    this.authService.currentUser()?.rol === UserRole.ODONTOLOGO
  );
  readonly esRecepcionista = computed(() =>
    this.authService.currentUser()?.rol === UserRole.RECEPCIONISTA
  );
  readonly esAdmin = computed(() =>
    this.authService.currentUser()?.rol === UserRole.ADMINISTRADOR
  );

  readonly citasDelDia = computed(() => this.citasHoy().length);
  readonly citasPendientes = computed(() =>
    this.citasHoy().filter(c => c.estado === EstadoCita.PENDIENTE || c.estado === EstadoCita.REAGENDADO).length
  );
  readonly atencionesRealizadas = computed(() =>
    this.citasHoy().filter(c => c.estado === EstadoCita.ATENDIDO).length
  );
  readonly citasCanceladas = computed(() =>
    this.citasHoy().filter(c => c.estado === EstadoCita.CANCELADO).length
  );
  readonly ultimasCitas = computed(() =>
    [...this.citasHoy()].sort((a, b) => a.hora.localeCompare(b.hora)).slice(0, 10)
  );
  readonly hayMasCitas = computed(() => this.citasHoy().length > 10);

  readonly gridClass = computed(() => {
    const cols = this.esRecepcionista() ? 'lg:grid-cols-5' : 'lg:grid-cols-4';
    const pulse = this.isLoading() ? 'animate-pulse' : '';
    return `grid grid-cols-1 sm:grid-cols-2 ${cols} gap-5 ${pulse}`.trim();
  });

  readonly nombreUsuario = computed(() => this.authService.currentUser()?.nombreCompleto ?? 'Usuario');

  readonly fechaActual = computed(() =>
    new Date().toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase())
  );

  ngOnInit(): void {
    const user = this.authService.currentUser();
    const odontologoId = user?.rol === UserRole.ODONTOLOGO ? user.id : undefined;

    this.dashboardService.cargar(this.hoy, odontologoId).subscribe({
      next: (data) => {
        this.totalPacientes.set(data.totalPacientes);
        this.citasHoy.set(data.citas);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    if (user?.rol === UserRole.RECEPCIONISTA) {
      this.dashboardService.cargarReportesOdontologos().subscribe({
        next: (data) => {
          this.reportesOdontologos.set(data);
          this.isLoadingReportes.set(false);
        },
        error: () => this.isLoadingReportes.set(false)
      });
    }

    if (user?.rol === UserRole.ODONTOLOGO && user.nombreCompleto) {
      this.dashboardService.cargarMisReportes(user.nombreCompleto).subscribe({
        next: (data) => {
          this.misReportes.set(data);
          this.isLoadingMisReportes.set(false);
        },
        error: () => this.isLoadingMisReportes.set(false)
      });
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return 'bg-yellow-500/20 text-yellow-300';
      case EstadoCita.ATENDIDO:
        return 'bg-green-500/20 text-green-300';
      case EstadoCita.CANCELADO:
        return 'bg-red-500/20 text-red-300';
      case EstadoCita.REAGENDADO:
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  }
}
