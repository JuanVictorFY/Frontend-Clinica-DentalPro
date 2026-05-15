import { Component, input, output } from '@angular/core';

/** Definición de columna para la tabla genérica */
export interface TableColumn {
  key: string;
  label: string;
}

/**
 * Componente de tabla de datos reutilizable.
 * Maneja 4 estados de UI: cargando, vacío, error y datos.
 * Se puede usar en pacientes, citas, usuarios, etc.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <!-- Estado: Cargando (skeleton/shimmer) -->
    @if (loading()) {
      <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
        <!-- Header skeleton -->
        <div class="bg-gray-800 px-6 py-4">
          <div class="h-4 bg-gray-700 rounded w-1/3 animate-pulse"></div>
        </div>
        <!-- Filas skeleton (3 filas de barras grises animadas) -->
        @for (row of skeletonRows; track row) {
          <div class="px-6 py-4 border-t border-gray-700 bg-gray-900 flex gap-4">
            @for (col of columns(); track col.key) {
              <div class="h-4 bg-gray-700 rounded animate-pulse flex-1"></div>
            }
          </div>
        }
      </div>
    }

    <!-- Estado: Error -->
    @else if (error()) {
      <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-4">
        <!-- Ícono de error -->
        <svg class="w-12 h-12 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p class="text-red-400 text-sm text-center">{{ error() }}</p>
        <button
          (click)="retry.emit()"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    }

    <!-- Estado: Vacío (sin registros) -->
    @else if (data().length === 0) {
      <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
        <!-- Ícono de carpeta vacía -->
        <svg class="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
        <p class="text-gray-400 text-sm">No se encontraron registros</p>
      </div>
    }

    <!-- Estado: Datos (tabla con contenido) -->
    @else {
      <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-800 text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              @for (col of columns(); track col.key) {
                <th class="px-6 py-4 font-medium">{{ col.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of data(); track $index) {
              <tr class="bg-gray-900 border-t border-gray-700 hover:bg-gray-800 transition-colors">
                @for (col of columns(); track col.key) {
                  <td class="px-6 py-4 text-gray-200">{{ getCellValue(row, col.key) }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class DataTableComponent {
  /** Indica si la tabla está cargando datos */
  readonly loading = input<boolean>(false);

  /** Mensaje de error a mostrar (null = sin error) */
  readonly error = input<string | null>(null);

  /** Configuración de columnas: clave y etiqueta */
  readonly columns = input<TableColumn[]>([]);

  /** Datos a renderizar en la tabla */
  readonly data = input<Record<string, unknown>[]>([]);

  /** Evento emitido al presionar "Reintentar" */
  readonly retry = output<void>();

  /** Filas de skeleton para el estado de carga */
  readonly skeletonRows = [1, 2, 3];

  /**
   * Obtiene el valor de una celda de forma segura.
   * Convierte el valor a string para renderizar en la plantilla.
   */
  getCellValue(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (value === null || value === undefined) return '—';
    return String(value);
  }
}
