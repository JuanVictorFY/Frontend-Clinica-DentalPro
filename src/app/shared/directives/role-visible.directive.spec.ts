import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RoleVisibleDirective } from './role-visible.directive';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  standalone: true,
  imports: [RoleVisibleDirective],
  template: `
    <div *appRoleVisible="roles" class="protected-content">Contenido protegido</div>
  `
})
class TestHostComponent {
  roles: (UserRole | string)[] | null | undefined = [UserRole.ADMINISTRADOR];
}

describe('RoleVisibleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let mockAuthService: { getUserRole: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = {
      getUserRole: vi.fn().mockReturnValue(UserRole.ADMINISTRADOR)
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  it('should show element when user role is in allowed roles', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.ADMINISTRADOR);
    component.roles = [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA];
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain('Contenido protegido');
  });

  it('should hide element when user role is not in allowed roles', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.ODONTOLOGO);
    component.roles = [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA];
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeNull();
  });

  it('should hide element when user has no role (not authenticated)', () => {
    mockAuthService.getUserRole.mockReturnValue(null);
    component.roles = [UserRole.ADMINISTRADOR];
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeNull();
  });

  it('should hide element when allowed roles is null', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.ADMINISTRADOR);
    component.roles = null;
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeNull();
  });

  it('should hide element when allowed roles is undefined', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.ADMINISTRADOR);
    component.roles = undefined;
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeNull();
  });

  it('should hide element when allowed roles is empty array', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.ADMINISTRADOR);
    component.roles = [];
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeNull();
  });

  it('should show element for RECEPCIONISTA when role is allowed', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.RECEPCIONISTA);
    component.roles = [UserRole.RECEPCIONISTA];
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeTruthy();
  });

  it('should show element for ODONTOLOGO when role is allowed', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.ODONTOLOGO);
    component.roles = [UserRole.ODONTOLOGO];
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeTruthy();
  });

  it('should update visibility when roles input changes', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.RECEPCIONISTA);
    component.roles = [UserRole.ADMINISTRADOR];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.protected-content')).toBeNull();

    component.roles = [UserRole.RECEPCIONISTA];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.protected-content')).toBeTruthy();
  });

  it('should work with string role values', () => {
    mockAuthService.getUserRole.mockReturnValue(UserRole.ADMINISTRADOR);
    component.roles = ['ADMINISTRADOR'];
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('.protected-content');
    expect(el).toBeTruthy();
  });
});
