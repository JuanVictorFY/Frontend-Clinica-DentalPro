import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReporteService } from './services/reporte.service';
import { Reporte } from './models/reporte.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [PaginationComponent, TableSkeletonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Reportes de Atención</h1>
        <p class="text-gray-400 text-sm mt-1">Notas clínicas generadas a partir de citas atendidas</p>
      </div>

      <!-- Skeleton de carga -->
      @if (isLoading()) {
        <app-table-skeleton [columns]="5" [rows]="5" />
      } @else if (reportes().length === 0) {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p class="text-gray-400 text-sm">No hay reportes disponibles</p>
        </div>
      } @else {
        <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th class="px-6 py-4 font-medium">Fecha</th>
                  <th class="px-6 py-4 font-medium">Paciente</th>
                  <th class="px-6 py-4 font-medium">Odontólogo</th>
                  <th class="px-6 py-4 font-medium">Diagnóstico</th>
                  <th class="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (reporte of paginatedReportes(); track reporte.id) {
                  <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <td class="px-6 py-4 text-gray-300">{{ reporte.fecha }}</td>
                    <td class="px-6 py-4 text-gray-200 font-medium">{{ reporte.pacienteNombre }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ reporte.odontologoNombre }}</td>
                    <td class="px-6 py-4 text-gray-300 max-w-xs truncate">{{ reporte.diagnostico }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center">
                        <button
                          (click)="verDetalle(reporte.id)"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors text-xs font-medium cursor-pointer"
                          title="Ver detalle del reporte"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
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
        </div>

        <!-- Paginación -->
        <app-pagination
          [currentPage]="currentPage()"
          [totalItems]="reportes().length"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class ReportesComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly reportes = signal<Reporte[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly paginatedReportes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.reportes().slice(start, end);
  });

  ngOnInit(): void {
    // Simular carga desde API
    setTimeout(() => {
      this.reportes.set(this.reporteService.listar());
      this.isLoading.set(false);
    }, 600);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/intranet/reportes', id]);
  }
}
