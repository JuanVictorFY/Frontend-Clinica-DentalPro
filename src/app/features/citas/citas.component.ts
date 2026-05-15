import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CitaService } from './services/cita.service';
import { Cita, EstadoCita, isTransicionValida } from './models/cita.model';

@Component({
  selector: 'app-citas',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Citas</h1>
          <p class="text-gray-400 text-sm mt-1">Gestión de citas y agenda de la clínica</p>
        </div>
        <button
          (click)="navegarNueva()"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Cita
        </button>
      </div>

      <!-- Filtro por fecha -->
      <div class="flex items-center gap-3">
        <label for="fechaFiltro" class="text-sm font-medium text-gray-300">Fecha:</label>
        <input
          id="fechaFiltro"
          type="date"
          [value]="fechaSeleccionada()"
          (change)="onFechaChange($event)"
          class="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      <!-- Tabla -->
      @if (citasFiltradas().length === 0) {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <p class="text-gray-400 text-sm">No hay citas para esta fecha</p>
        </div>
      } @else {
        <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th class="px-6 py-4 font-medium">Hora</th>
                  <th class="px-6 py-4 font-medium">Paciente</th>
                  <th class="px-6 py-4 font-medium">Odontólogo</th>
                  <th class="px-6 py-4 font-medium">Motivo</th>
                  <th class="px-6 py-4 font-medium text-center">Estado</th>
                  <th class="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (cita of citasFiltradas(); track cita.id) {
                  <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <td class="px-6 py-4 text-gray-200 font-medium">{{ cita.hora }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ cita.pacienteNombre }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ cita.odontologoNombre }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ cita.motivo }}</td>
                    <td class="px-6 py-4 text-center">
                      <span [class]="getBadgeClass(cita.estado)">
                        {{ cita.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        @if (puedeAtender(cita)) {
                          <button
                            (click)="onAtender(cita)"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer"
                            title="Marcar como atendido"
                          >
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Atender
                          </button>
                        }
                        @if (puedeCancelar(cita)) {
                          <button
                            (click)="onCancelar(cita)"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Cancelar cita"
                          >
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            Cancelar
                          </button>
                        }
                        @if (puedeEditar(cita)) {
                          <button
                            (click)="navegarEditar(cita.id)"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            title="Editar cita"
                          >
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            Editar
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class CitasComponent implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly router = inject(Router);

  readonly fechaSeleccionada = signal(new Date().toISOString().split('T')[0]);
  readonly citasFiltradas = signal<Cita[]>([]);

  ngOnInit(): void {
    this.cargarCitas();
  }

  onFechaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaSeleccionada.set(input.value);
    this.cargarCitas();
  }

  navegarNueva(): void {
    this.router.navigate(['/intranet/citas/nueva']);
  }

  navegarEditar(id: number): void {
    this.router.navigate(['/intranet/citas/editar', id]);
  }

  onAtender(cita: Cita): void {
    const confirmado = window.confirm(
      `¿Marcar como atendida la cita de "${cita.pacienteNombre}" a las ${cita.hora}?`
    );
    if (confirmado) {
      this.citaService.atender(cita.id);
      this.cargarCitas();
    }
  }

  onCancelar(cita: Cita): void {
    const confirmado = window.confirm(
      `¿Está seguro de cancelar la cita de "${cita.pacienteNombre}" a las ${cita.hora}?`
    );
    if (confirmado) {
      this.citaService.cancelar(cita.id);
      this.cargarCitas();
    }
  }

  puedeAtender(cita: Cita): boolean {
    return isTransicionValida(cita.estado, EstadoCita.ATENDIDO);
  }

  puedeCancelar(cita: Cita): boolean {
    return isTransicionValida(cita.estado, EstadoCita.CANCELADO);
  }

  puedeEditar(cita: Cita): boolean {
    return isTransicionValida(cita.estado, EstadoCita.REAGENDADO);
  }

  getBadgeClass(estado: EstadoCita): string {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return `${base} bg-yellow-500/20 text-yellow-400`;
      case EstadoCita.ATENDIDO:
        return `${base} bg-green-500/20 text-green-400`;
      case EstadoCita.CANCELADO:
        return `${base} bg-red-500/20 text-red-400`;
      case EstadoCita.REAGENDADO:
        return `${base} bg-blue-500/20 text-blue-400`;
      default:
        return base;
    }
  }

  private cargarCitas(): void {
    this.citasFiltradas.set(this.citaService.listarPorFecha(this.fechaSeleccionada()));
  }
}
