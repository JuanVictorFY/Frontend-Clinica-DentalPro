import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'confirm-dialog-title'"
    >
      <!-- Backdrop overlay -->
      <div
        class="absolute inset-0 bg-black/50 transition-opacity"
        (click)="onCancel()"
        aria-hidden="true"
      ></div>

      <!-- Modal content -->
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
        <h2
          id="confirm-dialog-title"
          class="text-lg font-semibold text-gray-800 mb-2"
        >
          {{ title() }}
        </h2>

        <p class="text-sm text-gray-600 mb-6">
          {{ message() }}
        </p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none transition"
          >
            {{ cancelText() }}
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none transition"
          >
            {{ confirmText() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class ConfirmDialogComponent {
  readonly title = input<string>('Confirmar acción');
  readonly message = input<string>('¿Está seguro de que desea realizar esta acción?');
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
