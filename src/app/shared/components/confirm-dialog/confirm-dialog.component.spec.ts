import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default title and message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent?.trim()).toBe('Confirmar acción');
    expect(compiled.querySelector('p')?.textContent?.trim()).toBe('¿Está seguro de que desea realizar esta acción?');
  });

  it('should display custom title and message', () => {
    fixture.componentRef.setInput('title', 'Eliminar paciente');
    fixture.componentRef.setInput('message', '¿Desea eliminar este paciente?');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent?.trim()).toBe('Eliminar paciente');
    expect(compiled.querySelector('p')?.textContent?.trim()).toBe('¿Desea eliminar este paciente?');
  });

  it('should display custom button texts', () => {
    fixture.componentRef.setInput('confirmText', 'Eliminar');
    fixture.componentRef.setInput('cancelText', 'No, volver');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons[0].textContent?.trim()).toBe('No, volver');
    expect(buttons[1].textContent?.trim()).toBe('Eliminar');
  });

  it('should emit confirm event when confirm button is clicked', () => {
    const confirmSpy = vi.fn();
    component.confirm.subscribe(confirmSpy);

    const compiled = fixture.nativeElement as HTMLElement;
    const confirmButton = compiled.querySelectorAll('button')[1];
    confirmButton.click();

    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit cancel event when cancel button is clicked', () => {
    const cancelSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);

    const compiled = fixture.nativeElement as HTMLElement;
    const cancelButton = compiled.querySelectorAll('button')[0];
    cancelButton.click();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit cancel event when backdrop is clicked', () => {
    const cancelSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);

    const compiled = fixture.nativeElement as HTMLElement;
    const backdrop = compiled.querySelector('[aria-hidden="true"]') as HTMLElement;
    backdrop.click();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dialog = compiled.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('confirm-dialog-title');
  });
});
