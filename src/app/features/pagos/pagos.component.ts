import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagoService } from './services/pago.service';
import { Pago, EstadoPago, MetodoPago } from './models/pago.model';
import { ToastService } from '../../shared/services/toast.service';

interface CobroForm {
  monto: number | null;
  metodoPago: MetodoPago;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule],
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
                  <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td class="px-6 py-4 text-gray-200 font-medium">{{ pago.pacienteNombre }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ pago.odontologoNombre }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ pago.citaFecha }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ pago.metodoPago }}</td>
                    <td class="px-6 py-4 text-right">
                      @if (pago.estado === 'PAGADO') {
                        <span class="text-emerald-400 font-semibold">S/. {{ pago.monto.toFixed(2) }}</span>
                      } @else {
                        <span class="text-gray-500 text-xs italic">pendiente</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span [class]="getBadgeClass(pago.estado)">{{ pago.estado }}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (pago.estado === 'PENDIENTE') {
                        @if (cobrando() === pago.id) {
                          <!-- Formulario inline de cobro -->
                          <div class="flex items-center gap-2 justify-center flex-wrap">
                            <input
                              type="number"
                              [(ngModel)]="cobroForm.monto"
                              min="0.01"
                              step="0.10"
                              placeholder="S/. 0.00"
                              class="w-24 px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <select
                              [(ngModel)]="cobroForm.metodoPago"
                              class="px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="EFECTIVO">Efectivo</option>
                              <option value="TARJETA">Tarjeta</option>
                              <option value="TRANSFERENCIA">Transferencia</option>
                            </select>
                            <button
                              (click)="confirmarCobro(pago)"
                              [disabled]="!cobroForm.monto || cobroForm.monto <= 0 || procesando()"
                              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
                            >
                              {{ procesando() ? '...' : 'Cobrar' }}
                            </button>
                            <button
                              (click)="cancelarCobro()"
                              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        } @else {
                          <button
                            (click)="iniciarCobro(pago.id)"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-600 hover:bg-yellow-500 text-white transition-colors cursor-pointer"
                          >
                            Registrar cobro
                          </button>
                        }
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
  readonly procesando = signal(false);
  readonly pagos = signal<Pago[]>([]);
  readonly cobrando = signal<number | null>(null);

  cobroForm: CobroForm = { monto: null, metodoPago: 'EFECTIVO' };

  readonly totalPagados = computed(() => this.pagos().filter(p => p.estado === 'PAGADO').length);
  readonly totalPendientes = computed(() => this.pagos().filter(p => p.estado === 'PENDIENTE').length);
  readonly montoPagado = computed(() => this.pagos().filter(p => p.estado === 'PAGADO').reduce((s, p) => s + p.monto, 0));

  ngOnInit(): void {
    this.cargar();
  }

  iniciarCobro(pagoId: number): void {
    this.cobrando.set(pagoId);
    this.cobroForm = { monto: null, metodoPago: 'EFECTIVO' };
  }

  cancelarCobro(): void {
    this.cobrando.set(null);
  }

  confirmarCobro(pago: Pago): void {
    if (!this.cobroForm.monto || this.cobroForm.monto <= 0) return;

    this.procesando.set(true);
    this.service.cobrar(pago.id, this.cobroForm.monto, this.cobroForm.metodoPago).subscribe({
      next: (updated) => {
        this.pagos.update(list => list.map(p => p.id === updated.id ? updated : p));
        this.cobrando.set(null);
        this.procesando.set(false);
        this.toast.success(`Cobro registrado: S/. ${this.cobroForm.monto?.toFixed(2)}`);
      },
      error: () => {
        this.toast.error('Error al registrar el cobro');
        this.procesando.set(false);
      }
    });
  }

  getBadgeClass(estado: EstadoPago): string {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case 'PAGADO':    return `${base} bg-emerald-500/20 text-emerald-400`;
      case 'PENDIENTE': return `${base} bg-yellow-500/20 text-yellow-400`;
      case 'ANULADO':   return `${base} bg-red-500/20 text-red-400`;
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





