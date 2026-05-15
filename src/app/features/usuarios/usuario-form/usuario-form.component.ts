import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UsuarioService } from '../services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { UsuarioRequest } from '../models/usuario.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">
            {{ isEditMode() ? 'Editar Usuario' : 'Registrar Usuario' }}
          </h1>
          <p class="text-gray-500 mt-1">
            {{ isEditMode() ? 'Modifica los datos del usuario' : 'Completa los datos para registrar un nuevo usuario' }}
          </p>
        </div>

        @if (loadingData()) {
          <app-loading-spinner message="Cargando datos del usuario..." />
        } @else {
          @if (emailDuplicadoError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              {{ emailDuplicadoError() }}
            </div>
          }

          <form [formGroup]="usuarioForm" (ngSubmit)="onSubmit()">
            <!-- Nombre Completo -->
            <div class="mb-4">
              <label for="nombreCompleto" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <input
                id="nombreCompleto"
                type="text"
                formControlName="nombreCompleto"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                [class.border-red-500]="showError('nombreCompleto')"
                [class.border-gray-300]="!showError('nombreCompleto')"
                placeholder="Ingrese nombre completo"
              />
              @if (showError('nombreCompleto')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (usuarioForm.get('nombreCompleto')?.hasError('required')) {
                    El nombre completo es obligatorio.
                  }
                </p>
              }
            </div>

            <!-- Email -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                [class.border-red-500]="showError('email')"
                [class.border-gray-300]="!showError('email')"
                placeholder="correo@ejemplo.com"
              />
              @if (showError('email')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (usuarioForm.get('email')?.hasError('required')) {
                    El correo electrónico es obligatorio.
                  } @else if (usuarioForm.get('email')?.hasError('email')) {
                    Ingrese un correo electrónico válido.
                  }
                </p>
              }
            </div>

            <!-- Contraseña -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
                @if (!isEditMode()) {
                  <span class="text-red-500">*</span>
                } @else {
                  <span class="text-gray-400 text-xs ml-1">(dejar vacío para no cambiar)</span>
                }
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                [class.border-red-500]="showError('password')"
                [class.border-gray-300]="!showError('password')"
                placeholder="{{ isEditMode() ? 'Nueva contraseña (opcional)' : 'Ingrese contraseña' }}"
              />
              @if (showError('password')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (usuarioForm.get('password')?.hasError('required')) {
                    La contraseña es obligatoria.
                  } @else if (usuarioForm.get('password')?.hasError('minlength')) {
                    La contraseña debe tener al menos 6 caracteres.
                  }
                </p>
              }
            </div>

            <!-- Rol -->
            <div class="mb-6">
              <label for="rol" class="block text-sm font-medium text-gray-700 mb-1">
                Rol <span class="text-red-500">*</span>
              </label>
              <select
                id="rol"
                formControlName="rol"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                [class.border-red-500]="showError('rol')"
                [class.border-gray-300]="!showError('rol')"
              >
                <option value="" disabled>Seleccione un rol</option>
                @for (role of roles; track role.value) {
                  <option [value]="role.value">{{ role.label }}</option>
                }
              </select>
              @if (showError('rol')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (usuarioForm.get('rol')?.hasError('required')) {
                    El rol es obligatorio.
                  }
                </p>
              }
            </div>

            <!-- Botones -->
            <div class="flex items-center gap-3">
              <button
                type="submit"
                [disabled]="usuarioForm.invalid || isSubmitting()"
                class="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                } @else {
                  {{ isEditMode() ? 'Actualizar' : 'Registrar' }}
                }
              </button>

              <a
                routerLink="/intranet/usuarios"
                class="flex-1 py-2.5 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-100 transition text-center"
              >
                Cancelar
              </a>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class UsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);

  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly loadingData = signal(false);
  readonly emailDuplicadoError = signal('');

  private usuarioId: number | null = null;

  readonly roles = [
    { value: UserRole.ADMINISTRADOR, label: 'Administrador' },
    { value: UserRole.RECEPCIONISTA, label: 'Recepcionista' },
    { value: UserRole.ODONTOLOGO, label: 'Odontólogo' }
  ];

  usuarioForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioId = Number(id);
      this.isEditMode.set(true);
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.usuarioForm.get('password')?.updateValueAndValidity();
      this.loadUsuario(this.usuarioId);
    }
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.emailDuplicadoError.set('');

    const formValue = this.usuarioForm.getRawValue();
    const request: UsuarioRequest = {
      nombreCompleto: formValue.nombreCompleto,
      email: formValue.email,
      password: formValue.password,
      rol: formValue.rol
    };

    if (this.isEditMode() && this.usuarioId !== null) {
      this.usuarioService.actualizar(this.usuarioId, request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notificationService.showSuccess('Usuario actualizado exitosamente.');
          this.router.navigate(['/intranet/usuarios']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleError(err);
        }
      });
    } else {
      this.usuarioService.registrar(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notificationService.showSuccess('Usuario registrado exitosamente.');
          this.router.navigate(['/intranet/usuarios']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleError(err);
        }
      });
    }
  }

  showError(field: string): boolean {
    const control = this.usuarioForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private loadUsuario(id: number): void {
    this.loadingData.set(true);
    this.usuarioService.obtenerPorId(id).subscribe({
      next: (usuario) => {
        this.usuarioForm.patchValue({
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          rol: usuario.rol
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.notificationService.showError('Error al cargar los datos del usuario.');
        this.router.navigate(['/intranet/usuarios']);
      }
    });
  }

  private handleError(err: any): void {
    if (err.status === 409) {
      this.emailDuplicadoError.set('El correo electrónico ingresado ya está registrado en el sistema.');
    } else {
      this.notificationService.showError('Ocurrió un error al guardar los datos. Intente nuevamente.');
    }
  }
}
