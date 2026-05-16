import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from './services/usuario.service';
import { Usuario } from './models/usuario.model';
import { UserRole } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TableSkeletonComponent } from '../../shared/components/table-skeleton/table-skeleton.component';
import { ConfirmService } from '../../shared/services/confirm.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [PaginationComponent, TableSkeletonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Usuarios</h1>
          <p class="text-gray-400 text-sm mt-1">Administración de usuarios del sistema</p>
        </div>
        <button
          (click)="navegarNuevo()"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Skeleton de carga -->
      @if (isLoading()) {
        <app-table-skeleton [columns]="5" [rows]="5" />
      } @else if (usuarios().length === 0) {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <p class="text-gray-400 text-sm">No se encontraron usuarios</p>
        </div>
      } @else {
        <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th class="px-6 py-4 font-medium">Nombre</th>
                  <th class="px-6 py-4 font-medium">Email</th>
                  <th class="px-6 py-4 font-medium">Rol</th>
                  <th class="px-6 py-4 font-medium">Estado</th>
                  <th class="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (usuario of paginatedUsuarios(); track usuario.id) {
                  <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <td class="px-6 py-4 text-gray-200 font-medium">{{ usuario.nombreCompleto }}</td>
                    <td class="px-6 py-4 text-gray-300">{{ usuario.email }}</td>
                    <td class="px-6 py-4">
                      <span [class]="getRolBadgeClass(usuario.rol)">
                        {{ usuario.rol }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      @if (usuario.activo) {
                        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Activo
                        </span>
                      } @else {
                        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          Inactivo
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <!-- Editar -->
                        <button
                          (click)="navegarEditar(usuario.id)"
                          class="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                          title="Editar usuario"
                        >
                          <svg class="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <!-- Eliminar -->
                        <button
                          (click)="onEliminar(usuario)"
                          class="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Eliminar usuario"
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
          [totalItems]="usuarios().length"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class UsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  readonly isLoading = signal(true);
  readonly usuarios = signal<Usuario[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly paginatedUsuarios = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.usuarios().slice(start, end);
  });

  ngOnInit(): void {
    // Simular carga desde API
    setTimeout(() => {
      this.usuarios.set(this.usuarioService.listar());
      this.isLoading.set(false);
    }, 600);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  getRolBadgeClass(rol: UserRole): string {
    const base = 'px-2.5 py-1 rounded-full text-xs font-medium';
    switch (rol) {
      case UserRole.ADMIN:
        return `${base} bg-purple-500/20 text-purple-400`;
      case UserRole.RECEPCIONISTA:
        return `${base} bg-blue-500/20 text-blue-400`;
      case UserRole.ODONTOLOGO:
        return `${base} bg-teal-500/20 text-teal-400`;
      default:
        return `${base} bg-gray-500/20 text-gray-400`;
    }
  }

  navegarNuevo(): void {
    this.router.navigate(['/intranet/usuarios/nuevo']);
  }

  navegarEditar(id: number): void {
    this.router.navigate(['/intranet/usuarios/editar', id]);
  }

  async onEliminar(usuario: Usuario): Promise<void> {
    const confirmado = await this.confirmService.confirm({
      title: 'Eliminar Usuario',
      message: `¿Está seguro de eliminar al usuario "${usuario.nombreCompleto}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });
    if (confirmado) {
      this.usuarioService.eliminar(usuario.id);
      this.usuarios.set(this.usuarioService.listar());
      this.currentPage.set(1);
      this.toast.success('Usuario eliminado correctamente');
    }
  }
}
