import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { UsuarioService } from '../services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Usuario } from '../models/usuario.model';
import { UserRole } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    ConfirmDialogComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button
          type="button"
          (click)="navigateToNew()"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
        >
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <app-loading-spinner size="lg" message="Cargando usuarios..." />
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
            (click)="loadUsuarios()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
          >
            Reintentar
          </button>
        </div>
      }

      <!-- Table -->
      @if (!loading() && !error()) {
        @if (usuarios().length === 0) {
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <svg class="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <p class="text-gray-500">No se encontraron usuarios.</p>
          </div>
        } @else {
          <div class="overflow-x-auto bg-white rounded-xl shadow">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Nombre Completo</th>
                  <th class="px-6 py-3">Email</th>
                  <th class="px-6 py-3">Rol</th>
                  <th class="px-6 py-3">Estado</th>
                  <th class="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (usuario of usuarios(); track usuario.id) {
                  <tr class="hover:bg-gray-50 transition">
                    <td class="px-6 py-4 font-medium text-gray-800">{{ usuario.nombreCompleto }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ usuario.email }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getRolBadgeClass(usuario.rol)">
                        {{ formatRol(usuario.rol) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      @if (usuario.activo) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          (click)="navigateToEdit(usuario.id)"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          aria-label="Editar usuario"
                          [attr.title]="'Editar ' + usuario.nombreCompleto"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          (click)="confirmDelete(usuario)"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          aria-label="Eliminar usuario"
                          [attr.title]="'Eliminar ' + usuario.nombreCompleto"
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
        }
      }

      <!-- Confirm Delete Dialog -->
      @if (showDeleteDialog()) {
        <app-confirm-dialog
          title="Eliminar Usuario"
          [message]="'¿Está seguro de que desea eliminar al usuario ' + usuarioToDelete()?.nombreCompleto + '? Esta acción no se puede deshacer.'"
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
export class UsuarioListComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // State signals
  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showDeleteDialog = signal(false);
  readonly usuarioToDelete = signal<Usuario | null>(null);

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los usuarios. Verifique su conexión e intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  navigateToNew(): void {
    this.router.navigate(['/intranet/usuarios/nuevo']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/intranet/usuarios/editar', id]);
  }

  confirmDelete(usuario: Usuario): void {
    this.usuarioToDelete.set(usuario);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirm(): void {
    const usuario = this.usuarioToDelete();
    if (!usuario) return;

    this.showDeleteDialog.set(false);
    this.usuarioToDelete.set(null);

    this.usuarioService.eliminar(usuario.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Usuario eliminado correctamente.');
        this.loadUsuarios();
      },
      error: () => {
        this.notificationService.showError('No se pudo eliminar el usuario. Intente nuevamente.');
      }
    });
  }

  onDeleteCancel(): void {
    this.showDeleteDialog.set(false);
    this.usuarioToDelete.set(null);
  }

  formatRol(rol: UserRole): string {
    switch (rol) {
      case UserRole.ADMINISTRADOR:
        return 'Administrador';
      case UserRole.RECEPCIONISTA:
        return 'Recepcionista';
      case UserRole.ODONTOLOGO:
        return 'Odontólogo';
      default:
        return rol;
    }
  }

  getRolBadgeClass(rol: UserRole): string {
    switch (rol) {
      case UserRole.ADMINISTRADOR:
        return 'bg-purple-100 text-purple-800';
      case UserRole.RECEPCIONISTA:
        return 'bg-blue-100 text-blue-800';
      case UserRole.ODONTOLOGO:
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
