import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly isOpen = signal(false);
  readonly options = signal<ConfirmOptions | null>(null);

  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.options.set(options);
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  onConfirm(): void {
    this.resolver?.(true);
    this.close();
  }

  onCancel(): void {
    this.resolver?.(false);
    this.close();
  }

  private close(): void {
    this.isOpen.set(false);
    this.options.set(null);
    this.resolver = null;
  }
}
