import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PacienteAuthService } from '../../../core/services/paciente-auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmarPassword')?.value;
  return password && confirmar && password !== confirmar ? { noCoinciden: true } : null;
}

@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex bg-gray-950">

      <!-- Left side - Branding -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Clínica dental"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-linear-to-br from-gray-950/85 via-blue-950/65 to-gray-950/90"></div>
        <div class="relative z-10 flex flex-col justify-between p-12 w-full">
          <div class="flex items-center gap-3">
            <svg class="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
            </svg>
            <span class="text-2xl font-black text-white tracking-tighter uppercase">Dental<span class="text-blue-400">Pro</span></span>
          </div>
          <div class="max-w-md space-y-6">
            <h2 class="text-3xl font-bold text-white leading-tight">Tu salud dental comienza aquí</h2>
            <p class="text-gray-300 text-lg font-light leading-relaxed">
              Regístrate y forma parte de nuestra comunidad. Agenda citas y lleva el control de tu historial dental.
            </p>
            <div class="flex flex-col gap-3">
              @for (b of beneficios; track b) {
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                  </div>
                  <span class="text-gray-300 text-sm">{{ b }}</span>
                </div>
              }
            </div>
          </div>
          <div class="flex gap-8">
            <div><p class="text-3xl font-black text-white">+5000</p><p class="text-xs text-gray-400 mt-1">Pacientes</p></div>
            <div><p class="text-3xl font-black text-white">+14</p><p class="text-xs text-gray-400 mt-1">Años</p></div>
            <div><p class="text-3xl font-black text-white">98%</p><p class="text-xs text-gray-400 mt-1">Satisfacción</p></div>
          </div>
        </div>
      </div>

      <!-- Right side - Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div class="w-full max-w-md">

          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center justify-center gap-2 mb-8">
            <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
            </svg>
            <span class="text-2xl font-black text-white tracking-tighter uppercase">Dental<span class="text-blue-400">Pro</span></span>
          </div>

          @if (registroExitoso()) {
            <!-- Estado éxito -->
            <div class="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-10 backdrop-blur-sm text-center space-y-6">
              <div class="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center mx-auto">
                <svg class="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white">¡Registro exitoso!</h2>
                <p class="text-gray-400 mt-2 text-sm leading-relaxed">
                  Te enviamos un correo de bienvenida a<br>
                  <span class="text-blue-400 font-medium">{{ emailRegistrado() }}</span>
                </p>
                <p class="text-gray-500 mt-3 text-xs">
                  Revisa tu bandeja de entrada (y la carpeta de spam).
                </p>
              </div>
              <a
                routerLink="/login"
                class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all duration-200"
              >
                Ir al inicio de sesión
              </a>
            </div>

          } @else {
            <div class="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
              <div class="mb-6">
                <h1 class="text-2xl font-bold text-white">Crear cuenta de paciente</h1>
                <p class="text-gray-400 mt-1.5 text-sm">Completa tus datos para registrarte</p>
              </div>

              @if (errorGeneral()) {
                <div class="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                  </svg>
                  {{ errorGeneral() }}
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Nombre completo</label>
                  <input type="text" formControlName="nombreCompleto" placeholder="Ej: Juan Pérez García"
                    class="w-full px-4 py-3 rounded-xl bg-gray-800/70 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    [class.border-red-500]="inv('nombreCompleto')" [class.border-gray-600]="!inv('nombreCompleto')"/>
                  @if (inv('nombreCompleto')) { <p class="mt-1 text-xs text-red-400">El nombre es obligatorio.</p> }
                </div>

                <!-- DNI -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">DNI</label>
                  <input type="text" formControlName="dni" placeholder="12345678" maxlength="8"
                    class="w-full px-4 py-3 rounded-xl bg-gray-800/70 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    [class.border-red-500]="inv('dni')" [class.border-gray-600]="!inv('dni')"/>
                  @if (inv('dni')) { <p class="mt-1 text-xs text-red-400">El DNI debe tener 8 dígitos.</p> }
                </div>

                <!-- Fecha + Teléfono -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Fecha de nacimiento</label>
                    <input type="date" formControlName="fechaNacimiento"
                      class="w-full px-4 py-3 rounded-xl bg-gray-800/70 border text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      [class.border-red-500]="inv('fechaNacimiento')" [class.border-gray-600]="!inv('fechaNacimiento')"/>
                    @if (inv('fechaNacimiento')) { <p class="mt-1 text-xs text-red-400">Requerida.</p> }
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Teléfono</label>
                    <input type="tel" formControlName="telefono" placeholder="987654321" maxlength="9"
                      class="w-full px-4 py-3 rounded-xl bg-gray-800/70 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      [class.border-red-500]="inv('telefono')" [class.border-gray-600]="!inv('telefono')"/>
                    @if (inv('telefono')) { <p class="mt-1 text-xs text-red-400">9 dígitos.</p> }
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Correo electrónico</label>
                  <input type="email" formControlName="email" placeholder="correo@ejemplo.com"
                    class="w-full px-4 py-3 rounded-xl bg-gray-800/70 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    [class.border-red-500]="inv('email')" [class.border-gray-600]="!inv('email')"/>
                  @if (inv('email')) { <p class="mt-1 text-xs text-red-400">Correo válido requerido.</p> }
                </div>

                <!-- Contraseña -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
                  <div class="relative">
                    <input [type]="showPassword() ? 'text' : 'password'" formControlName="password"
                      placeholder="Mínimo 6 caracteres"
                      class="w-full px-4 py-3 pr-11 rounded-xl bg-gray-800/70 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      [class.border-red-500]="inv('password')" [class.border-gray-600]="!inv('password')"/>
                    <button type="button" (click)="showPassword.update(v => !v)"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors">
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
                  @if (inv('password')) { <p class="mt-1 text-xs text-red-400">Mínimo 6 caracteres.</p> }
                </div>

                <!-- Confirmar contraseña -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contraseña</label>
                  <div class="relative">
                    <input [type]="showConfirm() ? 'text' : 'password'" formControlName="confirmarPassword"
                      placeholder="Repite tu contraseña"
                      class="w-full px-4 py-3 pr-11 rounded-xl bg-gray-800/70 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      [class.border-red-500]="inv('confirmarPassword') || noCoinciden()"
                      [class.border-gray-600]="!inv('confirmarPassword') && !noCoinciden()"/>
                    <button type="button" (click)="showConfirm.update(v => !v)"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors">
                      @if (showConfirm()) {
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
                  @if (noCoinciden()) { <p class="mt-1 text-xs text-red-400">Las contraseñas no coinciden.</p> }
                </div>

                <!-- Submit -->
                <button type="submit" [disabled]="form.invalid || isLoading()"
                  class="w-full mt-2 py-4 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  @if (isLoading()) {
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  } @else {
                    Crear mi cuenta
                  }
                </button>
              </form>

              <div class="mt-6 text-center text-sm text-gray-500">
                ¿Ya tienes acceso al sistema?
                <a routerLink="/login" class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors">Iniciar sesión</a>
              </div>
            </div>
          }

          <p class="mt-6 text-center text-xs text-gray-600">Sistema DentalPro &copy; 2026</p>
        </div>
      </div>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class RegistroPacienteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(PacienteAuthService);

  readonly isLoading = signal(false);
  readonly registroExitoso = signal(false);
  readonly emailRegistrado = signal('');
  readonly errorGeneral = signal('');
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);

  readonly beneficios = [
    'Registro de historial clínico completo',
    'Agenda de citas con tu odontólogo',
    'Seguimiento de tratamientos y diagnósticos',
  ];

  readonly form: FormGroup = this.fb.group({
    nombreCompleto: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    fechaNacimiento: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  inv(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  noCoinciden(): boolean {
    return !!(this.form.errors?.['noCoinciden'] && this.form.get('confirmarPassword')?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.errorGeneral.set('');

    const { confirmarPassword, ...datos } = this.form.value;

    this.authService.registrar(datos).subscribe({
      next: () => {
        this.emailRegistrado.set(datos.email);
        this.registroExitoso.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.mensaje || 'Error al registrar. Intenta nuevamente.';
        this.errorGeneral.set(msg);
        this.isLoading.set(false);
      }
    });
  }
}


