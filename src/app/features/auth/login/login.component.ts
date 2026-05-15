import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex bg-gray-950">
      <!-- Left side - Image & Branding -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1629909615184-74f495363b67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Clínica dental moderna" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-linear-to-br from-gray-950/80 via-blue-950/60 to-gray-950/90"></div>
        <div class="relative z-10 flex flex-col justify-between p-12 w-full">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <svg class="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
            </svg>
            <span class="text-2xl font-black text-white tracking-tighter uppercase">Dental<span class="text-blue-400">Pro</span></span>
          </div>

          <!-- Testimonial -->
          <div class="max-w-md">
            <blockquote class="text-xl text-white/90 font-light leading-relaxed italic">
              "DentalPro transformó mi sonrisa y mi confianza. El equipo es excepcional y la tecnología de primer nivel."
            </blockquote>
            <div class="mt-6 flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center">
                <span class="text-sm font-bold text-blue-300">MC</span>
              </div>
              <div>
                <p class="text-white font-semibold text-sm">María Castillo</p>
                <p class="text-gray-400 text-xs">Paciente desde 2020</p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex gap-8">
            <div>
              <p class="text-3xl font-black text-white">+5000</p>
              <p class="text-xs text-gray-400 mt-1">Pacientes</p>
            </div>
            <div>
              <p class="text-3xl font-black text-white">+14</p>
              <p class="text-xs text-gray-400 mt-1">Años</p>
            </div>
            <div>
              <p class="text-3xl font-black text-white">98%</p>
              <p class="text-xs text-gray-400 mt-1">Satisfacción</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Login Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-md">
          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center justify-center gap-2 mb-10">
            <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
            </svg>
            <span class="text-2xl font-black text-white tracking-tighter uppercase">Dental<span class="text-blue-400">Pro</span></span>
          </div>

          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-white">Bienvenido de vuelta</h1>
            <p class="text-gray-400 mt-2">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3" role="alert">
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="w-full pl-12 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="correo&#64;ejemplo.com"
                  [attr.disabled]="isLoading() ? '' : null"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="w-full pl-12 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  [attr.disabled]="isLoading() ? '' : null"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading()"
              class="w-full py-4 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-base"
            >
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ingresando...
              } @else {
                Iniciar sesión
              }
            </button>
          </form>

          <!-- Footer -->
          <p class="mt-8 text-center text-xs text-gray-500">
            Sistema de gestión interna DentalPro &copy; 2026
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    });
  }
}
