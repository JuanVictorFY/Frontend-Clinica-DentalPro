import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReporteService } from '../services/reporte.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Reporte } from '../models/reporte.model';

@Component({
  selector: 'app-reporte-view',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="max-w-3xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Detalle del Reporte</h1>
        <button
          type="button"
          (click)="goBack()"
          class="text-sm text-gray-600 hover:text-gray-800 transition"
        >
          ← Volver a reportes
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Cargando reporte..." />
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg class="mx-auto h-12 w-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="text-red-700 font-medium mb-2">Error al cargar el reporte</p>
          <p class="text-red-600 text-sm mb-4">{{ error() }}</p>
          <button
            type="button"
            (click)="loadReporte()"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none transition"
          >
            Reintentar
          </button>
        </div>
      } @else if (reporte()) {
        <!-- Reporte content -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <!-- Header del reporte -->
          <div class="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Reporte #{{ reporte()!.id }}</p>
                <p class="text-lg font-semibold text-gray-800">Reporte de Atención</p>
              </div>
              <span class="text-sm text-gray-500">{{ reporte()!.fecha }}</span>
            </div>
          </div>

          <!-- Datos del reporte -->
          <div class="px-6 py-5 space-y-5">
            <!-- Paciente y Odontólogo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Paciente</p>
                <p class="text-gray-800 font-medium">{{ reporte()!.pacienteNombre }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Odontólogo</p>
                <p class="text-gray-800 font-medium">{{ reporte()!.odontologoNombre }}</p>
              </div>
            </div>

            <hr class="border-gray-100" />

            <!-- Diagnóstico -->
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Diagnóstico</p>
              <p class="text-gray-800 whitespace-pre-line">{{ reporte()!.diagnostico }}</p>
            </div>

            <!-- Tratamiento -->
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tratamiento</p>
              <p class="text-gray-800 whitespace-pre-line">{{ reporte()!.tratamiento }}</p>
            </div>

            <!-- Observaciones -->
            @if (reporte()!.observaciones) {
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
                <p class="text-gray-800 whitespace-pre-line">{{ reporte()!.observaciones }}</p>
              </div>
            }
          </div>

          <!-- Footer con acciones -->
          <div class="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg">
            <button
              type="button"
              (click)="descargarPdf()"
              [disabled]="downloading()"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (downloading()) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Descargando...
              } @else {
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              }
            </button>
          </div>
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
export class ReporteViewComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly reporte = signal<Reporte | null>(null);
  readonly downloading = signal(false);

  private reporteId!: number;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || isNaN(+idParam)) {
      this.notificationService.showError('ID de reporte inválido');
      this.router.navigate(['/intranet/reportes']);
      return;
    }

    this.reporteId = +idParam;
    this.loadReporte();
  }

  /**
   * Carga el reporte desde la API usando el ID de la ruta.
   */
  loadReporte(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reporteService.obtenerPorCita(this.reporteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reporte) => {
          this.reporte.set(reporte);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No se pudo cargar el reporte. Verifique su conexión e intente nuevamente.');
        }
      });
  }

  /**
   * Descarga el reporte en formato PDF creando un Blob URL y disparando la descarga.
   */
  descargarPdf(): void {
    const reporte = this.reporte();
    if (!reporte) return;

    this.downloading.set(true);

    this.reporteService.descargarPdf(reporte.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-${reporte.id}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
          this.downloading.set(false);
          this.notificationService.showSuccess('Reporte descargado exitosamente');
        },
        error: () => {
          this.downloading.set(false);
          this.notificationService.showError('Error al descargar el PDF. Intente nuevamente.');
        }
      });
  }

  /**
   * Navega de vuelta a la lista de reportes.
   */
  goBack(): void {
    this.router.navigate(['/intranet/reportes']);
  }
}
