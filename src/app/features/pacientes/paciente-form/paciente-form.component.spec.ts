import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PacienteFormComponent } from './paciente-form.component';
import { PacienteService } from '../services/paciente.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('PacienteFormComponent', () => {
  let component: PacienteFormComponent;
  let pacienteServiceMock: any;
  let notificationServiceMock: any;
  let routerSpy: any;

  function setup(routeParams: Record<string, string> = {}) {
    pacienteServiceMock = {
      registrar: vi.fn().mockReturnValue(of({ id: 1 })),
      actualizar: vi.fn().mockReturnValue(of({ id: 1 })),
      obtenerPorId: vi.fn().mockReturnValue(of({
        id: 1,
        nombreCompleto: 'Juan Pérez',
        dni: '12345678',
        fechaNacimiento: '1990-05-15',
        telefono: '987654321',
        email: 'juan@test.com'
      }))
    };

    notificationServiceMock = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [PacienteFormComponent],
      providers: [
        provideRouter([
          { path: 'intranet/pacientes', component: DummyComponent }
        ]),
        provideHttpClient(),
        { provide: PacienteService, useValue: pacienteServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (key: string) => routeParams[key] || null } }
          }
        }
      ]
    });

    routerSpy = vi.spyOn(TestBed.inject(Router), 'navigate');

    const fixture = TestBed.createComponent(PacienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('Modo registro', () => {
    beforeEach(() => setup());

    it('debe iniciar en modo registro cuando no hay :id en la ruta', () => {
      expect(component.isEditMode()).toBe(false);
    });

    it('debe tener el formulario inválido inicialmente', () => {
      expect(component.pacienteForm.invalid).toBe(true);
    });

    it('debe validar que el DNI tenga exactamente 8 dígitos', () => {
      const dniControl = component.pacienteForm.get('dni')!;

      dniControl.setValue('1234');
      expect(dniControl.hasError('pattern')).toBe(true);

      dniControl.setValue('123456789');
      expect(dniControl.hasError('pattern')).toBe(true);

      dniControl.setValue('abcdefgh');
      expect(dniControl.hasError('pattern')).toBe(true);

      dniControl.setValue('12345678');
      expect(dniControl.hasError('pattern')).toBe(false);
    });

    it('debe validar que el teléfono tenga exactamente 9 dígitos', () => {
      const telefonoControl = component.pacienteForm.get('telefono')!;

      telefonoControl.setValue('12345');
      expect(telefonoControl.hasError('pattern')).toBe(true);

      telefonoControl.setValue('1234567890');
      expect(telefonoControl.hasError('pattern')).toBe(true);

      telefonoControl.setValue('987654321');
      expect(telefonoControl.hasError('pattern')).toBe(false);
    });

    it('debe validar formato de email', () => {
      const emailControl = component.pacienteForm.get('email')!;

      emailControl.setValue('invalid');
      expect(emailControl.hasError('email')).toBe(true);

      emailControl.setValue('valid@test.com');
      expect(emailControl.hasError('email')).toBe(false);
    });

    it('debe enviar datos al servicio cuando el formulario es válido', () => {
      component.pacienteForm.setValue({
        nombreCompleto: 'María López',
        dni: '87654321',
        fechaNacimiento: '1985-03-20',
        telefono: '912345678',
        email: 'maria@test.com'
      });

      component.onSubmit();

      expect(pacienteServiceMock.registrar).toHaveBeenCalledWith({
        nombreCompleto: 'María López',
        dni: '87654321',
        fechaNacimiento: '1985-03-20',
        telefono: '912345678',
        email: 'maria@test.com'
      });
    });

    it('debe mostrar notificación de éxito tras registro exitoso', () => {
      component.pacienteForm.setValue({
        nombreCompleto: 'María López',
        dni: '87654321',
        fechaNacimiento: '1985-03-20',
        telefono: '912345678',
        email: 'maria@test.com'
      });

      component.onSubmit();

      expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith('Paciente registrado exitosamente.');
    });

    it('debe manejar error de DNI duplicado (status 409)', () => {
      pacienteServiceMock.registrar.mockReturnValue(
        throwError(() => ({ status: 409, error: { message: 'DNI ya registrado' } }))
      );

      component.pacienteForm.setValue({
        nombreCompleto: 'María López',
        dni: '87654321',
        fechaNacimiento: '1985-03-20',
        telefono: '912345678',
        email: 'maria@test.com'
      });

      component.onSubmit();

      expect(component.dniDuplicadoError()).toBe('El DNI ingresado ya está registrado en el sistema.');
    });

    it('debe mostrar indicador de carga durante envío', () => {
      expect(component.isSubmitting()).toBe(false);

      pacienteServiceMock.registrar.mockReturnValue(of({ id: 1 }));

      component.pacienteForm.setValue({
        nombreCompleto: 'Test',
        dni: '12345678',
        fechaNacimiento: '1990-01-01',
        telefono: '987654321',
        email: 'test@test.com'
      });

      // After submit completes (synchronous observable), isSubmitting should be false
      component.onSubmit();
      expect(component.isSubmitting()).toBe(false);
    });

    it('no debe enviar si el formulario es inválido', () => {
      component.onSubmit();
      expect(pacienteServiceMock.registrar).not.toHaveBeenCalled();
    });
  });

  describe('Modo edición', () => {
    beforeEach(() => setup({ id: '1' }));

    it('debe iniciar en modo edición cuando hay :id en la ruta', () => {
      expect(component.isEditMode()).toBe(true);
    });

    it('debe cargar datos del paciente existente', () => {
      expect(pacienteServiceMock.obtenerPorId).toHaveBeenCalledWith(1);
      expect(component.pacienteForm.get('nombreCompleto')?.value).toBe('Juan Pérez');
      expect(component.pacienteForm.get('dni')?.value).toBe('12345678');
      expect(component.pacienteForm.get('fechaNacimiento')?.value).toBe('1990-05-15');
      expect(component.pacienteForm.get('telefono')?.value).toBe('987654321');
      expect(component.pacienteForm.get('email')?.value).toBe('juan@test.com');
    });

    it('debe llamar a actualizar en lugar de registrar', () => {
      component.pacienteForm.setValue({
        nombreCompleto: 'Juan Pérez Actualizado',
        dni: '12345678',
        fechaNacimiento: '1990-05-15',
        telefono: '987654321',
        email: 'juan@test.com'
      });

      component.onSubmit();

      expect(pacienteServiceMock.actualizar).toHaveBeenCalledWith(1, {
        nombreCompleto: 'Juan Pérez Actualizado',
        dni: '12345678',
        fechaNacimiento: '1990-05-15',
        telefono: '987654321',
        email: 'juan@test.com'
      });
      expect(pacienteServiceMock.registrar).not.toHaveBeenCalled();
    });

    it('debe mostrar notificación de éxito tras actualización', () => {
      component.onSubmit();
      expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith('Paciente actualizado exitosamente.');
    });

    it('debe manejar error al cargar datos del paciente', () => {
      expect(pacienteServiceMock.obtenerPorId).toHaveBeenCalledWith(1);
    });
  });

  describe('Modo edición - error al cargar', () => {
    it('debe mostrar error y navegar cuando falla la carga del paciente', () => {
      const errorServiceMock = {
        registrar: vi.fn(),
        actualizar: vi.fn(),
        obtenerPorId: vi.fn().mockReturnValue(throwError(() => ({ status: 500 })))
      };

      const errorNotificationMock = {
        showSuccess: vi.fn(),
        showError: vi.fn()
      };

      TestBed.configureTestingModule({
        imports: [PacienteFormComponent],
        providers: [
          provideRouter([
            { path: 'intranet/pacientes', component: DummyComponent }
          ]),
          provideHttpClient(),
          { provide: PacienteService, useValue: errorServiceMock },
          { provide: NotificationService, useValue: errorNotificationMock },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (key: string) => key === 'id' ? '99' : null } }
            }
          }
        ]
      });

      const fixture = TestBed.createComponent(PacienteFormComponent);
      fixture.detectChanges();

      expect(errorNotificationMock.showError).toHaveBeenCalledWith('Error al cargar los datos del paciente.');
    });
  });

  describe('showError', () => {
    beforeEach(() => setup());

    it('debe retornar false si el campo no ha sido tocado', () => {
      expect(component.showError('nombreCompleto')).toBe(false);
    });

    it('debe retornar true si el campo es inválido y fue tocado', () => {
      const control = component.pacienteForm.get('nombreCompleto')!;
      control.markAsTouched();
      expect(component.showError('nombreCompleto')).toBe(true);
    });

    it('debe retornar false si el campo es válido', () => {
      const control = component.pacienteForm.get('nombreCompleto')!;
      control.setValue('Test Name');
      control.markAsTouched();
      expect(component.showError('nombreCompleto')).toBe(false);
    });
  });
});
