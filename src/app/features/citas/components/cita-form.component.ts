import { Component, inject, signal, OnInit, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaService } from '../services/cita.service';
import { PacienteService } from '../../pacientes/services/paciente.service';
import { Paciente } from '../../pacientes/models/paciente.model';
import { Odontologo } from '../models/cita.model';

@Component({
  selector: 'app-cita-form',
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
          {{ esEdicion() ? 'Editar Cita' : 'Nueva Cita' }}
        </h1>
      </div>

      <form [formGroup]="citaForm" (ngSubmit)="onSubmit()" class="space-y-5 p-6 bg-gray-900 rounded-xl border border-gray-700">
        <!-- Paciente -->
        <div>
          <label for="pacienteId" class="block text-sm font-medium text-gray-300 mb-1">
            Paciente
          </label>
          <select
            id="pacienteId"
            formControlName="pacienteId"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('pacienteId')"
            [class.border-gray-600]="!isFieldInvalid('pacienteId')"
          >
            <option value="" disabled class="text-gray-500">Seleccione un paciente</option>
            @for (paciente of pacientes(); track paciente.id) {
              <option [value]="paciente.id">{{ paciente.nombreCompleto }}</option>
            }
          </select>
          @if (isFieldInvalid('pacienteId')) {
            <p class="mt-1 text-sm text-red-400">Debe seleccionar un paciente.</p>
          }
        </div>

        <!-- Odontólogo -->
        <div>
          <label for="odontologoId" class="block text-sm font-medium text-gray-300 mb-1">
            Odontólogo
          </label>
          <select
            id="odontologoId"
            formControlName="odontologoId"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('odontologoId')"
            [class.border-gray-600]="!isFieldInvalid('odontologoId')"
          >
            <option value="" disabled class="text-gray-500">Seleccione un odontólogo</option>
            @for (odontologo of odontologos(); track odontologo.id) {
              <option [value]="odontologo.id">{{ odontologo.nombre }}</option>
            }
          </select>
          @if (isFieldInvalid('odontologoId')) {
            <p class="mt-1 text-sm text-red-400">Debe seleccionar un odontólogo.</p>
          }
        </div>

        <!-- Fecha -->
        <div>
          <label for="fecha" class="block text-sm font-medium text-gray-300 mb-1">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            formControlName="fecha"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('fecha')"
            [class.border-gray-600]="!isFieldInvalid('fecha')"
          />
          @if (isFieldInvalid('fecha')) {
            <p class="mt-1 text-sm text-red-400">La fecha es obligatoria.</p>
          }
        </div>

        <!-- Hora -->
        <div>
          <label for="hora" class="block text-sm font-medium text-gray-300 mb-1">
            Hora
          </label>
          <input
            id="hora"
            type="time"
            formControlName="hora"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            [class.border-red-500]="isFieldInvalid('hora')"
            [class.border-gray-600]="!isFieldInvalid('hora')"
          />
          @if (isFieldInvalid('hora')) {
            <p class="mt-1 text-sm text-red-400">La hora es obligatoria.</p>
          }
        </div>

        <!-- Motivo -->
        <div>
          <label for="motivo" class="block text-sm font-medium text-gray-300 mb-1">
            Motivo
          </label>
          <textarea
            id="motivo"
            formControlName="motivo"
            rows="3"
            placeholder="Ej: Limpieza dental, control de ortodoncia..."
            class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
            [class.border-red-500]="isFieldInvalid('motivo')"
            [class.border-gray-600]="!isFieldInvalid('motivo')"
          ></textarea>
          @if (isFieldInvalid('motivo')) {
            <p class="mt-1 text-sm text-red-400">El motivo es obligatorio.</p>
          }
        </div>

        <!-- Botones -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            [disabled]="citaForm.invalid || isLoading()"
            class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
          >
            @if (isLoading()) {
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            } @else {
              <span>{{ esEdicion() ? 'Actualizar Cita' : 'Guardar Cita' }}</span>
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
export class CitaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly citaService = inject(CitaService);
  private readonly pacienteService = inject(PacienteService);

  /** ID de la cita para modo edición (viene de la ruta) */
  readonly citaId = input<string | undefined>(undefined, { alias: 'id' });

  /** Señal reactiva para controlar el estado de carga */
  readonly isLoading = signal(false);

  /** Señal para determinar si estamos en modo edición */
  readonly esEdicion = signal(false);

  /** Listas para los selectores */
  readonly pacientes = signal<Paciente[]>([]);
  readonly odontologos = signal<Odontologo[]>([]);

  /** Formulario reactivo con validaciones */
  readonly citaForm: FormGroup = this.fb.group({
    pacienteId: ['', [Validators.required]],
    odontologoId: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    motivo: ['', [Validators.required]],
  });

  ngOnInit(): void {
    // Cargar listas para selectores
    this.pacientes.set(this.pacienteService.listar());
    this.odontologos.set(this.citaService.listarOdontologos());

    const id = this.citaId();
    if (id) {
      this.esEdicion.set(true);
      const cita = this.citaService.obtenerPorId(Number(id));
      if (cita) {
        this.citaForm.patchValue({
          pacienteId: cita.pacienteId.toString(),
          odontologoId: cita.odontologoId.toString(),
          fecha: cita.fecha,
          hora: cita.hora,
          motivo: cita.motivo,
        });
      }
    } else {
      // Default fecha a hoy para nueva cita
      this.citaForm.patchValue({
        fecha: new Date().toISOString().split('T')[0]
      });
    }
  }

  /** Verifica si un campo es inválido y ha sido tocado */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.citaForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /** Maneja el envío del formulario */
  onSubmit(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.citaForm.value;
    const request = {
      pacienteId: Number(formValue.pacienteId),
      odontologoId: Number(formValue.odontologoId),
      fecha: formValue.fecha,
      hora: formValue.hora,
      motivo: formValue.motivo,
    };

    if (this.esEdicion()) {
      const id = Number(this.citaId());
      this.citaService.actualizar(id, request);
    } else {
      this.citaService.registrar(request);
    }

    this.isLoading.set(false);
    this.router.navigate(['/intranet/citas']);
  }

  /** Navega de vuelta a la lista */
  cancelar(): void {
    this.router.navigate(['/intranet/citas']);
  }
}
