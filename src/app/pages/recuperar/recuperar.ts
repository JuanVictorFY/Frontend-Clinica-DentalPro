import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class Recuperar {
  email = '';
  isLoading = false;
  isSent = false;

  onSubmit() {
    if (!this.email) return;

    this.isLoading = true;

    // Simulación de envío de correo
    setTimeout(() => {
      this.isLoading = false;
      this.isSent = true;
    }, 1500);
  }
}
