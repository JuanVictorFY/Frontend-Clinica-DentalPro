import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PacienteListComponent } from './paciente-list.component';
import { PacienteService } from '../services/paciente.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Paciente } from '../models/paciente.model';
import { PaginatedResponse } from '../../../core/models/api-response.model';

describe('PacienteListComponent', () => {
  let component: PacienteListComponent;
  let fixture: ComponentFixture<PacienteListComponent>;
  let pacienteServiceMock: {
    listar: ReturnType<typeof vi.fn>;
    buscar: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
  };
  let notificationServiceMock: {
    showSuccess: ReturnType<typeof vi.fn>;
    showError: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  const mockPacientes: Paciente[] = [
    { id: 1, nombreCompleto: 'Juan Pérez', dni: '12345678', fechaNacimiento: '1990-01-01', telefono: '999111222', email: 'juan@test.com' },
    { id: 2, nombreCompleto: 'María López', dni: '87654321', fechaNacimiento: '1985-05-15', telefono: '999333444', email: 'maria@test.com' },
  ];

  const mockPaginatedResponse: PaginatedResponse<Paciente> = {
    content: mockPacientes,
    totalElements: 2,
    totalPages: 1,
    currentPage: 1,
    size: 10,
  };

  beforeEach(async () => {
    pacienteServiceMock = {
      listar: vi.fn().mockReturnValue(of(mockPaginatedResponse)),
      buscar: vi.fn().mockReturnValue(of(mockPacientes)),
      eliminar: vi.fn().mockReturnValue(of(undefined)),
    };

    notificationServiceMock = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PacienteListComponent],
      providers: [
        provideRouter([]),
        { provide: PacienteService, useValue: pacienteServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load pacientes on init', () => {
    fixture.detectChanges();

    expect(pacienteServiceMock.listar).toHaveBeenCalledWith(1, 10);
    expect(component.pacientes()).toEqual(mockPacientes);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should show loading state while fetching data', () => {
    // Verify the loading signal is set to true before the service responds
    expect(component.loading()).toBe(false);
    component.loading.set(true);
    expect(component.loading()).toBe(true);

    // After detectChanges triggers ngOnInit and the mock resolves, loading becomes false
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should show error message and retry button on load failure', () => {
    pacienteServiceMock.listar.mockReturnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();

    expect(component.error()).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    const retryButton = Array.from(buttons).find(btn => btn.textContent?.trim().includes('Reintentar'));
    expect(retryButton).toBeTruthy();
  });

  it('should show empty state when no pacientes found', () => {
    pacienteServiceMock.listar.mockReturnValue(of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 1,
      size: 10,
    }));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No se encontraron pacientes');
  });

  it('should navigate to new paciente form', () => {
    fixture.detectChanges();
    component.navigateToNew();

    expect(router.navigate).toHaveBeenCalledWith(['/intranet/pacientes/nuevo']);
  });

  it('should navigate to edit paciente form', () => {
    fixture.detectChanges();
    component.navigateToEdit(1);

    expect(router.navigate).toHaveBeenCalledWith(['/intranet/pacientes/editar', 1]);
  });

  it('should show confirm dialog when delete is clicked', () => {
    fixture.detectChanges();
    component.confirmDelete(mockPacientes[0]);

    expect(component.showDeleteDialog()).toBe(true);
    expect(component.pacienteToDelete()).toEqual(mockPacientes[0]);
  });

  it('should close dialog on cancel without deleting', () => {
    fixture.detectChanges();
    component.confirmDelete(mockPacientes[0]);
    component.onDeleteCancel();

    expect(component.showDeleteDialog()).toBe(false);
    expect(component.pacienteToDelete()).toBeNull();
    expect(pacienteServiceMock.eliminar).not.toHaveBeenCalled();
  });

  it('should delete paciente on confirm and show success notification', () => {
    fixture.detectChanges();
    component.confirmDelete(mockPacientes[0]);
    component.onDeleteConfirm();

    expect(pacienteServiceMock.eliminar).toHaveBeenCalledWith(1);
    expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith('Paciente eliminado correctamente.');
  });

  it('should show error notification when delete fails', () => {
    pacienteServiceMock.eliminar.mockReturnValue(throwError(() => new Error('Delete failed')));
    fixture.detectChanges();
    component.confirmDelete(mockPacientes[0]);
    component.onDeleteConfirm();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith('No se pudo eliminar el paciente. Intente nuevamente.');
  });

  it('should search pacientes by query', () => {
    fixture.detectChanges();
    component.onSearch('Juan');

    expect(component.searchQuery()).toBe('Juan');
    expect(pacienteServiceMock.buscar).toHaveBeenCalledWith('Juan');
  });

  it('should load paginated list when search is empty', () => {
    fixture.detectChanges();
    pacienteServiceMock.listar.mockClear();
    component.onSearch('');

    expect(pacienteServiceMock.listar).toHaveBeenCalledWith(1, 10);
  });

  it('should change page and reload data', () => {
    fixture.detectChanges();
    pacienteServiceMock.listar.mockReturnValue(of({
      content: mockPacientes,
      totalElements: 20,
      totalPages: 2,
      currentPage: 2,
      size: 10,
    }));
    component.onPageChange(2);

    expect(pacienteServiceMock.listar).toHaveBeenCalledWith(2, 10);
    expect(component.currentPage()).toBe(2);
  });
});
