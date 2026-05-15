import { Component, inject, signal, OnInit, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { UserRole } from '../../../core/models/user.model';

/**
 * Componente de formulario reactivo para registrar/editar usuarios.
 * Soporta modo creación y edición según la presencia de usuarioId.
 */
@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header con botón volver -->
      <div class="flex items-center gap-4">
        <button
          (click)="cancelar()"
          class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          title="Volver"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-white">
          {{ esEdicion() ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h1>
      </div>

      <form [formGroup]="usuarioForm" (ngSubmit)="onSubmit()" class="space-y-5 p-6 bg-gray-900 rounded-xl border border-gray-700">
        <!-- Nombre Completo -->
        <div>
          <label for="nombreCompleto" class="block text-sm font-medium text-gray-300 mb-1">
            Nombre Completo
          </label>
          <input
            id="nombreCompleto"
            type="text"
            formControlName="nombreCompleto"
            placeholder="Ej: Dr. Juan Pérez García"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('nombreCompleto')"
            [class.border-gray-600]="!isFieldInvalid('nombreCompleto')"
          />
          @if (isFieldInvalid('nombreCompleto')) {
            <p class="mt-1 text-sm text-red-400">El nombre completo es obligatorio.</p>
          }
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-1">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            placeholder="Ej: usuario@dentalpro.com"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('email')"
            [class.border-gray-600]="!isFieldInvalid('email')"
          />
          @if (isFieldInvalid('email')) {
            <p class="mt-1 text-sm text-red-400">Ingrese un correo electrónico válido.</p>
          }
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            [placeholder]="esEdicion() ? 'Dejar vacío para no cambiar' : 'Ingrese la contraseña'"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('password')"
            [class.border-gray-600]="!isFieldInvalid('password')"
          />
          @if (isFieldInvalid('password')) {
            <p class="mt-1 text-sm text-red-400">La contraseña es obligatoria.</p>
          }
          @if (esEdicion()) {
            <p class="mt-1 text-xs text-gray-500">Dejar vacío para mantener la contraseña actual.</p>
          }
        </div>

        <!-- Rol -->
        <div>
          <label for="rol" class="block text-sm font-medium text-gray-300 mb-1">
            Rol
          </label>
          <select
            id="rol"
            formControlName="rol"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('rol')"
            [class.border-gray-600]="!isFieldInvalid('rol')"
          >
            <option value="" disabled>Seleccione un rol</option>
            <option value="ADMIN">Administrador</option>
            <option value="RECEPCIONISTA">Recepcionista</option>
            <option value="ODONTOLOGO">Odontólogo</option>
          </select>
          @if (isFieldInvalid('rol')) {
            <p class="mt-1 text-sm text-red-400">Debe seleccionar un rol.</p>
          }
        </div>

        <!-- Botones -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            [disabled]="usuarioForm.invalid || isLoading()"
            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
          >
            @if (isLoading()) {
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            } @else {
              <span>{{ esEdicion() ? 'Actualizar Usuario' : 'Guardar Usuario' }}</span>
            }
          </button>
          <button
            type="button"
            (click)="cancelar()"
            class="px-6 py-3 rounded-lg font-medium text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class UsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);

  /** ID del usuario para modo edición (viene de la ruta) */
  readonly usuarioId = input<string | undefined>(undefined, { alias: 'id' });

  /** Señal reactiva para controlar el estado de carga */
  readonly isLoading = signal(false);

  /** Señal para determinar si estamos en modo edición */
  readonly esEdicion = signal(false);

  /** Formulario reactivo con validaciones */
  readonly usuarioForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rol: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.usuarioId();
    if (id) {
      this.esEdicion.set(true);
      // En modo edición, la contraseña no es obligatoria
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();

      const usuario = this.usuarioService.obtenerPorId(Number(id));
      if (usuario) {
        this.usuarioForm.patchValue({
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          rol: usuario.rol,
        });
      }
    }
  }

  /** Verifica si un campo es inválido y ha sido tocado */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.usuarioForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /** Maneja el envío del formulario */
  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const datos = this.usuarioForm.value;

    if (this.esEdicion()) {
      const id = Number(this.usuarioId());
      this.usuarioService.actualizar(id, datos);
    } else {
      this.usuarioService.registrar(datos);
    }

    this.isLoading.set(false);
    this.router.navigate(['/intranet/usuarios']);
  }

  /** Navega de vuelta a la lista */
  cancelar(): void {
    this.router.navigate(['/intranet/usuarios']);
  }
}
