import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PacienteService } from '../pacientes/services/paciente.service';
import { CitaService } from '../citas/services/cita.service';
import { AtencionService } from '../atencion/services/atencion.service';
import { EstadoCita } from '../citas/models/cita.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Bienvenido, {{ nombreUsuario() }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ fechaActual() }}</p>
      </div>

      <!-- Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Total Pacientes -->
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
              <p class="text-sm text-gray-400">Citas del Día</p>
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
              <p class="text-sm text-gray-400">Citas Pendientes</p>
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
              <p class="text-sm text-gray-400">Atenciones Realizadas</p>
            </div>
          </div>
        </div>
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
          <button
            (click)="navigateTo('/intranet/pacientes/nuevo')"
            class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/>
            </svg>
            Nuevo Paciente
          </button>
          <button
            (click)="navigateTo('/intranet/citas')"
            class="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Ver Citas del Día
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div>
        <h2 class="text-lg font-semibold text-white mb-4">Últimas Citas del Día</h2>
        @if (ultimasCitas().length === 0) {
          <p class="text-gray-500 text-sm">No hay citas registradas para hoy.</p>
        } @else {
          <div class="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div class="divide-y divide-gray-800">
              @for (cita of ultimasCitas(); track cita.id) {
                <div class="flex items-center justify-between px-5 py-4">
                  <div class="flex items-center gap-4">
                    <span class="text-sm font-mono text-gray-300 w-14 shrink-0">{{ cita.hora }}</span>
                    <span class="text-sm text-white">{{ cita.pacienteNombre }}</span>
                  </div>
                  <span
                    class="text-xs font-medium px-2.5 py-1 rounded-full"
                    [class]="getBadgeClass(cita.estado)"
                  >
                    {{ cita.estado }}
                  </span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly pacienteService = inject(PacienteService);
  private readonly citaService = inject(CitaService);
  private readonly atencionService = inject(AtencionService);
  private readonly router = inject(Router);

  private readonly hoy = new Date().toISOString().split('T')[0];

  readonly nombreUsuario = computed(() => {
    const user = this.authService.currentUser();
    return user?.nombreCompleto ?? 'Usuario';
  });

  readonly fechaActual = computed(() => {
    const fecha = new Date();
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
  });

  readonly totalPacientes = computed(() => {
    return this.pacienteService.listar().length;
  });

  readonly citasDelDia = computed(() => {
    return this.citaService.listarPorFecha(this.hoy).length;
  });

  readonly citasPendientes = computed(() => {
    return this.citaService.listarPorFecha(this.hoy)
      .filter(c => c.estado === EstadoCita.PENDIENTE || c.estado === EstadoCita.REAGENDADO)
      .length;
  });

  readonly atencionesRealizadas = computed(() => {
    return this.atencionService.listarNotasClinicas().length;
  });

  readonly ultimasCitas = computed(() => {
    return this.citaService.listarPorFecha(this.hoy).slice(0, 5);
  });

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
