import { Component, inject, signal, OnInit, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService } from '../services/paciente.service';
import { ToastService } from '../../../shared/services/toast.service';

/**
 * Componente de formulario reactivo para registrar/editar pacientes.
 * Soporta modo creación y edición según la presencia de pacienteId.
 */
@Component({
  selector: 'app-paciente-form',
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
          {{ esEdicion() ? 'Editar Paciente' : 'Nuevo Paciente' }}
        </h1>
      </div>

      <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()" class="space-y-5 p-6 bg-gray-900 rounded-xl border border-gray-700">
        <!-- Nombre Completo -->
        <div>
          <label for="nombreCompleto" class="block text-sm font-medium text-gray-300 mb-1">
            Nombre Completo
          </label>
          <input
            id="nombreCompleto"
            type="text"
            formControlName="nombreCompleto"
            placeholder="Ej: Juan Pérez García"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('nombreCompleto')"
            [class.border-gray-600]="!isFieldInvalid('nombreCompleto')"
          />
          @if (isFieldInvalid('nombreCompleto')) {
            <p class="mt-1 text-sm text-red-400">El nombre completo es obligatorio.</p>
          }
        </div>

        <!-- DNI -->
        <div>
          <label for="dni" class="block text-sm font-medium text-gray-300 mb-1">
            DNI
          </label>
          <input
            id="dni"
            type="text"
            formControlName="dni"
            placeholder="Ej: 12345678"
            maxlength="8"
            (blur)="validarDniDuplicado()"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('dni') || dniDuplicado()"
            [class.border-gray-600]="!isFieldInvalid('dni') && !dniDuplicado()"
          />
          @if (isFieldInvalid('dni')) {
            <p class="mt-1 text-sm text-red-400">El DNI debe tener exactamente 8 dígitos numéricos.</p>
          }
          @if (dniDuplicado()) {
            <p class="mt-1 text-sm text-red-400">Este DNI ya está registrado</p>
          }
        </div>

        <!-- Fecha de Nacimiento -->
        <div>
          <label for="fechaNacimiento" class="block text-sm font-medium text-gray-300 mb-1">
            Fecha de Nacimiento
          </label>
          <input
            id="fechaNacimiento"
            type="date"
            formControlName="fechaNacimiento"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('fechaNacimiento')"
            [class.border-gray-600]="!isFieldInvalid('fechaNacimiento')"
          />
          @if (isFieldInvalid('fechaNacimiento')) {
            <p class="mt-1 text-sm text-red-400">La fecha de nacimiento es obligatoria.</p>
          }
        </div>

        <!-- Teléfono -->
        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-300 mb-1">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            formControlName="telefono"
            placeholder="Ej: 987654321"
            maxlength="9"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('telefono')"
            [class.border-gray-600]="!isFieldInvalid('telefono')"
          />
          @if (isFieldInvalid('telefono')) {
            <p class="mt-1 text-sm text-red-400">El teléfono debe tener exactamente 9 dígitos numéricos.</p>
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
            placeholder="Ej: paciente@correo.com"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('email')"
            [class.border-gray-600]="!isFieldInvalid('email')"
          />
          @if (isFieldInvalid('email')) {
            <p class="mt-1 text-sm text-red-400">Ingrese un correo electrónico válido.</p>
          }
        </div>

        <!-- Botones -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            [disabled]="pacienteForm.invalid || isLoading() || dniDuplicado()"
            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
          >
            @if (isLoading()) {
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            } @else {
              <span>{{ esEdicion() ? 'Actualizar Paciente' : 'Guardar Paciente' }}</span>
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
export class PacienteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly pacienteService = inject(PacienteService);
  private readonly toast = inject(ToastService);

  /** ID del paciente para modo edición (viene de la ruta) */
  readonly pacienteId = input<string | undefined>(undefined, { alias: 'id' });

  /** Señal reactiva para controlar el estado de carga */
  readonly isLoading = signal(false);

  /** Señal para determinar si estamos en modo edición */
  readonly esEdicion = signal(false);

  /** Señal para indicar si el DNI está duplicado */
  readonly dniDuplicado = signal(false);

  /** Formulario reactivo con validaciones */
  readonly pacienteForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    fechaNacimiento: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const id = this.pacienteId();
    if (id) {
      this.esEdicion.set(true);
      const paciente = this.pacienteService.obtenerPorId(Number(id));
      if (paciente) {
        this.pacienteForm.patchValue({
          nombreCompleto: paciente.nombreCompleto,
          dni: paciente.dni,
          fechaNacimiento: paciente.fechaNacimiento,
          telefono: paciente.telefono,
          email: paciente.email,
        });
      }
    }
  }

  /** Verifica si un campo es inválido y ha sido tocado */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.pacienteForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /** Valida si el DNI ya existe al perder el foco */
  validarDniDuplicado(): void {
    const dniControl = this.pacienteForm.get('dni');
    if (!dniControl || dniControl.invalid) {
      this.dniDuplicado.set(false);
      return;
    }
    const dni = dniControl.value;
    const excludeId = this.esEdicion() ? Number(this.pacienteId()) : undefined;
    this.dniDuplicado.set(this.pacienteService.existeDni(dni, excludeId));
  }

  /** Maneja el envío del formulario */
  onSubmit(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    const datos = this.pacienteForm.value;
    const excludeId = this.esEdicion() ? Number(this.pacienteId()) : undefined;

    // Validar DNI duplicado antes de guardar
    if (this.pacienteService.existeDni(datos.dni, excludeId)) {
      this.dniDuplicado.set(true);
      this.toast.error('Ya existe un paciente con ese DNI');
      return;
    }

    this.isLoading.set(true);

    if (this.esEdicion()) {
      const id = Number(this.pacienteId());
      this.pacienteService.actualizar(id, datos);
      this.toast.success('Paciente actualizado exitosamente');
    } else {
      this.pacienteService.registrar(datos);
      this.toast.success('Paciente registrado exitosamente');
    }

    this.isLoading.set(false);
    this.router.navigate(['/intranet/pacientes']);
  }

  /** Navega de vuelta a la lista */
  cancelar(): void {
    this.router.navigate(['/intranet/pacientes']);
  }
}
