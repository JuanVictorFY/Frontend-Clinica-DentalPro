import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (confirmService.isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-[90] bg-black/60 animate-fade-in"
        (click)="confirmService.onCancel()"
      ></div>

      <!-- Modal -->
      <div class="fixed inset-0 z-[91] flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-6 animate-scale-in">
          <!-- Icon -->
          <div class="flex justify-center mb-4">
            @switch (confirmService.options()?.type ?? 'danger') {
              @case ('danger') {
                <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
              }
              @case ('warning') {
                <div class="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
              }
              @case ('info') {
                <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                </div>
              }
            }
          </div>

          <!-- Title -->
          <h3 class="text-white font-bold text-lg text-center mb-2">
            {{ confirmService.options()?.title }}
          </h3>

          <!-- Message -->
          <p class="text-gray-400 text-sm text-center mb-6">
            {{ confirmService.options()?.message }}
          </p>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-3">
            <button
              (click)="confirmService.onCancel()"
              class="px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium text-sm transition-colors cursor-pointer"
            >
              {{ confirmService.options()?.cancelText ?? 'Cancelar' }}
            </button>
            <button
              (click)="confirmService.onConfirm()"
              [class]="getConfirmButtonClass()"
              class="px-4 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer"
            >
              {{ confirmService.options()?.confirmText ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }

    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `
})
export class ConfirmModalComponent {
  readonly confirmService = inject(ConfirmService);

  getConfirmButtonClass(): string {
    const type = this.confirmService.options()?.type ?? 'danger';
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  }
}
