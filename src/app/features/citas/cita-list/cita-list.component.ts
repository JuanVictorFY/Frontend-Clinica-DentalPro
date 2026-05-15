import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CitaService } from '../services/cita.service';
import { Cita } from '../models/cita.model';
import { EstadoCita, isTransicionValida } from '../models/estado-cita.model';
import { EstadoCitaPipe } from '../../../shared/pipes/estado-cita.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cita-list',
  standalone: true,
  imports: [
    EstadoCitaPipe,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-800">Citas</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <label for="fecha-filtro" class="text-sm font-medium text-gray-600">Fecha:</label>
            <input
              id="fecha-filtro"
              type="date"
              [value]="fechaSeleccionada()"
              (change)="onFechaChange($event)"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            (click)="navegarNuevaCita()"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
          >
            + Nueva Cita
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <app-loading-spinner message="Cargando citas..." />
      }

      <!-- Error state -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p class="text-red-600 text-sm mb-2">{{ error() }}</p>
          <button
            (click)="cargarCitas()"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && !error() && citas().length === 0) {
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p class="text-gray-500 text-sm">No hay citas programadas para esta fecha.</p>
        </div>
      }

      <!-- Citas list -->
      @if (!loading() && !error() && citas().length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 font-semibold text-gray-600">Hora</th>
                <th class="px-4 py-3 font-semibold text-gray-600">Paciente</th>
                <th class="px-4 py-3 font-semibold text-gray-600">Odontólogo</th>
                <th class="px-4 py-3 font-semibold text-gray-600">Motivo</th>
                <th class="px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th class="px-4 py-3 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (cita of citas(); track cita.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 font-medium text-gray-800">{{ cita.hora }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ cita.pacienteNombre }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ cita.odontologoNombre }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ cita.motivo }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getEstadoClasses(cita.estado)">
                      {{ cita.estado | estadoCita:'label' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Editar -->
                      <button
                        (click)="editarCita(cita)"
                        [disabled]="!puedeEditar(cita)"
                        [class]="puedeEditar(cita)
                          ? 'px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition'
                          : 'px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed'"
                        [attr.aria-label]="'Editar cita de ' + cita.pacienteNombre"
                      >
                        Editar
                      </button>
                      <!-- Atender -->
                      <button
                        (click)="atenderCita(cita)"
                        [disabled]="!puedeAtender(cita)"
                        [class]="puedeAtender(cita)
                          ? 'px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition'
                          : 'px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed'"
                        [attr.aria-label]="'Atender cita de ' + cita.pacienteNombre"
                      >
                        Atender
                      </button>
                      <!-- Cancelar -->
                      <button
                        (click)="confirmarCancelacion(cita)"
                        [disabled]="!puedeCancelar(cita)"
                        [class]="puedeCancelar(cita)
                          ? 'px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition'
                          : 'px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed'"
                        [attr.aria-label]="'Cancelar cita de ' + cita.pacienteNombre"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Confirm dialog for cancellation -->
      @if (showConfirmDialog()) {
        <app-confirm-dialog
          title="Cancelar Cita"
          [message]="'¿Está seguro de que desea cancelar la cita de ' + citaACancelar()?.pacienteNombre + '?'"
          confirmText="Sí, cancelar"
          cancelText="No, volver"
          (confirm)="ejecutarCancelacion()"
          (cancel)="cerrarConfirmDialog()"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class CitaListComponent implements OnInit {
  private readonly citaService = inject(CitaService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // State signals
  readonly citas = signal<Cita[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly fechaSeleccionada = signal(this.getTodayString());
  readonly showConfirmDialog = signal(false);
  readonly citaACancelar = signal<Cita | null>(null);

  ngOnInit(): void {
    this.cargarCitas();
  }

  /**
   * Carga las citas para la fecha seleccionada.
   */
  cargarCitas(): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.listarPorFecha(this.fechaSeleccionada()).subscribe({
      next: (citas) => {
        this.citas.set(citas);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las citas. Intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Maneja el cambio de fecha en el selector.
   */
  onFechaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaSeleccionada.set(input.value);
    this.cargarCitas();
  }

  /**
   * Navega al formulario de nueva cita.
   */
  navegarNuevaCita(): void {
    this.router.navigate(['/intranet/citas/nueva']);
  }

  /**
   * Navega al formulario de edición de una cita.
   */
  editarCita(cita: Cita): void {
    if (this.puedeEditar(cita)) {
      this.router.navigate(['/intranet/citas/editar', cita.id]);
    }
  }

  /**
   * Navega al módulo de atención para la cita.
   */
  atenderCita(cita: Cita): void {
    if (this.puedeAtender(cita)) {
      this.router.navigate(['/intranet/atencion', cita.id]);
    }
  }

  /**
   * Muestra el diálogo de confirmación para cancelar una cita.
   */
  confirmarCancelacion(cita: Cita): void {
    if (this.puedeCancelar(cita)) {
      this.citaACancelar.set(cita);
      this.showConfirmDialog.set(true);
    }
  }

  /**
   * Ejecuta la cancelación de la cita tras confirmación.
   */
  ejecutarCancelacion(): void {
    const cita = this.citaACancelar();
    if (!cita) return;

    this.cerrarConfirmDialog();

    this.citaService.cancelar(cita.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cita cancelada exitosamente.');
        this.cargarCitas();
      },
      error: () => {
        this.notificationService.showError('Error al cancelar la cita. Intente nuevamente.');
      }
    });
  }

  /**
   * Cierra el diálogo de confirmación.
   */
  cerrarConfirmDialog(): void {
    this.showConfirmDialog.set(false);
    this.citaACancelar.set(null);
  }

  /**
   * Determina si una cita puede ser editada.
   * Solo citas en estado PENDIENTE o REAGENDADO pueden editarse.
   */
  puedeEditar(cita: Cita): boolean {
    return isTransicionValida(cita.estado, EstadoCita.REAGENDADO);
  }

  /**
   * Determina si una cita puede ser atendida.
   * Solo citas en estado PENDIENTE o REAGENDADO pueden atenderse.
   */
  puedeAtender(cita: Cita): boolean {
    return isTransicionValida(cita.estado, EstadoCita.ATENDIDO);
  }

  /**
   * Determina si una cita puede ser cancelada.
   * Solo citas en estado PENDIENTE o REAGENDADO pueden cancelarse.
   */
  puedeCancelar(cita: Cita): boolean {
    return isTransicionValida(cita.estado, EstadoCita.CANCELADO);
  }

  /**
   * Retorna las clases CSS para la etiqueta de estado.
   */
  getEstadoClasses(estado: EstadoCita): string {
    const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colorMap: Record<EstadoCita, string> = {
      [EstadoCita.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
      [EstadoCita.ATENDIDO]: 'bg-green-100 text-green-800',
      [EstadoCita.CANCELADO]: 'bg-red-100 text-red-800',
      [EstadoCita.REAGENDADO]: 'bg-blue-100 text-blue-800'
    };
    return `${baseClasses} ${colorMap[estado] ?? ''}`;
  }

  /**
   * Retorna la fecha actual en formato YYYY-MM-DD.
   */
  private getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
