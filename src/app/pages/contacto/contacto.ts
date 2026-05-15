import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  private fb = inject(FormBuilder);

  contactForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    mensaje: ['', [Validators.required, Validators.minLength(10)]],
  });

  submitted = false;

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.submitted = true;
      this.contactForm.reset();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
