import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    // Simulación de petición al servidor
    setTimeout(() => {
      this.isLoading = false;
      alert(`¡Bienvenido a DentalPro!\n\nSe ha iniciado sesión con: ${this.email}`);
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
