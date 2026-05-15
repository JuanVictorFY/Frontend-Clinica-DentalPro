import { Component, inject, signal, OnInit, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AtencionService } from '../services/atencion.service';
import { CitaService } from '../../citas/services/cita.service';
import { Cita, EstadoCita } from '../../citas/models/cita.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-atencion-form',
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
        <h1 class="text-2xl font-bold text-white">Registrar Atención</h1>
      </div>

      @if (error()) {
        <div class="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {{ error() }}
        </div>
      }

      @if (cita()) {
        <!-- Info de la cita -->
        <div class="p-5 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3">
          <h2 class="text-sm font-semibold text-blue-400 uppercase tracking-wider">Información de la Cita</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="text-xs text-gray-400">Paciente</span>
              <p class="text-white font-medium text-sm">{{ cita()!.pacienteNombre }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-400">Odontólogo</span>
              <p class="text-white font-medium text-sm">{{ cita()!.odontologoNombre }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-400">Fecha</span>
              <p class="text-white font-medium text-sm">{{ cita()!.fecha }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-400">Hora</span>
              <p class="text-white font-medium text-sm">{{ cita()!.hora }}</p>
            </div>
            <div class="sm:col-span-2">
              <span class="text-xs text-gray-400">Motivo</span>
              <p class="text-white font-medium text-sm">{{ cita()!.motivo }}</p>
            </div>
          </div>
        </div>

        <!-- Formulario de nota clínica -->
        <form [formGroup]="notaForm" (ngSubmit)="onSubmit()" class="space-y-5 p-6 bg-gray-900 rounded-xl border border-gray-700">
          <!-- Diagnóstico -->
          <div>
            <label for="diagnostico" class="block text-sm font-medium text-gray-300 mb-1">
              Diagnóstico
            </label>
            <textarea
              id="diagnostico"
              formControlName="diagnostico"
              rows="3"
              placeholder="Describa el diagnóstico del paciente..."
              class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
              [class.border-red-500]="isFieldInvalid('diagnostico')"
              [class.border-gray-600]="!isFieldInvalid('diagnostico')"
            ></textarea>
            @if (isFieldInvalid('diagnostico')) {
              <p class="mt-1 text-sm text-red-400">El diagnóstico es obligatorio.</p>
            }
          </div>

          <!-- Tratamiento -->
          <div>
            <label for="tratamiento" class="block text-sm font-medium text-gray-300 mb-1">
              Tratamiento
            </label>
            <textarea
              id="tratamiento"
              formControlName="tratamiento"
              rows="3"
              placeholder="Describa el tratamiento realizado..."
              class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
              [class.border-red-500]="isFieldInvalid('tratamiento')"
              [class.border-gray-600]="!isFieldInvalid('tratamiento')"
            ></textarea>
            @if (isFieldInvalid('tratamiento')) {
              <p class="mt-1 text-sm text-red-400">El tratamiento es obligatorio.</p>
            }
          </div>

          <!-- Observaciones -->
          <div>
            <label for="observaciones" class="block text-sm font-medium text-gray-300 mb-1">
              Observaciones
              <span class="text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="observaciones"
              formControlName="observaciones"
              rows="3"
              placeholder="Observaciones adicionales, indicaciones post-tratamiento..."
              class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              [disabled]="notaForm.invalid || isLoading()"
              class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Finalizando...</span>
              } @else {
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Finalizar Atención</span>
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
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class AtencionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly atencionService = inject(AtencionService);
  private readonly citaService = inject(CitaService);
  private readonly toast = inject(ToastService);

  /** ID de la cita (viene de la ruta) */
  readonly citaId = input<string | undefined>(undefined);

  readonly cita = signal<Cita | null>(null);
  readonly error = signal<string>('');
  readonly isLoading = signal(false);

  /** Formulario reactivo */
  readonly notaForm: FormGroup = this.fb.group({
    diagnostico: ['', [Validators.required]],
    tratamiento: ['', [Validators.required]],
    observaciones: [''],
  });

  ngOnInit(): void {
    const id = this.citaId();
    if (!id) {
      this.error.set('No se especificó una cita válida.');
      return;
    }

    const cita = this.citaService.obtenerPorId(Number(id));
    if (!cita) {
      this.error.set('La cita no fue encontrada.');
      return;
    }

    if (cita.estado !== EstadoCita.PENDIENTE && cita.estado !== EstadoCita.REAGENDADO) {
      this.error.set(`Esta cita no puede ser atendida. Estado actual: ${cita.estado}`);
      return;
    }

    this.cita.set(cita);
  }

  /** Verifica si un campo es inválido y ha sido tocado */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.notaForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /** Maneja el envío del formulario */
  onSubmit(): void {
    if (this.notaForm.invalid) {
      this.notaForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.notaForm.value;
    this.atencionService.registrarNota({
      citaId: Number(this.citaId()),
      diagnostico: formValue.diagnostico,
      tratamiento: formValue.tratamiento,
      observaciones: formValue.observaciones ?? '',
    });

    this.isLoading.set(false);
    this.toast.success('Atención finalizada correctamente');
    this.router.navigate(['/intranet/atencion']);
  }

  /** Navega de vuelta a la lista */
  cancelar(): void {
    this.router.navigate(['/intranet/atencion']);
  }
}
