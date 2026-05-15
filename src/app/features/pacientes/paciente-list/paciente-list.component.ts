import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { PacienteService } from '../services/paciente.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Paciente } from '../models/paciente.model';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [
    SearchInputComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Pacientes</h1>
        <button
          type="button"
          (click)="navigateToNew()"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
        >
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Paciente
        </button>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <app-search-input (searchChange)="onSearch($event)" />
      </div>

      <!-- Loading -->
      @if (loading()) {
        <app-loading-spinner size="lg" message="Cargando pacientes..." />
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
            (click)="loadPacientes()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
          >
            Reintentar
          </button>
        </div>
      }

      <!-- Table -->
      @if (!loading() && !error()) {
        @if (pacientes().length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <svg class="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <p class="text-gray-500">No se encontraron pacientes.</p>
          </div>
        } @else {
          <div class="overflow-x-auto bg-white rounded-xl shadow">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Nombre</th>
                  <th class="px-6 py-3">DNI</th>
                  <th class="px-6 py-3">Teléfono</th>
                  <th class="px-6 py-3">Email</th>
                  <th class="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (paciente of pacientes(); track paciente.id) {
                  <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 font-medium text-gray-800">{{ paciente.nombreCompleto }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ paciente.dni }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ paciente.telefono }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ paciente.email }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          (click)="navigateToEdit(paciente.id)"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          aria-label="Editar paciente"
                          [attr.title]="'Editar ' + paciente.nombreCompleto"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(paciente)"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          aria-label="Eliminar paciente"
                          [attr.title]="'Eliminar ' + paciente.nombreCompleto"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
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

      <!-- Confirm Delete Dialog -->
      @if (showDeleteDialog()) {
        <app-confirm-dialog
          title="Eliminar Paciente"
          [message]="'¿Está seguro de que desea eliminar al paciente ' + pacienteToDelete()?.nombreCompleto + '? Esta acción no se puede deshacer.'"
          confirmText="Eliminar"
          cancelText="Cancelar"
          (confirm)="onDeleteConfirm()"
          (cancel)="onDeleteCancel()"
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
export class PacienteListComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // State signals
  readonly pacientes = signal<Paciente[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly searchQuery = signal('');
  readonly showDeleteDialog = signal(false);
  readonly pacienteToDelete = signal<Paciente | null>(null);

  private readonly pageSize = 10;

  ngOnInit(): void {
    this.loadPacientes();
  }

  loadPacientes(): void {
    this.loading.set(true);
    this.error.set(null);

    const query = this.searchQuery();

    if (query.trim()) {
      this.pacienteService.buscar(query).subscribe({
        next: (pacientes) => {
          this.pacientes.set(pacientes);
          this.totalPages.set(1);
          this.currentPage.set(1);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar los pacientes. Verifique su conexión e intente nuevamente.');
          this.loading.set(false);
        }
      });
    } else {
      this.pacienteService.listar(this.currentPage(), this.pageSize).subscribe({
        next: (response) => {
          this.pacientes.set(response.content);
          this.totalPages.set(response.totalPages);
          this.currentPage.set(response.currentPage);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar los pacientes. Verifique su conexión e intente nuevamente.');
          this.loading.set(false);
        }
      });
    }
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadPacientes();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPacientes();
  }

  navigateToNew(): void {
    this.router.navigate(['/intranet/pacientes/nuevo']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/intranet/pacientes/editar', id]);
  }

  confirmDelete(paciente: Paciente): void {
    this.pacienteToDelete.set(paciente);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirm(): void {
    const paciente = this.pacienteToDelete();
    if (!paciente) return;

    this.showDeleteDialog.set(false);
    this.pacienteToDelete.set(null);

    this.pacienteService.eliminar(paciente.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Paciente eliminado correctamente.');
        this.loadPacientes();
      },
      error: () => {
        this.notificationService.showError('No se pudo eliminar el paciente. Intente nuevamente.');
      }
    });
  }

  onDeleteCancel(): void {
    this.showDeleteDialog.set(false);
    this.pacienteToDelete.set(null);
  }
}
