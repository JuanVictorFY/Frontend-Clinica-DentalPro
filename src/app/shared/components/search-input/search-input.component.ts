import { Component, OnInit, output, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Componente reutilizable de búsqueda con debounce.
 * Emite el término de búsqueda después de 300ms sin actividad,
 * solo si el valor cambió y tiene al menos 2 caracteres (o está vacío para limpiar).
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="relative">
      <!-- Ícono de búsqueda SVG -->
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>

      <input
        type="text"
        [formControl]="searchControl"
        placeholder="Buscar por nombre o DNI..."
        class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
    </div>
  `,
})
export class SearchInputComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  /** Control de formulario independiente (no pertenece a un FormGroup) */
  readonly searchControl = new FormControl('', { nonNullable: true });

  /** Evento de salida que emite el término de búsqueda filtrado */
  readonly searchChange = output<string>();

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        // Esperar 300ms después de la última tecla presionada
        debounceTime(300),
        // Solo emitir si el valor realmente cambió
        distinctUntilChanged(),
        // Filtrar: emitir solo si tiene 2+ caracteres o está vacío (para limpiar búsqueda)
        filter((value: string) => value.length >= 2 || value.length === 0),
        // Cancelar suscripción automáticamente al destruir el componente
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((term: string) => {
        this.searchChange.emit(term);
      });
  }
}
