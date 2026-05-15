import { Injectable, signal, computed } from '@angular/core';

/**
 * Tipo de notificación toast.
 */
export type NotificationType = 'success' | 'error' | 'warning';

/**
 * Representa una notificación toast individual.
 */
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

/**
 * Duración por defecto de las notificaciones en milisegundos.
 */
const DEFAULT_DURATION_MS = 5000;

/**
 * Servicio de notificaciones tipo toast.
 * Gestiona una lista reactiva de notificaciones con auto-dismiss.
 *
 * Validates: Requirements 16.3, 16.4
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Signal que contiene la lista de notificaciones activas. */
  private readonly _notifications = signal<Notification[]>([]);

  /** Notificaciones activas (solo lectura). */
  readonly notifications = computed(() => this._notifications());

  /**
   * Muestra una notificación de éxito.
   * @param message Mensaje a mostrar al usuario.
   * @param duration Duración en ms antes de auto-dismiss (por defecto 5000ms).
   */
  showSuccess(message: string, duration = DEFAULT_DURATION_MS): void {
    this.addNotification(message, 'success', duration);
  }

  /**
   * Muestra una notificación de error.
   * @param message Mensaje a mostrar al usuario.
   * @param duration Duración en ms antes de auto-dismiss (por defecto 5000ms).
   */
  showError(message: string, duration = DEFAULT_DURATION_MS): void {
    this.addNotification(message, 'error', duration);
  }

  /**
   * Muestra una notificación de advertencia.
   * @param message Mensaje a mostrar al usuario.
   * @param duration Duración en ms antes de auto-dismiss (por defecto 5000ms).
   */
  showWarning(message: string, duration = DEFAULT_DURATION_MS): void {
    this.addNotification(message, 'warning', duration);
  }

  /**
   * Elimina una notificación por su ID.
   * @param id Identificador único de la notificación a eliminar.
   */
  dismiss(id: string): void {
    this._notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Elimina todas las notificaciones activas.
   */
  clearAll(): void {
    this._notifications.set([]);
  }

  /**
   * Agrega una notificación a la lista y programa su auto-dismiss.
   */
  private addNotification(message: string, type: NotificationType, duration: number): void {
    const id = this.generateId();
    const notification: Notification = { id, message, type };

    this._notifications.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  /**
   * Genera un identificador único para cada notificación.
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
