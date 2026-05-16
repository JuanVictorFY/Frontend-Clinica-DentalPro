import { Component, input } from '@angular/core';

/**
 * Componente skeleton reutilizable para tablas.
 * Muestra filas animadas con efecto pulse mientras se cargan los datos.
 */
@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  template: `
    <div class="w-full rounded-xl border border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-800">
            <tr>
              @for (col of columnsArray(); track $index) {
                <th class="px-6 py-4">
                  <div class="h-3 bg-gray-700 rounded w-20 animate-pulse"></div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rowsArray(); track $index) {
              <tr class="bg-gray-900 border-t border-gray-700">
                @for (col of columnsArray(); track $index) {
                  <td class="px-6 py-4">
                    <div
                      class="h-4 bg-gray-700/60 rounded animate-pulse"
                      [style.width]="getRandomWidth($index, row)"
                      [style.animation-delay]="(row * 100 + $index * 50) + 'ms'"
                    ></div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class TableSkeletonComponent {
  /** Número de columnas a mostrar */
  readonly columns = input(5);

  /** Número de filas skeleton a mostrar */
  readonly rows = input(5);

  readonly columnsArray = () => Array.from({ length: this.columns() }, (_, i) => i);
  readonly rowsArray = () => Array.from({ length: this.rows() }, (_, i) => i);

  getRandomWidth(colIndex: number, rowIndex: number): string {
    const widths = ['60%', '75%', '50%', '80%', '45%', '70%', '55%', '65%'];
    return widths[(colIndex + rowIndex) % widths.length];
  }
}
