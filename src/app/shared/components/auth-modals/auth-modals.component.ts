import { Component, inject, signal, HostListener, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { PacienteAuthService } from '../../../core/services/paciente-auth.service';

function regPasswordsMatch(ctrl: AbstractControl): ValidationErrors | null {
  const pw = ctrl.get('password')?.value;
  const c = ctrl.get('confirmarPassword')?.value;
  return pw && c && pw !== c ? { noCoinciden: true } : null;
}

function fpPasswordsMatch(ctrl: AbstractControl): ValidationErrors | null {
  const pw = ctrl.get('newPassword')?.value;
  const c = ctrl.get('confirmarPassword')?.value;
  return pw && c && pw !== c ? { noCoinciden: true } : null;
}

type FpStep = 'email' | 'code' | 'password' | 'success';

@Component({
  selector: 'app-auth-modals',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    @if (authModal.view() !== 'none') {
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4"
           (click)="onBackdropClick($event)">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-950/85 backdrop-blur-md"></div>

        <!-- Modal panel -->
        <div class="relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto bg-gray-900 border border-gray-800/80 rounded-3xl shadow-2xl shadow-black/70 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
             (click)="$event.stopPropagation()">

          <!-- Close -->
          <button type="button" (click)="authModal.close()"
            class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="p-7 md:p-8">

            <!-- Logo -->
            <div class="flex items-center justify-center gap-2 mb-6">
              <svg class="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
              </svg>
              <span class="text-xl font-black text-white tracking-tighter uppercase">Dental<span class="text-blue-400">Pro</span></span>
            </div>

            <!-- ===================== LOGIN ===================== -->
            @if (authModal.view() === 'login') {
              <div class="mb-5">
                <h2 class="text-xl font-bold text-white">Bienvenido de vuelta</h2>
                <p class="text-gray-400 text-sm mt-1">Ingresa tus credenciales para acceder al sistema</p>
              </div>

              @if (loginError()) {
                <div class="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                  </svg>
                  {{ loginError() }}
                </div>
              }

              <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Correo electr&oacute;nico</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                      </svg>
                    </div>
                    <input type="email" formControlName="email"
                      class="w-full pl-10 pr-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="correo&#64;ejemplo.com" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Contrase&ntilde;a</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                      </svg>
                    </div>
                    <input [type]="showLoginPw() ? 'text' : 'password'" formControlName="password"
                      class="w-full pl-10 pr-10 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" />
                    <button type="button" (click)="showLoginPw.set(!showLoginPw())"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                      @if (showLoginPw()) {
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                        </svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                      }
                    </button>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button type="button" (click)="authModal.open('recuperar')"
                    class="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                    &iquest;Olvidaste tu contrase&ntilde;a?
                  </button>
                </div>

                <button type="submit" [disabled]="loginForm.invalid || loginLoading()"
                  class="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-sm cursor-pointer">
                  @if (loginLoading()) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  } @else {
                    Iniciar sesi&oacute;n
                  }
                </button>
              </form>

              <div class="mt-4 text-center text-sm text-gray-500">
                &iquest;Eres paciente nuevo?
                <button type="button" (click)="authModal.open('registro')"
                  class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors cursor-pointer">
                  Reg&iacute;strate aqu&iacute;
                </button>
              </div>
              <div class="mt-2 text-center text-sm text-gray-500">
                &iquest;Eres personal de la cl&iacute;nica?
                <a routerLink="/login" (click)="authModal.close()"
                  class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors cursor-pointer">
                  Iniciar sesi&oacute;n como personal
                </a>
              </div>
            }

            <!-- ===================== REGISTRO ===================== -->
            @if (authModal.view() === 'registro') {

              @if (!registroSuccess()) {
                <div class="mb-5">
                  <h2 class="text-xl font-bold text-white">Crear cuenta de paciente</h2>
                  <p class="text-gray-400 text-sm mt-1">Completa tus datos para registrarte</p>
                </div>

                @if (registroError()) {
                  <div class="mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
                    <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                    </svg>
                    {{ registroError() }}
                  </div>
                }

                <form [formGroup]="registroForm" (ngSubmit)="submitRegistro()" class="space-y-4">
                  <!-- Nombre -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Nombre completo</label>
                    <input type="text" formControlName="nombreCompleto"
                      class="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="Tu nombre completo" />
                    @if (registroForm.get('nombreCompleto')?.invalid && registroForm.get('nombreCompleto')?.touched) {
                      <p class="mt-1 text-xs text-red-400">Ingresa tu nombre completo.</p>
                    }
                  </div>

                  <!-- DNI + Fecha (2 columnas) -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1.5">DNI</label>
                      <input type="text" formControlName="dni" maxlength="8"
                        class="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="12345678" />
                      @if (registroForm.get('dni')?.invalid && registroForm.get('dni')?.touched) {
                        <p class="mt-1 text-xs text-red-400">DNI de 8 d&iacute;gitos.</p>
                      }
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1.5">Fecha de nacimiento</label>
                      <input type="date" formControlName="fechaNacimiento"
                        class="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm [color-scheme:dark]" />
                    </div>
                  </div>

                  <!-- Teléfono -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Tel&eacute;fono</label>
                    <input type="tel" formControlName="telefono"
                      class="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="987654321" />
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Correo electr&oacute;nico</label>
                    <input type="email" formControlName="email"
                      class="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="correo&#64;ejemplo.com" />
                    @if (registroForm.get('email')?.invalid && registroForm.get('email')?.touched) {
                      <p class="mt-1 text-xs text-red-400">Ingresa un correo v&aacute;lido.</p>
                    }
                  </div>

                  <!-- Contraseña -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Contrase&ntilde;a</label>
                    <div class="relative">
                      <input [type]="showRegPw() ? 'text' : 'password'" formControlName="password"
                        class="w-full pl-4 pr-10 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="M&iacute;nimo 6 caracteres" />
                      <button type="button" (click)="showRegPw.set(!showRegPw())"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                        @if (showRegPw()) {
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                          </svg>
                        } @else {
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                          </svg>
                        }
                      </button>
                    </div>
                    @if (registroForm.get('password')?.invalid && registroForm.get('password')?.touched) {
                      <p class="mt-1 text-xs text-red-400">M&iacute;nimo 6 caracteres.</p>
                    }
                  </div>

                  <!-- Confirmar contraseña -->
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contrase&ntilde;a</label>
                    <div class="relative">
                      <input [type]="showRegConfirm() ? 'text' : 'password'" formControlName="confirmarPassword"
                        class="w-full pl-4 pr-10 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Repite la contrase&ntilde;a" />
                      <button type="button" (click)="showRegConfirm.set(!showRegConfirm())"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                        @if (showRegConfirm()) {
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                          </svg>
                        } @else {
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                          </svg>
                        }
                      </button>
                    </div>
                    @if (registroForm.errors?.['noCoinciden'] && registroForm.get('confirmarPassword')?.touched) {
                      <p class="mt-1 text-xs text-red-400">Las contrase&ntilde;as no coinciden.</p>
                    }
                  </div>

                  <button type="submit" [disabled]="registroForm.invalid || registroLoading()"
                    class="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-sm cursor-pointer">
                    @if (registroLoading()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    } @else {
                      Crear cuenta
                    }
                  </button>
                </form>
              } @else {
                <!-- Registro exitoso -->
                <div class="text-center py-4">
                  <div class="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white mb-2">&iexcl;Registro exitoso!</h3>
                  <p class="text-gray-400 text-sm mb-1">Te enviamos un correo de bienvenida a:</p>
                  <p class="text-blue-400 font-medium text-sm mb-6">{{ registroEmail() }}</p>
                  <button type="button" (click)="authModal.open('login')"
                    class="py-3 px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all text-sm cursor-pointer">
                    Iniciar sesi&oacute;n
                  </button>
                </div>
              }

              @if (!registroSuccess()) {
                <div class="mt-4 text-center text-sm text-gray-500">
                  &iquest;Ya tienes cuenta?
                  <button type="button" (click)="authModal.open('login')"
                    class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors cursor-pointer">
                    Inicia sesi&oacute;n
                  </button>
                </div>
              }
            }

            <!-- ===================== RECUPERAR ===================== -->
            @if (authModal.view() === 'recuperar') {
              <!-- Step indicators -->
              @if (fpStep() !== 'success') {
                <div class="flex items-center justify-center gap-2 mb-6">
                  @for (s of fpSteps; track s.idx) {
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                        [class]="fpStepIndex() > s.idx ? 'bg-blue-600 text-white' :
                                 fpStepIndex() === s.idx ? 'bg-blue-600 text-white ring-4 ring-blue-500/30' :
                                 'bg-gray-800 text-gray-500'">
                        @if (fpStepIndex() > s.idx) {
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                          </svg>
                        } @else {
                          {{ s.idx + 1 }}
                        }
                      </div>
                      @if (!s.last) {
                        <div class="w-6 h-px transition-colors duration-300" [class]="fpStepIndex() > s.idx ? 'bg-blue-600' : 'bg-gray-700'"></div>
                      }
                    </div>
                  }
                </div>
              }

              @if (fpError()) {
                <div class="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                  </svg>
                  {{ fpError() }}
                </div>
              }

              <!-- Step 1: email -->
              @if (fpStep() === 'email') {
                <div class="text-center mb-5">
                  <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                    </svg>
                  </div>
                  <h2 class="text-lg font-bold text-white">Recuperar contrase&ntilde;a</h2>
                  <p class="text-gray-400 text-sm mt-1">Ingresa tu correo y te enviaremos un c&oacute;digo</p>
                </div>
                <form [formGroup]="fpEmailForm" (ngSubmit)="fpEnviarCodigo()" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Correo electr&oacute;nico</label>
                    <input type="email" formControlName="email"
                      class="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="correo&#64;ejemplo.com" />
                    @if (fpEmailForm.get('email')?.invalid && fpEmailForm.get('email')?.touched) {
                      <p class="mt-1 text-xs text-red-400">Ingresa un correo v&aacute;lido.</p>
                    }
                  </div>
                  <button type="submit" [disabled]="fpEmailForm.invalid || fpLoading()"
                    class="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-sm cursor-pointer">
                    @if (fpLoading()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    } @else {
                      Enviar c&oacute;digo
                    }
                  </button>
                </form>
              }

              <!-- Step 2: code -->
              @if (fpStep() === 'code') {
                <div class="text-center mb-5">
                  <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
                    </svg>
                  </div>
                  <h2 class="text-lg font-bold text-white">Verificar c&oacute;digo</h2>
                  <p class="text-gray-400 text-sm mt-1">C&oacute;digo enviado a <span class="text-blue-400">{{ fpSentEmail() }}</span></p>
                </div>
                @if (fpDevCode()) {
                  <div class="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                    <p class="text-xs text-amber-300 font-semibold mb-1">Modo desarrollo:</p>
                    <p class="text-2xl font-black text-amber-400 tracking-[0.5em]">{{ fpDevCode() }}</p>
                  </div>
                }
                <form [formGroup]="fpCodeForm" (ngSubmit)="fpVerificarCodigo()" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">C&oacute;digo de 6 d&iacute;gitos</label>
                    <input type="text" formControlName="code" maxlength="6"
                      class="w-full px-4 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white text-center text-2xl font-black tracking-[0.4em] placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="------" />
                  </div>
                  <button type="submit" [disabled]="fpCodeForm.invalid || fpLoading()"
                    class="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-sm cursor-pointer">
                    @if (fpLoading()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verificando...
                    } @else {
                      Verificar c&oacute;digo
                    }
                  </button>
                  <button type="button" (click)="fpStep.set('email'); fpError.set('')"
                    class="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                    Cambiar correo
                  </button>
                </form>
              }

              <!-- Step 3: new password -->
              @if (fpStep() === 'password') {
                <div class="text-center mb-5">
                  <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                    </svg>
                  </div>
                  <h2 class="text-lg font-bold text-white">Nueva contrase&ntilde;a</h2>
                  <p class="text-gray-400 text-sm mt-1">M&iacute;nimo 6 caracteres</p>
                </div>
                <form [formGroup]="fpNewPwForm" (ngSubmit)="fpCambiarPassword()" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Nueva contrase&ntilde;a</label>
                    <div class="relative">
                      <input [type]="showFpNew() ? 'text' : 'password'" formControlName="newPassword"
                        class="w-full pl-4 pr-10 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="M&iacute;nimo 6 caracteres" />
                      <button type="button" (click)="showFpNew.set(!showFpNew())"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                      </button>
                    </div>
                    @if (fpNewPwForm.get('newPassword')?.invalid && fpNewPwForm.get('newPassword')?.touched) {
                      <p class="mt-1 text-xs text-red-400">M&iacute;nimo 6 caracteres.</p>
                    }
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1.5">Confirmar contrase&ntilde;a</label>
                    <div class="relative">
                      <input [type]="showFpConfirm() ? 'text' : 'password'" formControlName="confirmarPassword"
                        class="w-full pl-4 pr-10 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        placeholder="Repite la contrase&ntilde;a" />
                      <button type="button" (click)="showFpConfirm.set(!showFpConfirm())"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                      </button>
                    </div>
                    @if (fpNewPwForm.errors?.['noCoinciden'] && fpNewPwForm.get('confirmarPassword')?.touched) {
                      <p class="mt-1 text-xs text-red-400">Las contrase&ntilde;as no coinciden.</p>
                    }
                  </div>
                  <button type="submit" [disabled]="fpNewPwForm.invalid || fpLoading()"
                    class="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-sm cursor-pointer">
                    @if (fpLoading()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    } @else {
                      Cambiar contrase&ntilde;a
                    }
                  </button>
                </form>
              }

              <!-- Step 4: success -->
              @if (fpStep() === 'success') {
                <div class="text-center py-4">
                  <div class="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white mb-2">Contrase&ntilde;a actualizada</h3>
                  <p class="text-gray-400 text-sm mb-6">Ya puedes iniciar sesi&oacute;n con tu nueva contrase&ntilde;a.</p>
                  <button type="button" (click)="authModal.open('login')"
                    class="py-3 px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all text-sm cursor-pointer">
                    Iniciar sesi&oacute;n
                  </button>
                </div>
              }

              @if (fpStep() !== 'success') {
                <div class="mt-4 text-center">
                  <button type="button" (click)="authModal.open('login')"
                    class="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                    </svg>
                    Volver al login
                  </button>
                </div>
              }
            }

          </div>
        </div>
      </div>
    }
  `,
  styles: `:host { display: contents; }`
})
export class AuthModalsComponent {
  readonly authModal = inject(AuthModalService);
  private readonly authService = inject(AuthService);
  private readonly pacienteAuth = inject(PacienteAuthService);
  private readonly fb = inject(FormBuilder);
  // ---- LOGIN ----
  readonly loginLoading = signal(false);
  readonly loginError = signal('');
  readonly showLoginPw = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submitLogin() {
    if (this.loginForm.invalid || this.loginLoading()) return;
    this.loginLoading.set(true);
    this.loginError.set('');
    const { email, password } = this.loginForm.value;

    this.authService.loginPaciente(email, password).subscribe({
      next: () => {
        this.loginLoading.set(false);
        this.authModal.close();
      },
      error: () => {
        this.loginError.set('Correo o contraseña incorrectos.');
        this.loginLoading.set(false);
      }
    });
  }

  // ---- REGISTRO ----
  readonly registroLoading = signal(false);
  readonly registroError = signal('');
  readonly registroSuccess = signal(false);
  readonly registroEmail = signal('');
  readonly showRegPw = signal(false);
  readonly showRegConfirm = signal(false);

  registroForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    fechaNacimiento: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', Validators.required],
  }, { validators: regPasswordsMatch });

  submitRegistro() {
    if (this.registroForm.invalid || this.registroLoading()) return;
    this.registroError.set('');
    this.registroLoading.set(true);
    const { confirmarPassword, ...data } = this.registroForm.value;

    this.pacienteAuth.registrar(data).subscribe({
      next: () => {
        this.registroLoading.set(false);
        this.registroEmail.set(data.email);
        this.registroSuccess.set(true);
      },
      error: (err) => {
        this.registroLoading.set(false);
        this.registroError.set(err?.error?.message ?? err?.error?.mensaje ?? 'Error al registrarse. Intenta de nuevo.');
      }
    });
  }

  // ---- FORGOT PASSWORD ----
  readonly fpStep = signal<FpStep>('email');
  readonly fpLoading = signal(false);
  readonly fpError = signal('');
  readonly fpSentEmail = signal('');
  readonly fpDevCode = signal('');
  readonly showFpNew = signal(false);
  readonly showFpConfirm = signal(false);

  readonly fpSteps = [
    { idx: 0, last: false },
    { idx: 1, last: false },
    { idx: 2, last: true },
  ];

  readonly fpStepIndex = () => {
    const map: Record<FpStep, number> = { email: 0, code: 1, password: 2, success: 3 };
    return map[this.fpStep()];
  };

  fpEmailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  fpCodeForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  fpNewPwForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', Validators.required],
  }, { validators: fpPasswordsMatch });

  constructor() {
    effect(() => {
      const v = this.authModal.view();
      if (v === 'recuperar') {
        this.fpStep.set('email');
        this.fpError.set('');
        this.fpDevCode.set('');
        this.fpSentEmail.set('');
        this.fpEmailForm.reset();
        this.fpCodeForm.reset();
        this.fpNewPwForm.reset();
      }
      if (v === 'registro') {
        this.registroSuccess.set(false);
        this.registroError.set('');
        this.registroForm.reset();
      }
      if (v === 'login') {
        this.loginError.set('');
      }
    });
  }

  fpEnviarCodigo() {
    if (this.fpEmailForm.invalid || this.fpLoading()) return;
    this.fpError.set('');
    this.fpLoading.set(true);
    const email = this.fpEmailForm.value.email;

    this.pacienteAuth.forgotPassword(email).subscribe({
      next: (res) => {
        this.fpLoading.set(false);
        this.fpSentEmail.set(email);
        this.fpDevCode.set(res.devCode ?? '');
        this.fpStep.set('code');
      },
      error: (err) => {
        this.fpLoading.set(false);
        this.fpError.set(err?.error?.message ?? err?.error?.mensaje ?? 'No se encontró una cuenta con ese correo.');
      }
    });
  }

  fpVerificarCodigo() {
    if (this.fpCodeForm.invalid || this.fpLoading()) return;
    this.fpError.set('');
    this.fpLoading.set(true);

    this.pacienteAuth.verifyCode(this.fpSentEmail(), this.fpCodeForm.value.code).subscribe({
      next: () => {
        this.fpLoading.set(false);
        this.fpStep.set('password');
      },
      error: (err) => {
        this.fpLoading.set(false);
        this.fpError.set(err?.error?.message ?? err?.error?.mensaje ?? 'Código incorrecto o expirado.');
      }
    });
  }

  fpCambiarPassword() {
    if (this.fpNewPwForm.invalid || this.fpLoading()) return;
    this.fpError.set('');
    this.fpLoading.set(true);

    this.pacienteAuth.resetPassword(this.fpSentEmail(), this.fpCodeForm.value.code, this.fpNewPwForm.value.newPassword).subscribe({
      next: () => {
        this.fpLoading.set(false);
        this.fpStep.set('success');
      },
      error: (err) => {
        this.fpLoading.set(false);
        this.fpError.set(err?.error?.message ?? err?.error?.mensaje ?? 'No se pudo actualizar la contraseña.');
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.authModal.close();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.authModal.close();
    }
  }
}
