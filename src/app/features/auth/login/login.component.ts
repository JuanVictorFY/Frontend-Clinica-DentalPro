import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
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

          <!-- Card container for the form -->
          <div class="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
              <p class="text-gray-400 mt-2 text-sm">Ingresa tus credenciales para acceder al sistema</p>
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
              <!-- Email field -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
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
              </div>

              <!-- Password field with show/hide toggle -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="w-full pl-12 pr-12 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="••••••••"
                    [attr.disabled]="isLoading() ? '' : null"
                  />
                  <!-- Show/Hide password toggle -->
                  <button
                    type="button"
                    (click)="togglePassword()"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    @if (showPassword()) {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    }
                  </button>
                </div>
              </div>

              <!-- Remember me & Forgot password -->
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0">
                  <span class="text-sm text-gray-400">Mantener sesión</span>
                </label>
                <a href="javascript:void(0)" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full py-4 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-base"
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

            <!-- Back to website link -->
            <div class="mt-6 text-center">
              <a routerLink="/" class="text-sm text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
                </svg>
                Volver a la web principal
              </a>
            </div>
          </div>

          <!-- Footer -->
          <p class="mt-6 text-center text-xs text-gray-600">
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
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    // Simulate async delay for UX
    setTimeout(() => {
      const result = this.authService.login(email, password);

      if (result.success) {
        const role = this.authService.getUserRole();

        // Navigate based on role
        switch (role) {
          case UserRole.ODONTOLOGO:
            this.router.navigate(['/intranet/citas']);
            break;
          case UserRole.RECEPCIONISTA:
            this.router.navigate(['/intranet/pacientes']);
            break;
          default:
            this.router.navigate(['/intranet']);
            break;
        }
      } else {
        this.errorMessage.set(result.error || 'Error al iniciar sesión.');
        this.isLoading.set(false);
      }
    }, 800);
  }
}
