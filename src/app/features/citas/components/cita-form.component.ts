import { Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CitaService } from '../services/cita.service';
import { PacienteService } from '../../pacientes/services/paciente.service';
import { TratamientoService } from '../../tratamientos/services/tratamiento.service';
import { Paciente } from '../../pacientes/models/paciente.model';
import { Tratamiento } from '../../tratamientos/models/tratamiento.model';
import { Odontologo } from '../models/cita.model';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

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

      @if (isLoadingData()) {
        <div class="flex items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      } @else {
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
            <label class="block text-sm font-medium text-gray-300 mb-1">Odontólogo</label>
            @if (esOdontologo()) {
              <div class="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
                <span>{{ miNombre() }}</span>
                <span class="ml-auto text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Tú</span>
              </div>
            } @else {
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

          <!-- Tipo de tratamiento / consulta -->
          <div>
            <label for="tipoCita" class="block text-sm font-medium text-gray-300 mb-1">
              Tipo de tratamiento o consulta
              <span class="text-gray-500 font-normal">(opcional — rellena el motivo)</span>
            </label>
            <select
              id="tipoCita"
              (change)="onTipoChange($event)"
              class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">— Seleccionar tipo —</option>
              @for (t of tratamientos(); track t.id) {
                <option [value]="t.id + '|' + t.nombre + '|' + t.precio">
                  {{ t.nombre }} — S/ {{ t.precio.toFixed(2) }}
                </option>
              }
            </select>
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
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class CitaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly citaService = inject(CitaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly tratamientoService = inject(TratamientoService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly citaId = input<string | undefined>(undefined, { alias: 'id' });
  readonly isLoading = signal(false);
  readonly isLoadingData = signal(true);
  readonly esEdicion = signal(false);
  readonly pacientes = signal<Paciente[]>([]);
  readonly odontologos = signal<Odontologo[]>([]);
  readonly tratamientos = signal<Tratamiento[]>([]);
  private selectedTratamientoId: number | null = null;

  readonly esOdontologo = computed(() =>
    this.authService.currentUser()?.rol === UserRole.ODONTOLOGO
  );
  readonly miNombre = computed(() => this.authService.currentUser()?.nombreCompleto ?? '');
  readonly miId = computed(() => this.authService.currentUser()?.id ?? null);

  readonly citaForm: FormGroup = this.fb.group({
    pacienteId: ['', [Validators.required]],
    odontologoId: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    motivo: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.tratamientoService.listar().subscribe({
      next: (ts) => this.tratamientos.set(ts),
      error: () => {}
    });

    const id = this.citaId();
    const soyDoctor = this.esOdontologo();

    if (id) {
      this.esEdicion.set(true);
      const requests: any = {
        pacientes: this.pacienteService.listarTodos(),
        cita: this.citaService.obtenerPorId(Number(id))
      };
      if (!soyDoctor) requests['odontologos'] = this.citaService.listarOdontologos();

      forkJoin(requests).subscribe({
        next: (data: any) => {
          this.pacientes.set(data['pacientes']);
          if (!soyDoctor) this.odontologos.set(data['odontologos']);
          const cita = data['cita'];
          this.citaForm.patchValue({
            pacienteId: cita.pacienteId.toString(),
            odontologoId: soyDoctor ? this.miId()!.toString() : cita.odontologoId.toString(),
            fecha: cita.fecha,
            hora: cita.hora,
            motivo: cita.motivo,
          });
          this.isLoadingData.set(false);
        },
        error: () => {
          this.toast.error('Error al cargar los datos');
          this.isLoadingData.set(false);
        }
      });
    } else {
      const requests: any = { pacientes: this.pacienteService.listarTodos() };
      if (!soyDoctor) requests['odontologos'] = this.citaService.listarOdontologos();

      forkJoin(requests).subscribe({
        next: (data: any) => {
          this.pacientes.set(data['pacientes']);
          if (!soyDoctor) this.odontologos.set(data['odontologos']);
          this.citaForm.patchValue({
            fecha: new Date().toISOString().split('T')[0],
            ...(soyDoctor && { odontologoId: this.miId()!.toString() })
          });
          this.isLoadingData.set(false);
        },
        error: () => this.isLoadingData.set(false)
      });
    }
  }

  onTipoChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      const [id, nombre] = value.split('|');
      this.selectedTratamientoId = Number(id);
      this.citaForm.get('motivo')?.setValue(nombre);
    } else {
      this.selectedTratamientoId = null;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.citaForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

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
      tratamientoId: this.selectedTratamientoId,
    };

    const obs = this.esEdicion()
      ? this.citaService.actualizar(Number(this.citaId()), request)
      : this.citaService.crear(request);

    obs.subscribe({
      next: () => {
        this.toast.success(this.esEdicion() ? 'Cita actualizada exitosamente' : 'Cita registrada exitosamente');
        this.router.navigate(['/intranet/citas']);
      },
      error: () => {
        this.toast.error('Error al guardar la cita');
        this.isLoading.set(false);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/intranet/citas']);
  }
}

