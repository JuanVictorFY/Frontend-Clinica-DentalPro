import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty notifications list', () => {
    expect(service.notifications()).toEqual([]);
  });

  describe('showSuccess', () => {
    it('should add a success notification', () => {
      service.showSuccess('Operación exitosa');

      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Operación exitosa');
      expect(notifications[0].type).toBe('success');
    });
  });

  describe('showError', () => {
    it('should add an error notification', () => {
      service.showError('Error del servidor');

      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Error del servidor');
      expect(notifications[0].type).toBe('error');
    });
  });

  describe('showWarning', () => {
    it('should add a warning notification', () => {
      service.showWarning('Sesión por expirar');

      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Sesión por expirar');
      expect(notifications[0].type).toBe('warning');
    });
  });

  it('should support multiple notifications simultaneously', () => {
    service.showSuccess('Éxito');
    service.showError('Error');
    service.showWarning('Advertencia');

    expect(service.notifications().length).toBe(3);
  });

  it('should assign unique IDs to each notification', () => {
    service.showSuccess('Primero');
    service.showSuccess('Segundo');

    const notifications = service.notifications();
    expect(notifications[0].id).not.toBe(notifications[1].id);
  });

  describe('dismiss', () => {
    it('should remove a notification by ID', () => {
      service.showSuccess('Mensaje');
      const id = service.notifications()[0].id;

      service.dismiss(id);

      expect(service.notifications().length).toBe(0);
    });

    it('should only remove the targeted notification', () => {
      service.showSuccess('Primero');
      service.showError('Segundo');
      const firstId = service.notifications()[0].id;

      service.dismiss(firstId);

      const remaining = service.notifications();
      expect(remaining.length).toBe(1);
      expect(remaining[0].message).toBe('Segundo');
    });
  });

  describe('clearAll', () => {
    it('should remove all notifications', () => {
      service.showSuccess('Uno');
      service.showError('Dos');
      service.showWarning('Tres');

      service.clearAll();

      expect(service.notifications().length).toBe(0);
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss notification after default duration', () => {
      service.showSuccess('Auto dismiss');

      expect(service.notifications().length).toBe(1);

      vi.advanceTimersByTime(5000);

      expect(service.notifications().length).toBe(0);
    });

    it('should auto-dismiss notification after custom duration', () => {
      service.showError('Custom duration', 2000);

      expect(service.notifications().length).toBe(1);

      vi.advanceTimersByTime(2000);

      expect(service.notifications().length).toBe(0);
    });

    it('should not auto-dismiss when duration is 0', () => {
      service.showWarning('Persistent', 0);

      vi.advanceTimersByTime(10000);

      expect(service.notifications().length).toBe(1);
    });
  });
});
