import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

import { CitaService } from '../services/cita.service';
import { PacienteService } from '../../pacientes/services/paciente.service';
import { UsuarioService } from '../../usuarios/services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Cita } from '../models/cita.model';
import { Paciente } from '../../pacientes/models/paciente.model';
import { Usuario } from '../../usuarios/models/usuario.model';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        {{ isEditMode() ? 'Editar Cita' : 'Nueva Cita' }}
      </h1>

      @if (loadingCita()) {
        <app-loading-spinner message="Cargando datos de la cita..." />
      } @else {
        <form [formGroup]="citaForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Paciente selector con búsqueda -->
          <div>
            <label for="pacienteSearch" class="block text-sm font-medium text-gray-700 mb-1">
              Paciente <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="pacienteSearch"
                type="text"
                [formControl]="pacienteSearchControl"
                placeholder="Buscar paciente por nombre o DNI..."
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                [class.border-red-500]="citaForm.get('pacienteId')?.touched && citaForm.get('pacienteId')?.invalid"
                [class.border-gray-300]="!(citaForm.get('pacienteId')?.touched && citaForm.get('pacienteId')?.invalid)"
                autocomplete="off"
              />
              @if (searchingPacientes()) {
                <div class="absolute right-3 top-2.5">
                  <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              }
            </div>

            <!-- Dropdown de resultados -->
            @if (pacientesResults().length > 0 && showPacienteDropdown()) {
              <ul class="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                @for (paciente of pacientesResults(); track paciente.id) {
                  <li>
                    <button
                      type="button"
                      (click)="selectPaciente(paciente)"
                      class="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition"
                    >
                      <span class="font-medium">{{ paciente.nombreCompleto }}</span>
                      <span class="text-gray-500 ml-2">DNI: {{ paciente.dni }}</span>
                    </button>
                  </li>
                }
              </ul>
            }

            @if (selectedPaciente()) {
              <div class="mt-1 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-md">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>{{ selectedPaciente()!.nombreCompleto }} (DNI: {{ selectedPaciente()!.dni }})</span>
                <button type="button" (click)="clearPaciente()" class="ml-auto text-gray-400 hover:text-red-500">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            }

            @if (citaForm.get('pacienteId')?.touched && citaForm.get('pacienteId')?.invalid) {
              <p class="mt-1 text-sm text-red-600">Debe seleccionar un paciente</p>
            }
          </div>

          <!-- Odontólogo selector -->
          <div>
            <label for="odontologoId" class="block text-sm font-medium text-gray-700 mb-1">
              Odontólogo <span class="text-red-500">*</span>
            </label>
            <select
              id="odontologoId"
              formControlName="odontologoId"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              [class.border-red-500]="citaForm.get('odontologoId')?.touched && citaForm.get('odontologoId')?.invalid"
              [class.border-gray-300]="!(citaForm.get('odontologoId')?.touched && citaForm.get('odontologoId')?.invalid)"
            >
              <option value="" disabled>Seleccione un odontólogo</option>
              @for (odontologo of odontologos(); track odontologo.id) {
                <option [value]="odontologo.id">{{ odontologo.nombreCompleto }}</option>
              }
            </select>
            @if (citaForm.get('odontologoId')?.touched && citaForm.get('odontologoId')?.invalid) {
              <p class="mt-1 text-sm text-red-600">Debe seleccionar un odontólogo</p>
            }
          </div>

          <!-- Fecha -->
          <div>
            <label for="fecha" class="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span class="text-red-500">*</span>
            </label>
            <input
              id="fecha"
              type="date"
              formControlName="fecha"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              [class.border-red-500]="citaForm.get('fecha')?.touched && citaForm.get('fecha')?.invalid"
              [class.border-gray-300]="!(citaForm.get('fecha')?.touched && citaForm.get('fecha')?.invalid)"
            />
            @if (citaForm.get('fecha')?.touched && citaForm.get('fecha')?.invalid) {
              <p class="mt-1 text-sm text-red-600">La fecha es obligatoria</p>
            }
          </div>

          <!-- Hora -->
          <div>
            <label for="hora" class="block text-sm font-medium text-gray-700 mb-1">
              Hora <span class="text-red-500">*</span>
            </label>
            <input
              id="hora"
              type="time"
              formControlName="hora"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              [class.border-red-500]="citaForm.get('hora')?.touched && citaForm.get('hora')?.invalid"
              [class.border-gray-300]="!(citaForm.get('hora')?.touched && citaForm.get('hora')?.invalid)"
            />
            @if (citaForm.get('hora')?.touched && citaForm.get('hora')?.invalid) {
              <p class="mt-1 text-sm text-red-600">La hora es obligatoria</p>
            }
          </div>

          <!-- Motivo -->
          <div>
            <label for="motivo" class="block text-sm font-medium text-gray-700 mb-1">
              Motivo de consulta <span class="text-red-500">*</span>
            </label>
            <textarea
              id="motivo"
              formControlName="motivo"
              rows="3"
              placeholder="Describa el motivo de la consulta..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              [class.border-red-500]="citaForm.get('motivo')?.touched && citaForm.get('motivo')?.invalid"
              [class.border-gray-300]="!(citaForm.get('motivo')?.touched && citaForm.get('motivo')?.invalid)"
            ></textarea>
            @if (citaForm.get('motivo')?.touched && citaForm.get('motivo')?.invalid) {
              <p class="mt-1 text-sm text-red-600">El motivo es obligatorio</p>
            }
          </div>

          <!-- Conflicto de horario -->
          @if (conflictoHorario()) {
            <div class="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <svg class="h-5 w-5 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>El odontólogo ya tiene una cita programada en este horario. Seleccione otra fecha u hora.</span>
            </div>
          }

          <!-- Verificando disponibilidad -->
          @if (verificandoDisponibilidad()) {
            <div class="flex items-center gap-2 text-sm text-blue-600">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verificando disponibilidad...</span>
            </div>
          }

          <!-- Botones de acción -->
          <div class="flex items-center gap-3 pt-4">
            <button
              type="submit"
              [disabled]="citaForm.invalid || submitting() || conflictoHorario() || verificandoDisponibilidad()"
              class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (submitting()) {
                <span class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              } @else {
                {{ isEditMode() ? 'Actualizar Cita' : 'Registrar Cita' }}
              }
            </button>

            @if (isEditMode()) {
              <button
                type="button"
                (click)="showCancelDialog.set(true)"
                [disabled]="submitting()"
                class="px-6 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 focus:ring-2 focus:ring-red-300 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar Cita
              </button>
            }

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

      <!-- Diálogo de confirmación para cancelar cita -->
      @if (showCancelDialog()) {
        <app-confirm-dialog
          title="Cancelar Cita"
          message="¿Está seguro de que desea cancelar esta cita? Esta acción no se puede deshacer."
          confirmText="Sí, cancelar cita"
          cancelText="No, mantener"
          (confirm)="onConfirmCancel()"
          (cancel)="showCancelDialog.set(false)"
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
export class CitaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly citaService = inject(CitaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // Form control separado para búsqueda de pacientes (no es parte del form principal)
  readonly pacienteSearchControl = this.fb.control('');

  // Formulario reactivo principal
  readonly citaForm: FormGroup = this.fb.group({
    pacienteId: [null as number | null, [Validators.required]],
    odontologoId: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    motivo: ['', [Validators.required]]
  });

  // Signals de estado
  readonly isEditMode = signal(false);
  readonly loadingCita = signal(false);
  readonly submitting = signal(false);
  readonly searchingPacientes = signal(false);
  readonly showPacienteDropdown = signal(false);
  readonly verificandoDisponibilidad = signal(false);
  readonly conflictoHorario = signal(false);
  readonly showCancelDialog = signal(false);

  // Datos
  readonly pacientesResults = signal<Paciente[]>([]);
  readonly selectedPaciente = signal<Paciente | null>(null);
  readonly odontologos = signal<Usuario[]>([]);

  // Datos originales para detectar cambios en fecha/hora
  private originalFecha = '';
  private originalHora = '';
  private citaId: number | null = null;

  ngOnInit(): void {
    this.loadOdontologos();
    this.setupPacienteSearch();
    this.setupDisponibilidadCheck();
    this.checkEditMode();
  }

  /**
   * Carga la lista de odontólogos disponibles para el selector.
   */
  private loadOdontologos(): void {
    this.usuarioService.listarOdontologos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (odontologos) => this.odontologos.set(odontologos),
        error: () => this.notificationService.showError('Error al cargar la lista de odontólogos')
      });
  }

  /**
   * Configura la búsqueda reactiva de pacientes con debounce.
   */
  private setupPacienteSearch(): void {
    this.pacienteSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      switchMap((query) => {
        if (!query || query.trim().length < 2) {
          this.pacientesResults.set([]);
          this.showPacienteDropdown.set(false);
          return of([]);
        }
        this.searchingPacientes.set(true);
        this.showPacienteDropdown.set(true);
        return this.pacienteService.buscar(query.trim());
      })
    ).subscribe({
      next: (pacientes) => {
        this.pacientesResults.set(pacientes);
        this.searchingPacientes.set(false);
      },
      error: () => {
        this.searchingPacientes.set(false);
        this.notificationService.showError('Error al buscar pacientes');
      }
    });
  }

  /**
   * Configura la verificación automática de disponibilidad cuando cambian
   * odontólogo, fecha u hora.
   */
  private setupDisponibilidadCheck(): void {
    const odontologoControl = this.citaForm.get('odontologoId')!;
    const fechaControl = this.citaForm.get('fecha')!;
    const horaControl = this.citaForm.get('hora')!;

    // Escuchar cambios en los tres campos relevantes
    const checkDisponibilidad = () => {
      const odontologoId = odontologoControl.value;
      const fecha = fechaControl.value;
      const hora = horaControl.value;

      if (odontologoId && fecha && hora) {
        this.verificarDisponibilidad(+odontologoId, fecha, hora);
      } else {
        this.conflictoHorario.set(false);
      }
    };

    odontologoControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => checkDisponibilidad());

    fechaControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => checkDisponibilidad());

    horaControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => checkDisponibilidad());
  }

  /**
   * Verifica si el odontólogo está disponible en la fecha y hora seleccionadas.
   */
  private verificarDisponibilidad(odontologoId: number, fecha: string, hora: string): void {
    // En modo edición, si fecha y hora no cambiaron, no hay conflicto
    if (this.isEditMode() && fecha === this.originalFecha && hora === this.originalHora) {
      this.conflictoHorario.set(false);
      return;
    }

    this.verificandoDisponibilidad.set(true);
    this.conflictoHorario.set(false);

    this.citaService.verificarDisponibilidad(odontologoId, fecha, hora)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (disponible) => {
          this.conflictoHorario.set(!disponible);
          this.verificandoDisponibilidad.set(false);
        },
        error: () => {
          this.verificandoDisponibilidad.set(false);
          this.notificationService.showWarning('No se pudo verificar la disponibilidad');
        }
      });
  }

  /**
   * Detecta si estamos en modo edición (ruta con :id) y carga los datos de la cita.
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.citaId = +id;
      this.loadCita(this.citaId);
    }
  }

  /**
   * Carga los datos de una cita existente para edición.
   */
  private loadCita(id: number): void {
    this.loadingCita.set(true);

    this.citaService.obtenerPorId(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cita) => {
          this.populateForm(cita);
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
   * Rellena el formulario con los datos de la cita cargada.
   */
  private populateForm(cita: Cita): void {
    this.citaForm.patchValue({
      pacienteId: cita.pacienteId,
      odontologoId: cita.odontologoId.toString(),
      fecha: cita.fecha,
      hora: cita.hora,
      motivo: cita.motivo
    });

    // Guardar valores originales para detectar cambios
    this.originalFecha = cita.fecha;
    this.originalHora = cita.hora;

    // Mostrar paciente seleccionado
    this.selectedPaciente.set({
      id: cita.pacienteId,
      nombreCompleto: cita.pacienteNombre,
      dni: '',
      fechaNacimiento: '',
      telefono: '',
      email: ''
    });
  }

  /**
   * Selecciona un paciente del dropdown de búsqueda.
   */
  selectPaciente(paciente: Paciente): void {
    this.selectedPaciente.set(paciente);
    this.citaForm.patchValue({ pacienteId: paciente.id });
    this.pacienteSearchControl.setValue('', { emitEvent: false });
    this.pacientesResults.set([]);
    this.showPacienteDropdown.set(false);
  }

  /**
   * Limpia la selección de paciente.
   */
  clearPaciente(): void {
    this.selectedPaciente.set(null);
    this.citaForm.patchValue({ pacienteId: null });
    this.pacienteSearchControl.setValue('');
  }

  /**
   * Envía el formulario para registrar o actualizar la cita.
   */
  onSubmit(): void {
    if (this.citaForm.invalid || this.conflictoHorario()) {
      this.citaForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const request = {
      pacienteId: this.citaForm.value.pacienteId,
      odontologoId: +this.citaForm.value.odontologoId,
      fecha: this.citaForm.value.fecha,
      hora: this.citaForm.value.hora,
      motivo: this.citaForm.value.motivo
    };

    const operation = this.isEditMode()
      ? this.citaService.actualizar(this.citaId!, request)
      : this.citaService.registrar(request);

    operation
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const message = this.isEditMode()
            ? 'Cita actualizada exitosamente'
            : 'Cita registrada exitosamente';
          this.notificationService.showSuccess(message);
          this.router.navigate(['/intranet/citas']);
        },
        error: () => {
          this.submitting.set(false);
          const message = this.isEditMode()
            ? 'Error al actualizar la cita'
            : 'Error al registrar la cita';
          this.notificationService.showError(message);
        }
      });
  }

  /**
   * Confirma la cancelación de la cita (cambia estado a CANCELADO).
   */
  onConfirmCancel(): void {
    if (!this.citaId) return;

    this.showCancelDialog.set(false);
    this.submitting.set(true);

    this.citaService.cancelar(this.citaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Cita cancelada exitosamente');
          this.router.navigate(['/intranet/citas']);
        },
        error: () => {
          this.submitting.set(false);
          this.notificationService.showError('Error al cancelar la cita');
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
