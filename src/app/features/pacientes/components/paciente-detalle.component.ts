import { Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { PacienteService } from '../services/paciente.service';
import { CitaService } from '../../citas/services/cita.service';
import { AtencionService } from '../../atencion/services/atencion.service';
import { Paciente } from '../models/paciente.model';
import { Cita, EstadoCita } from '../../citas/models/cita.model';
import { NotaClinica } from '../../atencion/models/atencion.model';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- Header con botones -->
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

      @if (paciente()) {
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
  private readonly pacienteService = inject(PacienteService);
  private readonly citaService = inject(CitaService);
  private readonly atencionService = inject(AtencionService);

  /** ID del paciente desde la ruta */
  readonly id = input<string>('');

  readonly paciente = signal<Paciente | undefined>(undefined);
  readonly citas = signal<Cita[]>([]);
  readonly notas = signal<NotaClinica[]>([]);

  readonly totalCitas = computed(() => this.citas().length);
  readonly totalNotas = computed(() => this.notas().length);
  readonly ultimaCita = computed(() => {
    const lista = this.citas();
    if (lista.length === 0) return '';
    return lista[0].fecha;
  });

  ngOnInit(): void {
    const pacienteId = Number(this.id());
    if (!pacienteId) return;

    const paciente = this.pacienteService.obtenerPorId(pacienteId);
    this.paciente.set(paciente);

    if (paciente) {
      this.citas.set(this.citaService.listarPorPaciente(pacienteId));
      this.notas.set(this.atencionService.listarPorPaciente(pacienteId));
    }
  }

  getBadgeClass(estado: EstadoCita): string {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case EstadoCita.PENDIENTE:
        return `${base} bg-yellow-500/20 text-yellow-400`;
      case EstadoCita.ATENDIDO:
        return `${base} bg-green-500/20 text-green-400`;
      case EstadoCita.CANCELADO:
        return `${base} bg-red-500/20 text-red-400`;
      case EstadoCita.REAGENDADO:
        return `${base} bg-blue-500/20 text-blue-400`;
      default:
        return base;
    }
  }

  volverLista(): void {
    this.router.navigate(['/intranet/pacientes']);
  }

  editarPaciente(): void {
    this.router.navigate(['/intranet/pacientes/editar', this.id()]);
  }
}
