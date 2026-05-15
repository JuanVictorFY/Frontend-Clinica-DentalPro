import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { AtencionService } from '../services/atencion.service';
import { CitaService } from '../../citas/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Cita } from '../../citas/models/cita.model';
import { EstadoCita } from '../../citas/models/estado-cita.model';
import { NotaClinicaRequest } from '../models/nota-clinica.model';

@Component({
  selector: 'app-atencion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Registro de Atención Médica</h1>

      @if (loadingCita()) {
        <app-loading-spinner message="Cargando datos de la cita..." />
      } @else if (cita()) {
        <!-- Información del paciente y cita -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 class="text-sm font-semibold text-blue-800 mb-2">Información de la Cita</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blue-900">
            <div>
              <span class="font-medium">Paciente:</span>
              <span class="ml-1">{{ cita()!.pacienteNombre }}</span>
            </div>
            <div>
              <span class="font-medium">Odontólogo:</span>
              <span class="ml-1">{{ cita()!.odontologoNombre }}</span>
            </div>
            <div>
              <span class="font-medium">Fecha:</span>
              <span class="ml-1">{{ cita()!.fecha }}</span>
            </div>
            <div>
              <span class="font-medium">Hora:</span>
              <span class="ml-1">{{ cita()!.hora }}</span>
            </div>
            <div class="sm:col-span-2">
              <span class="font-medium">Motivo de consulta:</span>
              <span class="ml-1">{{ cita()!.motivo }}</span>
            </div>
          </div>
        </div>

        <!-- Formulario de nota clínica -->
        <form [formGroup]="atencionForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Diagnóstico -->
          <div>
            <label for="diagnostico" class="block text-sm font-medium text-gray-700 mb-1">
              Diagnóstico <span class="text-red-500">*</span>
            </label>
            <textarea
              id="diagnostico"
              formControlName="diagnostico"
              rows="3"
              placeholder="Ingrese el diagnóstico del paciente..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              [class.border-red-500]="atencionForm.get('diagnostico')?.touched && atencionForm.get('diagnostico')?.invalid"
              [class.border-gray-300]="!(atencionForm.get('diagnostico')?.touched && atencionForm.get('diagnostico')?.invalid)"
            ></textarea>
            @if (atencionForm.get('diagnostico')?.touched && atencionForm.get('diagnostico')?.invalid) {
              <p class="mt-1 text-sm text-red-600">El diagnóstico es obligatorio</p>
            }
          </div>

          <!-- Tratamiento realizado -->
          <div>
            <label for="tratamiento" class="block text-sm font-medium text-gray-700 mb-1">
              Tratamiento realizado <span class="text-red-500">*</span>
            </label>
            <textarea
              id="tratamiento"
              formControlName="tratamiento"
              rows="3"
              placeholder="Describa el tratamiento realizado..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              [class.border-red-500]="atencionForm.get('tratamiento')?.touched && atencionForm.get('tratamiento')?.invalid"
              [class.border-gray-300]="!(atencionForm.get('tratamiento')?.touched && atencionForm.get('tratamiento')?.invalid)"
            ></textarea>
            @if (atencionForm.get('tratamiento')?.touched && atencionForm.get('tratamiento')?.invalid) {
              <p class="mt-1 text-sm text-red-600">El tratamiento es obligatorio</p>
            }
          </div>

          <!-- Observaciones -->
          <div>
            <label for="observaciones" class="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              formControlName="observaciones"
              rows="3"
              placeholder="Observaciones adicionales (opcional)..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            ></textarea>
          </div>

          <!-- Botones de acción -->
          <div class="flex items-center gap-3 pt-4">
            <button
              type="submit"
              [disabled]="atencionForm.invalid || submitting()"
              class="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-300 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (submitting()) {
                <span class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finalizando...
                </span>
              } @else {
                Finalizar atención
              }
            </button>

            <button
              type="button"
              (click)="goBack()"
              [disabled]="submitting()"
              class="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volver
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class AtencionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly atencionService = inject(AtencionService);
  private readonly citaService = inject(CitaService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // Formulario reactivo
  readonly atencionForm: FormGroup = this.fb.group({
    diagnostico: ['', [Validators.required]],
    tratamiento: ['', [Validators.required]],
    observaciones: ['']
  });

  // Signals de estado
  readonly loadingCita = signal(true);
  readonly submitting = signal(false);
  readonly cita = signal<Cita | null>(null);

  private citaId!: number;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('citaId');

    if (!idParam || isNaN(+idParam)) {
      this.notificationService.showError('ID de cita inválido');
      this.router.navigate(['/intranet/citas']);
      return;
    }

    this.citaId = +idParam;
    this.loadCita();
  }

  /**
   * Carga los datos de la cita desde la API.
   * Si el estado no es PENDIENTE o REAGENDADO, muestra error y redirige.
   */
  private loadCita(): void {
    this.loadingCita.set(true);

    this.citaService.obtenerPorId(this.citaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cita) => {
          if (cita.estado !== EstadoCita.PENDIENTE && cita.estado !== EstadoCita.REAGENDADO) {
            this.notificationService.showError(
              'Solo se puede registrar atención para citas con estado pendiente o reagendado'
            );
            this.router.navigate(['/intranet/citas']);
            return;
          }

          this.cita.set(cita);
          this.loadingCita.set(false);
        },
        error: () => {
          this.loadingCita.set(false);
          this.notificationService.showError('Error al cargar los datos de la cita');
          this.router.navigate(['/intranet/citas']);
        }
      });
  }

  /**
   * Envía la nota clínica y finaliza la atención.
   * Primero registra la nota clínica, luego cambia el estado a ATENDIDO.
   * Si hay error, mantiene los datos en el formulario.
   */
  onSubmit(): void {
    if (this.atencionForm.invalid) {
      this.atencionForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const request: NotaClinicaRequest = {
      citaId: this.citaId,
      diagnostico: this.atencionForm.value.diagnostico.trim(),
      tratamiento: this.atencionForm.value.tratamiento.trim(),
      observaciones: this.atencionForm.value.observaciones?.trim() || ''
    };

    this.atencionService.registrarNotaClinica(request)
      .pipe(
        switchMap(() => this.atencionService.finalizarAtencion(this.citaId)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Atención finalizada exitosamente');
          this.router.navigate(['/intranet/citas']);
        },
        error: () => {
          this.submitting.set(false);
          this.notificationService.showError(
            'Error al finalizar la atención. Los datos se mantienen en el formulario.'
          );
        }
      });
  }

  /**
   * Navega de vuelta a la lista de citas.
   */
  goBack(): void {
    this.router.navigate(['/intranet/citas']);
  }
}
