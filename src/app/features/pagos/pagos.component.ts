import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { PagoService } from './services/pago.service';
import { Pago, EstadoPago } from './models/pago.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Pagos</h1>
        <p class="text-gray-400 text-sm mt-1">Registro de cobros por atención</p>
      </div>

      <!-- Resumen -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 bg-gray-800 rounded-xl border border-gray-700 text-center">
          <p class="text-2xl font-bold text-white">{{ totalPagados() }}</p>
          <p class="text-sm text-gray-400 mt-1">Pagados</p>
        </div>
        <div class="p-4 bg-gray-800 rounded-xl border border-yellow-700/40 text-center">
          <p class="text-2xl font-bold text-yellow-400">{{ totalPendientes() }}</p>
          <p class="text-sm text-gray-400 mt-1">Pendientes</p>
        </div>
        <div class="p-4 bg-gray-800 rounded-xl border border-emerald-700/40 text-center">
          <p class="text-2xl font-bold text-emerald-400">S/. {{ montoPagado().toFixed(2) }}</p>
          <p class="text-sm text-gray-400 mt-1">Total cobrado</p>
        </div>
      </div>

      <!-- Tabla -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      } @else if (pagos().length === 0) {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <p class="text-gray-400 text-sm">No hay pagos registrados</p>
        </div>
      } @else {
        <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th class="px-6 py-4 font-medium">Paciente</th>
                  <th class="px-6 py-4 font-medium">Odontólogo</th>
                  <th class="px-6 py-4 font-medium">Fecha Cita</th>
                  <th class="px-6 py-4 font-medium">Método</th>
                  <th class="px-6 py-4 font-medium text-right">Monto</th>
                  <th class="px-6 py-4 font-medium text-center">Estado</th>
                  <th class="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (pago of pagos(); track pago.id) {
                  <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <td class="px-6 py-4 text-gray-200 font-medium">{{ pago.pacienteNombre }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ pago.odontologoNombre }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ pago.citaFecha }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center gap-1 text-gray-300">
                        {{ pago.metodoPago }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-emerald-400 font-semibold">S/. {{ pago.monto.toFixed(2) }}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span [class]="getBadgeClass(pago.estado)">{{ pago.estado }}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (pago.estado === 'PENDIENTE') {
                        <button
                          (click)="marcarPagado(pago)"
                          class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        >
                          Marcar pagado
                        </button>
                      } @else {
                        <span class="text-gray-600 text-xs">—</span>
                      }
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
export class PagosComponent implements OnInit {
  private readonly service = inject(PagoService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly pagos = signal<Pago[]>([]);

  readonly totalPagados = computed(() => this.pagos().filter(p => p.estado === 'PAGADO').length);
  readonly totalPendientes = computed(() => this.pagos().filter(p => p.estado === 'PENDIENTE').length);
  readonly montoPagado = computed(() => this.pagos().filter(p => p.estado === 'PAGADO').reduce((s, p) => s + p.monto, 0));

  ngOnInit(): void {
    this.cargar();
  }

  marcarPagado(pago: Pago): void {
    this.service.cambiarEstado(pago.id, 'PAGADO').subscribe({
      next: (updated) => {
        this.pagos.update(list => list.map(p => p.id === updated.id ? updated : p));
        this.toast.success('Pago marcado como pagado');
      },
      error: () => this.toast.error('Error al actualizar el pago')
    });
  }

  getBadgeClass(estado: EstadoPago): string {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case 'PAGADO':   return `${base} bg-emerald-500/20 text-emerald-400`;
      case 'PENDIENTE': return `${base} bg-yellow-500/20 text-yellow-400`;
      case 'ANULADO':  return `${base} bg-red-500/20 text-red-400`;
      default: return base;
    }
  }

  private cargar(): void {
    this.isLoading.set(true);
    this.service.listar().subscribe({
      next: (data) => { this.pagos.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }
}
