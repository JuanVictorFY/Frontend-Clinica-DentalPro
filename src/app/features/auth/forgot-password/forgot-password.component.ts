import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
          <!-- Logo -->
          <div class="flex items-center justify-center gap-2 mb-8">
            <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
            </svg>
            <span class="text-2xl font-black text-white tracking-tighter uppercase">Dental<span class="text-blue-400">Pro</span></span>
          </div>

          @if (!emailSent()) {
            <!-- Form state -->
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Recuperar contrase&ntilde;a</h1>
              <p class="text-gray-400 mt-2 text-sm">Ingresa tu correo electr&oacute;nico y te enviaremos las instrucciones para restablecer tu contrase&ntilde;a.</p>
            </div>

            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Email field -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                  Correo electr&oacute;nico
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="w-full pl-12 pr-4 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="correo&#64;ejemplo.com"
                    [attr.disabled]="isLoading() ? '' : null"
                  />
                </div>
                @if (forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched) {
                  <p class="mt-1.5 text-sm text-red-400">Ingresa un correo electr&oacute;nico v&aacute;lido.</p>
                }
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                [disabled]="forgotForm.invalid || isLoading()"
                class="w-full py-4 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-base cursor-pointer"
              >
                @if (isLoading()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                } @else {
                  Enviar instrucciones
                }
              </button>
            </form>
          } @else {
            <!-- Success state -->
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-white mb-2">Correo enviado</h2>
              <p class="text-gray-400 text-sm mb-2">
                Hemos enviado las instrucciones de recuperaci&oacute;n a:
              </p>
              <p class="text-blue-400 font-medium text-sm mb-6">{{ sentEmail() }}</p>
              <p class="text-gray-500 text-xs mb-6">
                Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
              </p>
              <button
                (click)="resetForm()"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Enviar a otro correo
              </button>
            </div>
          }

          <!-- Back to login -->
          <div class="mt-6 text-center">
            <a routerLink="/login" class="text-sm text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
              </svg>
              Volver al inicio de sesi&oacute;n
            </a>
          </div>
        </div>

        <!-- Footer -->
        <p class="mt-6 text-center text-xs text-gray-600">
          Sistema de gesti&oacute;n interna DentalPro &copy; 2026
        </p>
      </div>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly emailSent = signal(false);
  readonly sentEmail = signal('');

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const email = this.forgotForm.value.email;

    // Simular envio de correo
    setTimeout(() => {
      this.isLoading.set(false);
      this.emailSent.set(true);
      this.sentEmail.set(email);
    }, 1500);
  }

  resetForm(): void {
    this.emailSent.set(false);
    this.sentEmail.set('');
    this.forgotForm.reset();
  }
}
