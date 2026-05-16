import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { PacienteService } from './services/paciente.service';
import { Paciente } from './models/paciente.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [SearchInputComponent, PaginationComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Pacientes</h1>
          <p class="text-gray-400 text-sm mt-1">Gestión de pacientes de la clínica dental</p>
        </div>
        <button
          (click)="navegarNuevo()"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Paciente
        </button>
      </div>

      <!-- Búsqueda -->
      <div class="max-w-md">
        <app-search-input (searchChange)="onBuscar($event)" />
      </div>

      <!-- Tabla -->
      @if (pacientesFiltrados().length === 0) {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <p class="text-gray-400 text-sm">No se encontraron pacientes</p>
        </div>
      } @else {
        <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th class="px-6 py-4 font-medium">Nombre</th>
                  <th class="px-6 py-4 font-medium">DNI</th>
                  <th class="px-6 py-4 font-medium">Teléfono</th>
                  <th class="px-6 py-4 font-medium">Email</th>
                  <th class="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (paciente of paginatedPacientes(); track paciente.id) {
                  <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <td class="px-6 py-4 text-gray-200 font-medium">{{ paciente.nombreCompleto }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ paciente.dni }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ paciente.telefono }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ paciente.email }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <!-- Editar -->
                        <button
                          (click)="navegarEditar(paciente.id)"
                          class="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                          title="Editar paciente"
                        >
                          <svg class="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <!-- Eliminar -->
                        <button
                          (click)="onEliminar(paciente)"
                          class="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Eliminar paciente"
                        >
                          <svg class="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
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
          [totalItems]="pacientesFiltrados().length"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class PacientesComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  readonly pacientesFiltrados = signal<Paciente[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly paginatedPacientes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.pacientesFiltrados().slice(start, end);
  });

  ngOnInit(): void {
    this.pacientesFiltrados.set(this.pacienteService.listar());
  }

  onBuscar(query: string): void {
    this.pacientesFiltrados.set(this.pacienteService.buscar(query));
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  navegarNuevo(): void {
    this.router.navigate(['/intranet/pacientes/nuevo']);
  }

  navegarEditar(id: number): void {
    this.router.navigate(['/intranet/pacientes/editar', id]);
  }

  async onEliminar(paciente: Paciente): Promise<void> {
    const confirmado = await this.confirmService.confirm({
      title: 'Eliminar Paciente',
      message: `¿Está seguro de eliminar al paciente "${paciente.nombreCompleto}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });
    if (confirmado) {
      this.pacienteService.eliminar(paciente.id);
      this.pacientesFiltrados.set(this.pacienteService.listar());
      this.currentPage.set(1);
      this.toast.success('Paciente eliminado correctamente');
    }
  }
}
