import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PacienteService } from '../services/paciente.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PacienteRequest } from '../models/paciente.model';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">
            {{ isEditMode() ? 'Editar Paciente' : 'Registrar Paciente' }}
          </h1>
          <p class="text-gray-500 mt-1">
            {{ isEditMode() ? 'Modifica los datos del paciente' : 'Completa los datos para registrar un nuevo paciente' }}
          </p>
        </div>

        @if (loadingData()) {
          <app-loading-spinner message="Cargando datos del paciente..." />
        } @else {
          @if (dniDuplicadoError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              {{ dniDuplicadoError() }}
            </div>
          }

          <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()">
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
                  @if (pacienteForm.get('nombreCompleto')?.hasError('required')) {
                    El nombre completo es obligatorio.
                  }
                </p>
              }
            </div>

            <!-- DNI -->
            <div class="mb-4">
              <label for="dni" class="block text-sm font-medium text-gray-700 mb-1">
                DNI <span class="text-red-500">*</span>
              </label>
              <input
                id="dni"
                type="text"
                formControlName="dni"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                [class.border-red-500]="showError('dni')"
                [class.border-gray-300]="!showError('dni')"
                placeholder="Ingrese DNI (8 dígitos)"
                maxlength="8"
              />
              @if (showError('dni')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (pacienteForm.get('dni')?.hasError('required')) {
                    El DNI es obligatorio.
                  } @else if (pacienteForm.get('dni')?.hasError('pattern')) {
                    El DNI debe contener exactamente 8 dígitos.
                  }
                </p>
              }
            </div>

            <!-- Fecha de Nacimiento -->
            <div class="mb-4">
              <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento <span class="text-red-500">*</span>
              </label>
              <input
                id="fechaNacimiento"
                type="date"
                formControlName="fechaNacimiento"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                [class.border-red-500]="showError('fechaNacimiento')"
                [class.border-gray-300]="!showError('fechaNacimiento')"
              />
              @if (showError('fechaNacimiento')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (pacienteForm.get('fechaNacimiento')?.hasError('required')) {
                    La fecha de nacimiento es obligatoria.
                  }
                </p>
              }
            </div>

            <!-- Teléfono -->
            <div class="mb-4">
              <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span class="text-red-500">*</span>
              </label>
              <input
                id="telefono"
                type="tel"
                formControlName="telefono"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                [class.border-red-500]="showError('telefono')"
                [class.border-gray-300]="!showError('telefono')"
                placeholder="Ingrese teléfono (9 dígitos)"
                maxlength="9"
              />
              @if (showError('telefono')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (pacienteForm.get('telefono')?.hasError('required')) {
                    El teléfono es obligatorio.
                  } @else if (pacienteForm.get('telefono')?.hasError('pattern')) {
                    El teléfono debe contener exactamente 9 dígitos.
                  }
                </p>
              }
            </div>

            <!-- Email -->
            <div class="mb-6">
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
                  @if (pacienteForm.get('email')?.hasError('required')) {
                    El correo electrónico es obligatorio.
                  } @else if (pacienteForm.get('email')?.hasError('email')) {
                    Ingrese un correo electrónico válido.
                  }
                </p>
              }
            </div>

            <!-- Botones -->
            <div class="flex items-center gap-3">
              <button
                type="submit"
                [disabled]="pacienteForm.invalid || isSubmitting()"
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
                routerLink="/intranet/pacientes"
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
export class PacienteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pacienteService = inject(PacienteService);
  private readonly notificationService = inject(NotificationService);

  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly loadingData = signal(false);
  readonly dniDuplicadoError = signal('');

  private pacienteId: number | null = null;

  pacienteForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    fechaNacimiento: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pacienteId = Number(id);
      this.isEditMode.set(true);
      this.loadPaciente(this.pacienteId);
    }
  }

  onSubmit(): void {
    if (this.pacienteForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.dniDuplicadoError.set('');

    const request: PacienteRequest = this.pacienteForm.getRawValue();

    if (this.isEditMode() && this.pacienteId !== null) {
      this.pacienteService.actualizar(this.pacienteId, request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notificationService.showSuccess('Paciente actualizado exitosamente.');
          this.router.navigate(['/intranet/pacientes']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleError(err);
        }
      });
    } else {
      this.pacienteService.registrar(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.notificationService.showSuccess('Paciente registrado exitosamente.');
          this.router.navigate(['/intranet/pacientes']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.handleError(err);
        }
      });
    }
  }

  showError(field: string): boolean {
    const control = this.pacienteForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private loadPaciente(id: number): void {
    this.loadingData.set(true);
    this.pacienteService.obtenerPorId(id).subscribe({
      next: (paciente) => {
        this.pacienteForm.patchValue({
          nombreCompleto: paciente.nombreCompleto,
          dni: paciente.dni,
          fechaNacimiento: paciente.fechaNacimiento,
          telefono: paciente.telefono,
          email: paciente.email
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.notificationService.showError('Error al cargar los datos del paciente.');
        this.router.navigate(['/intranet/pacientes']);
      }
    });
  }

  private handleError(err: any): void {
    if (err.status === 409 || err.error?.message?.toLowerCase().includes('dni')) {
      this.dniDuplicadoError.set('El DNI ingresado ya está registrado en el sistema.');
    } else {
      this.notificationService.showError('Ocurrió un error al guardar los datos. Intente nuevamente.');
    }
  }
}
