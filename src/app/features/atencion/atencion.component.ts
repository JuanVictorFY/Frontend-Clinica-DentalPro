import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CitaService } from '../citas/services/cita.service';
import { Cita, EstadoCita } from '../citas/models/cita.model';

@Component({
  selector: 'app-atencion',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Atención Médica</h1>
        <p class="text-gray-400 text-sm mt-1">Citas pendientes de atención odontológica</p>
      </div>

      <!-- Lista de citas pendientes -->
      @if (citasPendientes().length === 0) {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p class="text-gray-400 text-sm">No hay citas pendientes de atención</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (cita of citasPendientes(); track cita.id) {
            <div class="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
              <!-- Paciente y estado -->
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-white font-semibold text-sm leading-tight">{{ cita.pacienteNombre }}</h3>
                <span [class]="getBadgeClass(cita.estado)">
                  {{ cita.estado }}
                </span>
              </div>

              <!-- Detalles -->
              <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-gray-400 text-sm">
                  <svg class="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>{{ cita.hora }} — {{ cita.fecha }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-400 text-sm">
                  <svg class="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span>{{ cita.odontologoNombre }}</span>
                </div>
                <div class="flex items-start gap-2 text-gray-400 text-sm">
                  <svg class="w-4 h-4 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span>{{ cita.motivo }}</span>
                </div>
              </div>

              <!-- Botón Atender -->
              <button
                (click)="navegarAtender(cita.id)"
                class="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
                Atender
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class AtencionComponent implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly router = inject(Router);

  readonly citasPendientes = signal<Cita[]>([]);

  ngOnInit(): void {
    this.cargarCitasPendientes();
  }

  navegarAtender(citaId: number): void {
    this.router.navigate(['/intranet/atencion', citaId]);
  }

  getBadgeClass(estado: EstadoCita): string {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return `${base} bg-yellow-500/20 text-yellow-400`;
      case EstadoCita.REAGENDADO:
        return `${base} bg-blue-500/20 text-blue-400`;
      default:
        return base;
    }
  }

  private cargarCitasPendientes(): void {
    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = this.citaService.listarPorFecha(hoy);
    this.citasPendientes.set(
      citasHoy.filter(c => c.estado === EstadoCita.PENDIENTE || c.estado === EstadoCita.REAGENDADO)
    );
  }
}
