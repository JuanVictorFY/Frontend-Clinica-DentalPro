import { Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PacienteService } from '../services/paciente.service';
import { CitaService } from '../../citas/services/cita.service';
import { AtencionService } from '../../atencion/services/atencion.service';
import { HistorialClinicoService } from '../services/historial-clinico.service';
import { Paciente } from '../models/paciente.model';
import { HistorialClinico } from '../models/historial-clinico.model';
import { Cita, EstadoCita } from '../../citas/models/cita.model';
import { NotaClinica } from '../../atencion/models/atencion.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button
          (click)="volverLista()"
          class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          title="Volver a la lista"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-white">Historial Clinico</h1>
        <div class="ml-auto">
          <button
            (click)="editarPaciente()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Editar paciente
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      } @else if (paciente()) {

        <!-- Datos personales -->
        <div class="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 class="text-lg font-semibold text-white mb-4">Datos del Paciente</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Nombre completo</p>
              <p class="text-white font-medium mt-1">{{ paciente()!.nombreCompleto }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">DNI</p>
              <p class="text-white font-medium mt-1">{{ paciente()!.dni }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Fecha de nacimiento</p>
              <p class="text-white font-medium mt-1">{{ paciente()!.fechaNacimiento }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Telefono</p>
              <p class="text-white font-medium mt-1">{{ paciente()!.telefono }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Email</p>
              <p class="text-white font-medium mt-1">{{ paciente()!.email }}</p>
            </div>
          </div>
        </div>

        <!-- Ficha Médica -->
        <div class="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">Ficha Médica</h2>
            @if (!editandoHistorial()) {
              <button
                (click)="iniciarEdicionHistorial()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
                Editar ficha
              </button>
            }
          </div>

          @if (editandoHistorial()) {
            <form [formGroup]="historialForm" (ngSubmit)="guardarHistorial()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-400 uppercase tracking-wider mb-1">Grupo Sanguíneo</label>
                  <input
                    type="text"
                    formControlName="grupoSanguineo"
                    placeholder="Ej: O+, A-, B+"
                    class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 uppercase tracking-wider mb-1">Alergias</label>
                  <textarea
                    formControlName="alergias"
                    rows="2"
                    placeholder="Ej: Penicilina, látex..."
                    class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-xs text-gray-400 uppercase tracking-wider mb-1">Condiciones Médicas</label>
                  <textarea
                    formControlName="condicionesMedicas"
                    rows="2"
                    placeholder="Ej: Diabetes, hipertensión..."
                    class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-xs text-gray-400 uppercase tracking-wider mb-1">Medicamentos Actuales</label>
                  <textarea
                    formControlName="medicamentosActuales"
                    rows="2"
                    placeholder="Ej: Metformina, enalapril..."
                    class="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  ></textarea>
                </div>
              </div>
              <div class="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  [disabled]="guardandoHistorial()"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  @if (guardandoHistorial()) {
                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  }
                  Guardar
                </button>
                <button
                  type="button"
                  (click)="cancelarEdicionHistorial()"
                  class="px-4 py-2 rounded-lg text-gray-300 border border-gray-600 hover:bg-gray-800 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider">Grupo sanguíneo</p>
                <p class="text-white font-medium mt-1">{{ historial()?.grupoSanguineo || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider">Alergias</p>
                <p class="text-white text-sm mt-1">{{ historial()?.alergias || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider">Condiciones médicas</p>
                <p class="text-white text-sm mt-1">{{ historial()?.condicionesMedicas || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider">Medicamentos</p>
                <p class="text-white text-sm mt-1">{{ historial()?.medicamentosActuales || '—' }}</p>
              </div>
            </div>
            @if (historial()?.fechaActualizacion) {
              <p class="text-xs text-gray-500 mt-4">Última actualización: {{ historial()!.fechaActualizacion }}</p>
            }
          }
        </div>

        <!-- Indicadores resumen -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 bg-gray-800 rounded-xl border border-gray-700 text-center">
            <p class="text-2xl font-bold text-white">{{ totalCitas() }}</p>
            <p class="text-sm text-gray-400 mt-1">Total citas</p>
          </div>
          <div class="p-4 bg-gray-800 rounded-xl border border-gray-700 text-center">
            <p class="text-2xl font-bold text-white">{{ totalNotas() }}</p>
            <p class="text-sm text-gray-400 mt-1">Notas clinicas</p>
          </div>
          <div class="p-4 bg-gray-800 rounded-xl border border-gray-700 text-center">
            <p class="text-2xl font-bold text-white">{{ ultimaCita() || 'Sin citas' }}</p>
            <p class="text-sm text-gray-400 mt-1">Ultima cita</p>
          </div>
        </div>

        <!-- Historial de Citas -->
        <div class="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 class="text-lg font-semibold text-white mb-4">Historial de Citas</h2>
          @if (citas().length === 0) {
            <div class="flex flex-col items-center justify-center py-8 gap-3">
              <svg class="w-10 h-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <p class="text-gray-400 text-sm">Este paciente no tiene citas registradas</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th class="px-4 py-3 font-medium">Fecha</th>
                    <th class="px-4 py-3 font-medium">Hora</th>
                    <th class="px-4 py-3 font-medium">Odontologo</th>
                    <th class="px-4 py-3 font-medium">Motivo</th>
                    <th class="px-4 py-3 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cita of citas(); track cita.id) {
                    <tr class="border-t border-gray-700 hover:bg-gray-800/70 transition-colors">
                      <td class="px-4 py-3 text-gray-200">{{ cita.fecha }}</td>
                      <td class="px-4 py-3 text-gray-300">{{ cita.hora }}</td>
                      <td class="px-4 py-3 text-gray-300">{{ cita.odontologoNombre }}</td>
                      <td class="px-4 py-3 text-gray-300">{{ cita.motivo }}</td>
                      <td class="px-4 py-3 text-center">
                        <span [class]="getBadgeClass(cita.estado)">
                          {{ cita.estado }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Notas Clínicas -->
        <div class="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 class="text-lg font-semibold text-white mb-4">Notas Clinicas</h2>
          @if (notas().length === 0) {
            <div class="flex flex-col items-center justify-center py-8 gap-3">
              <svg class="w-10 h-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p class="text-gray-400 text-sm">Este paciente no tiene notas clinicas registradas</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (nota of notas(); track nota.id) {
                <div class="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-400">{{ nota.fecha }}</span>
                    <span class="text-sm text-gray-400">{{ nota.odontologoNombre }}</span>
                  </div>
                  <div class="space-y-2">
                    <div>
                      <p class="text-xs text-gray-400 uppercase tracking-wider">Diagnostico</p>
                      <p class="text-white text-sm mt-0.5">{{ nota.diagnostico }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-400 uppercase tracking-wider">Tratamiento</p>
                      <p class="text-white text-sm mt-0.5">{{ nota.tratamiento }}</p>
                    </div>
                    @if (nota.observaciones) {
                      <div>
                        <p class="text-xs text-gray-400 uppercase tracking-wider">Observaciones</p>
                        <p class="text-white text-sm mt-0.5">{{ nota.observaciones }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

      } @else {
        <div class="flex flex-col items-center justify-center py-12 gap-3">
          <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <p class="text-gray-400">Paciente no encontrado</p>
          <button
            (click)="volverLista()"
            class="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Volver a la lista
          </button>
        </div>
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class PacienteDetalleComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly citaService = inject(CitaService);
  private readonly atencionService = inject(AtencionService);
  private readonly historialService = inject(HistorialClinicoService);
  private readonly toast = inject(ToastService);

  readonly id = input<string>('');

  readonly isLoading = signal(true);
  readonly paciente = signal<Paciente | undefined>(undefined);
  readonly citas = signal<Cita[]>([]);
  readonly notas = signal<NotaClinica[]>([]);
  readonly historial = signal<HistorialClinico | undefined>(undefined);
  readonly editandoHistorial = signal(false);
  readonly guardandoHistorial = signal(false);

  readonly historialForm: FormGroup = this.fb.group({
    grupoSanguineo: [''],
    alergias: [''],
    condicionesMedicas: [''],
    medicamentosActuales: ['']
  });

  readonly totalCitas = computed(() => this.citas().length);
  readonly totalNotas = computed(() => this.notas().length);
  readonly ultimaCita = computed(() => {
    const lista = this.citas();
    return lista.length > 0 ? lista[0].fecha : '';
  });

  ngOnInit(): void {
    const pacienteId = Number(this.id());
    if (!pacienteId) {
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      paciente: this.pacienteService.obtenerPorId(pacienteId),
      citas: this.citaService.listarPorPaciente(pacienteId),
      notas: this.atencionService.listarPorPaciente(pacienteId),
      historial: this.historialService.obtener(pacienteId)
    }).subscribe({
      next: ({ paciente, citas, notas, historial }) => {
        this.paciente.set(paciente);
        this.citas.set(citas);
        this.notas.set(notas);
        this.historial.set(historial);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  iniciarEdicionHistorial(): void {
    const h = this.historial();
    this.historialForm.patchValue({
      grupoSanguineo: h?.grupoSanguineo ?? '',
      alergias: h?.alergias ?? '',
      condicionesMedicas: h?.condicionesMedicas ?? '',
      medicamentosActuales: h?.medicamentosActuales ?? ''
    });
    this.editandoHistorial.set(true);
  }

  cancelarEdicionHistorial(): void {
    this.editandoHistorial.set(false);
  }

  guardarHistorial(): void {
    this.guardandoHistorial.set(true);
    const pacienteId = Number(this.id());
    this.historialService.guardar(pacienteId, this.historialForm.value).subscribe({
      next: (resultado) => {
        this.historial.set(resultado);
        this.editandoHistorial.set(false);
        this.guardandoHistorial.set(false);
        this.toast.success('Ficha médica actualizada');
      },
      error: () => {
        this.guardandoHistorial.set(false);
        this.toast.error('Error al guardar la ficha médica');
      }
    });
  }

  getBadgeClass(estado: EstadoCita): string {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case EstadoCita.PENDIENTE:  return `${base} bg-yellow-500/20 text-yellow-400`;
      case EstadoCita.ATENDIDO:   return `${base} bg-green-500/20 text-green-400`;
      case EstadoCita.CANCELADO:  return `${base} bg-red-500/20 text-red-400`;
      case EstadoCita.REAGENDADO: return `${base} bg-blue-500/20 text-blue-400`;
      default: return base;
    }
  }

  volverLista(): void {
    this.router.navigate(['/intranet/pacientes']);
  }

  editarPaciente(): void {
    this.router.navigate(['/intranet/pacientes/editar', this.id()]);
  }
}


