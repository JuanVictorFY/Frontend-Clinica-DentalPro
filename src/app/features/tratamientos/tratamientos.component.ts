import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TratamientoService } from './services/tratamiento.service';
import { Tratamiento } from './models/tratamiento.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';

@Component({
  selector: 'app-tratamientos',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Catálogo de Tratamientos</h1>
          <p class="text-gray-400 text-sm mt-1">Gestión de tratamientos y precios</p>
        </div>
        @if (!mostrarFormulario()) {
          <button
            (click)="abrirFormulario()"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Tratamiento
          </button>
        }
      </div>

      <!-- Formulario -->
      @if (mostrarFormulario()) {
        <div class="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 class="text-lg font-semibold text-white mb-4">
            {{ editandoId() ? 'Editar Tratamiento' : 'Nuevo Tratamiento' }}
          </h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
              <input type="text" formControlName="nombre" placeholder="Ej: Limpieza dental"
                class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="isInvalid('nombre')" [class.border-gray-600]="!isInvalid('nombre')" />
              @if (isInvalid('nombre')) { <p class="mt-1 text-sm text-red-400">El nombre es obligatorio.</p> }
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
              <textarea formControlName="descripcion" rows="2" placeholder="Descripción del tratamiento..."
                class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Precio (S/.)</label>
              <input type="number" formControlName="precio" min="0" step="0.01" placeholder="0.00"
                class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="isInvalid('precio')" [class.border-gray-600]="!isInvalid('precio')" />
              @if (isInvalid('precio')) { <p class="mt-1 text-sm text-red-400">El precio es obligatorio.</p> }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Duración (minutos)</label>
              <input type="number" formControlName="duracionMinutos" min="1" placeholder="45"
                class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="isInvalid('duracionMinutos')" [class.border-gray-600]="!isInvalid('duracionMinutos')" />
              @if (isInvalid('duracionMinutos')) { <p class="mt-1 text-sm text-red-400">La duración es obligatoria.</p> }
            </div>
            <div class="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" [disabled]="form.invalid || guardando()"
                class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50">
                @if (guardando()) {
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                }
                {{ editandoId() ? 'Actualizar' : 'Guardar' }}
              </button>
              <button type="button" (click)="cerrarFormulario()"
                class="px-5 py-2.5 rounded-lg text-gray-300 border border-gray-600 hover:bg-gray-800 text-sm font-medium transition-colors cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Tabla -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      } @else if (tratamientos().length === 0) {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <p class="text-gray-400 text-sm">No hay tratamientos registrados</p>
        </div>
      } @else {
        <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th class="px-6 py-4 font-medium">Nombre</th>
                  <th class="px-6 py-4 font-medium">Descripción</th>
                  <th class="px-6 py-4 font-medium text-right">Precio</th>
                  <th class="px-6 py-4 font-medium text-center">Duración</th>
                  <th class="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (t of tratamientos(); track t.id) {
                  <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <td class="px-6 py-4 text-gray-200 font-medium">{{ t.nombre }}</td>
                    <td class="px-6 py-4 text-gray-400 max-w-xs truncate">{{ t.descripcion }}</td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-emerald-400 font-semibold">S/. {{ t.precio.toFixed(2) }}</span>
                    </td>
                    <td class="px-6 py-4 text-center text-gray-300">{{ t.duracionMinutos }} min</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <button (click)="editar(t)"
                          class="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer" title="Editar">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
                          </svg>
                        </button>
                        <button (click)="eliminar(t)"
                          class="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Eliminar">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
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
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class TratamientosComponent implements OnInit {
  private readonly service = inject(TratamientoService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  readonly isLoading = signal(true);
  readonly guardando = signal(false);
  readonly mostrarFormulario = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly tratamientos = signal<Tratamiento[]>([]);

  readonly form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [null, [Validators.required, Validators.min(0)]],
    duracionMinutos: [null, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirFormulario(): void {
    this.form.reset();
    this.editandoId.set(null);
    this.mostrarFormulario.set(true);
  }

  editar(t: Tratamiento): void {
    this.editandoId.set(t.id);
    this.form.patchValue({ nombre: t.nombre, descripcion: t.descripcion, precio: t.precio, duracionMinutos: t.duracionMinutos });
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const id = this.editandoId();
    const obs = id
      ? this.service.actualizar(id, this.form.value)
      : this.service.crear(this.form.value);

    obs.subscribe({
      next: () => {
        this.toast.success(id ? 'Tratamiento actualizado' : 'Tratamiento creado');
        this.cerrarFormulario();
        this.cargar();
        this.guardando.set(false);
      },
      error: () => { this.toast.error('Error al guardar'); this.guardando.set(false); }
    });
  }

  async eliminar(t: Tratamiento): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'Eliminar tratamiento',
      message: `¿Eliminar "${t.nombre}"?`,
      confirmText: 'Eliminar',
      type: 'danger'
    });
    if (!ok) return;
    this.service.eliminar(t.id).subscribe({
      next: () => { this.toast.success('Tratamiento eliminado'); this.cargar(); },
      error: () => this.toast.error('Error al eliminar')
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  private cargar(): void {
    this.isLoading.set(true);
    this.service.listar().subscribe({
      next: (data) => { this.tratamientos.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }
}

