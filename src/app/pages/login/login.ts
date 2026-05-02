import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { USERS_MOCK } from '../data/users.data';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
  isRecovering = false;
  isSent = false;
  errorMessage = '';

  private router = inject(Router);

  onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = ''; // Limpiar errores previos

    // Simulación de petición al servidor
    setTimeout(() => {
      this.isLoading = false;

      const user = USERS_MOCK.find(u => u.email === this.email && u.password === this.password);

      if (user) {
        this.router.navigate(['/intranet']);
      } else {
        this.errorMessage = 'Correo o contraseña incorrectos. Inténtalo de nuevo.';
      }
    }, 1500);
  }

  onRecover() {
    if (!this.email) return;

    this.isLoading = true;
    // Simulación de envío de correo
    setTimeout(() => {
      this.isLoading = false;
      this.isSent = true;
    }, 1500);
  }

  toggleRecovery() {
    this.isRecovering = !this.isRecovering;
    this.isSent = false;
    this.password = ''; // Limpiamos la contraseña por seguridad
  }
}
