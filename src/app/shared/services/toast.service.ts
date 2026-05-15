import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.addToast(message, 'success');
  }

  error(message: string): void {
    this.addToast(message, 'error');
  }

  warning(message: string): void {
    this.addToast(message, 'warning');
  }

  info(message: string): void {
    this.addToast(message, 'info');
  }

  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private addToast(message: string, type: ToastType): void {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const toast: Toast = { id, message, type };

    this.toasts.update(toasts => {
      const updated = [...toasts, toast];
      // Máximo 5 toasts visibles
      return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
    });

    // Auto-dismiss después de 4 segundos
    setTimeout(() => this.dismiss(id), 4000);
  }
}
