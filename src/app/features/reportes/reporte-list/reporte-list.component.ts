import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ReporteService } from '../services/reporte.service';
import { Reporte, ReporteFiltros } from '../models/reporte.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reporte-list',
  standalone: true,
  imports: [
    FormsModule,
    PaginationComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Reportes de Atención</h1>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <!-- Fecha Desde -->
          <div>
            <label for="fecha-desde" class="block text-sm font-medium text-gray-600 mb-1">Desde</label>
            <input
              id="fecha-desde"
              type="date"
              [ngModel]="fechaDesde()"
              (ngModelChange)="onFechaDesdeChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Fecha Hasta -->
          <div>
            <label for="fecha-hasta" class="block text-sm font-medium text-gray-600 mb-1">Hasta</label>
            <input
              id="fecha-hasta"
              type="date"
              [ngModel]="fechaHasta()"
              (ngModelChange)="onFechaHastaChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Paciente search -->
          <div>
            <label for="paciente-search" class="block text-sm font-medium text-gray-600 mb-1">Paciente</label>
            <input
              id="paciente-search"
              type="text"
              placeholder="Buscar por nombre de paciente..."
              [ngModel]="pacienteSearch()"
              (ngModelChange)="onPacienteSearchChange($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Filter button -->
          <div>
            <button
              type="button"
              (click)="applyFilters()"
              class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <app-loading-spinner message="Cargando reportes..." />
      }

      <!-- Error -->
      @if (error()) {
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <svg class="w-12 h-12 text-red-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p class="text-gray-600 mb-4">{{ error() }}</p>
          <button
            type="button"
            (click)="loadReportes()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
          >
            Reintentar
          </button>
        </div>
      }

      <!-- Content -->
      @if (!loading() && !error()) {
        @if (reportes().length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <svg class="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p class="text-gray-500">No se encontraron reportes.</p>
          </div>
        } @else {
          <div class="overflow-x-auto bg-white rounded-xl shadow">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Fecha</th>
                  <th class="px-6 py-3">Paciente</th>
                  <th class="px-6 py-3">Odontólogo</th>
                  <th class="px-6 py-3">Diagnóstico</th>
                  <th class="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (reporte of reportes(); track reporte.id) {
                  <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 text-gray-600">{{ reporte.fecha }}</td>
                    <td class="px-6 py-4 font-medium text-gray-800">{{ reporte.pacienteNombre }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ reporte.odontologoNombre }}</td>
                    <td class="px-6 py-4 text-gray-600 max-w-xs truncate">{{ reporte.diagnostico }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center">
                        <button
                          type="button"
                          (click)="viewReporte(reporte.id)"
                          class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                          [attr.aria-label]="'Ver detalle del reporte de ' + reporte.pacienteNombre"
                        >
                          <svg class="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          Ver detalle
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="mt-4">
              <app-pagination
                [currentPage]="currentPage()"
                [totalPages]="totalPages()"
                (pageChange)="onPageChange($event)"
              />
            </div>
          }
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class ReporteListComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly router = inject(Router);

  // State signals
  readonly reportes = signal<Reporte[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);

  // Filter signals
  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');
  readonly pacienteSearch = signal('');

  private readonly pageSize = 10;

  ngOnInit(): void {
    this.loadReportes();
  }

  loadReportes(): void {
    this.loading.set(true);
    this.error.set(null);

    const filtros: ReporteFiltros = {
      page: this.currentPage(),
      size: this.pageSize
    };

    if (this.fechaDesde()) {
      filtros.fechaDesde = this.fechaDesde();
    }
    if (this.fechaHasta()) {
      filtros.fechaHasta = this.fechaHasta();
    }

    this.reporteService.listar(filtros).subscribe({
      next: (response) => {
        let reportes = response.content;

        // Client-side filter by patient name if search text is provided
        const pacienteQuery = this.pacienteSearch().trim().toLowerCase();
        if (pacienteQuery) {
          reportes = reportes.filter(r =>
            r.pacienteNombre.toLowerCase().includes(pacienteQuery)
          );
        }

        this.reportes.set(reportes);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.currentPage);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los reportes. Verifique su conexión e intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  onFechaDesdeChange(value: string): void {
    this.fechaDesde.set(value);
  }

  onFechaHastaChange(value: string): void {
    this.fechaHasta.set(value);
  }

  onPacienteSearchChange(value: string): void {
    this.pacienteSearch.set(value);
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadReportes();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadReportes();
  }

  viewReporte(id: number): void {
    this.router.navigate(['/intranet/reportes', id]);
  }
}
