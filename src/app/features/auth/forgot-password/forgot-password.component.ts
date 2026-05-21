import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PacienteAuthService } from '../../../core/services/paciente-auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirm = control.get('confirmarPassword')?.value;
  return password && confirm && password !== confirm ? { noCoinciden: true } : null;
}

type Step = 'email' | 'code' | 'password' | 'success';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12 relative overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-scale-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl animate-scale-pulse" style="animation-delay: 2s;"></div>
      </div>
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px); background-size: 40px 40px;"></div>

      <div class="w-full max-w-md relative z-10">
        <div class="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 md:p-10 backdrop-blur-sm">

          <!-- Logo -->
          <div class="flex items-center justify-center gap-2 mb-8">
            <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3c-2.5 0-4.5 2-4.5 4.5 0 5 6.5 9.5 10.5 12.5 4-3 10.5-7.5 10.5-12.5C22.5 5 20.5 3 18 3c-1.2 0-2.4.6-3 1.5-.6-.9-1.8-1.5-3-1.5z"/>
            </svg>
            <span class="text-2xl font-black text-white tracking-tighter uppercase">Dental<span class="text-blue-400">Pro</span></span>
          </div>

          <!-- Step indicators -->
          @if (step() !== 'success') {
            <div class="flex items-center justify-center gap-2 mb-8">
              @for (s of steps; track s.key) {
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    [class]="stepIndex() > s.index ? 'bg-blue-600 text-white' :
                             stepIndex() === s.index ? 'bg-blue-600 text-white ring-4 ring-blue-500/30' :
                             'bg-gray-800 text-gray-500'">
                    @if (stepIndex() > s.index) {
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                      </svg>
                    } @else {
                      {{ s.index + 1 }}
                    }
                  </div>
                  @if (!s.last) {
                    <div class="w-8 h-px transition-colors duration-300"
                      [class]="stepIndex() > s.index ? 'bg-blue-600' : 'bg-gray-700'">
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Error global -->
          @if (errorMsg()) {
            <div class="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <svg class="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
              </svg>
              <p class="text-sm text-red-300">{{ errorMsg() }}</p>
            </div>
          }

          <!-- STEP 1: Email -->
          @if (step() === 'email') {
            <div class="text-center mb-8">
              <div class="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Recuperar contrase&ntilde;a</h1>
              <p class="text-gray-400 mt-2 text-sm">Ingresa tu correo y te enviaremos un c&oacute;digo de verificaci&oacute;n.</p>
            </div>

            <form [formGroup]="emailForm" (ngSubmit)="enviarCodigo()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Correo electr&oacute;nico</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
                    </svg>
                  </div>
                  <input type="email" formControlName="email"
                    class="w-full pl-12 pr-4 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="correo&#64;ejemplo.com" />
                </div>
                @if (emailForm.get('email')?.invalid && emailForm.get('email')?.touched) {
                  <p class="mt-1.5 text-sm text-red-400">Ingresa un correo electr&oacute;nico v&aacute;lido.</p>
                }
              </div>

              <button type="submit" [disabled]="emailForm.invalid || isLoading()"
                class="w-full py-4 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-base cursor-pointer">
                @if (isLoading()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          <!-- STEP 2: Código -->
          @if (step() === 'code') {
            <div class="text-center mb-8">
              <div class="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Verificar c&oacute;digo</h1>
              <p class="text-gray-400 mt-2 text-sm">
                Ingresamos un c&oacute;digo de 6 d&iacute;gitos a<br>
                <span class="text-blue-400 font-medium">{{ sentEmail() }}</span>
              </p>
            </div>

            <!-- Dev mode hint -->
            @if (devCode()) {
              <div class="mb-5 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                <svg class="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"/>
                </svg>
                <div>
                  <p class="text-xs text-amber-300 font-semibold mb-1">Modo desarrollo — c&oacute;digo:</p>
                  <p class="text-2xl font-black text-amber-400 tracking-[0.4em]">{{ devCode() }}</p>
                </div>
              </div>
            }

            <form [formGroup]="codeForm" (ngSubmit)="verificarCodigo()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">C&oacute;digo de verificaci&oacute;n</label>
                <input type="text" formControlName="code" maxlength="6"
                  class="w-full px-4 py-4 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white text-center text-2xl font-black tracking-[0.5em] placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="------" />
                @if (codeForm.get('code')?.invalid && codeForm.get('code')?.touched) {
                  <p class="mt-1.5 text-sm text-red-400">Ingresa el c&oacute;digo de 6 d&iacute;gitos.</p>
                }
              </div>

              <button type="submit" [disabled]="codeForm.invalid || isLoading()"
                class="w-full py-4 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-base cursor-pointer">
                @if (isLoading()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                } @else {
                  Verificar c&oacute;digo
                }
              </button>

              <button type="button" (click)="volverAlEmail()"
                class="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                Cambiar correo electr&oacute;nico
              </button>
            </form>
          }

          <!-- STEP 3: Nueva contraseña -->
          @if (step() === 'password') {
            <div class="text-center mb-8">
              <div class="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Nueva contrase&ntilde;a</h1>
              <p class="text-gray-400 mt-2 text-sm">Crea una contrase&ntilde;a segura de al menos 6 caracteres.</p>
            </div>

            <form [formGroup]="passwordForm" (ngSubmit)="cambiarPassword()" class="space-y-5">
              <!-- Nueva contraseña -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Nueva contrase&ntilde;a</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                    </svg>
                  </div>
                  <input [type]="showNew() ? 'text' : 'password'" formControlName="newPassword"
                    class="w-full pl-12 pr-12 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="M&iacute;nimo 6 caracteres" />
                  <button type="button" (click)="showNew.set(!showNew())"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                    @if (showNew()) {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched) {
                  <p class="mt-1.5 text-sm text-red-400">La contrase&ntilde;a debe tener al menos 6 caracteres.</p>
                }
              </div>

              <!-- Confirmar contraseña -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Confirmar contrase&ntilde;a</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                    </svg>
                  </div>
                  <input [type]="showConfirm() ? 'text' : 'password'" formControlName="confirmarPassword"
                    class="w-full pl-12 pr-12 py-3.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="Repite la contrase&ntilde;a" />
                  <button type="button" (click)="showConfirm.set(!showConfirm())"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                    @if (showConfirm()) {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (passwordForm.errors?.['noCoinciden'] && passwordForm.get('confirmarPassword')?.touched) {
                  <p class="mt-1.5 text-sm text-red-400">Las contrase&ntilde;as no coinciden.</p>
                }
              </div>

              <button type="submit" [disabled]="passwordForm.invalid || isLoading()"
                class="w-full py-4 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center text-base cursor-pointer">
                @if (isLoading()) {
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          <!-- STEP 4: Éxito -->
          @if (step() === 'success') {
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-white mb-2">Contrase&ntilde;a actualizada</h2>
              <p class="text-gray-400 text-sm mb-8">
                Tu contrase&ntilde;a ha sido cambiada correctamente. Ya puedes iniciar sesi&oacute;n con tu nueva contrase&ntilde;a.
              </p>
              <a routerLink="/login"
                class="inline-flex items-center gap-2 py-3.5 px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 cursor-pointer">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/>
                </svg>
                Iniciar sesi&oacute;n
              </a>
            </div>
          }

          <!-- Volver al login (visible en steps email, code, password) -->
          @if (step() !== 'success') {
            <div class="mt-6 text-center">
              <a routerLink="/login" class="text-sm text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                </svg>
                Volver al inicio de sesi&oacute;n
              </a>
            </div>
          }
        </div>

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
  private readonly authService = inject(PacienteAuthService);

  readonly step = signal<Step>('email');
  readonly isLoading = signal(false);
  readonly errorMsg = signal('');
  readonly sentEmail = signal('');
  readonly devCode = signal('');
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  readonly steps = [
    { key: 'email', index: 0, last: false },
    { key: 'code', index: 1, last: false },
    { key: 'password', index: 2, last: true },
  ];

  readonly stepIndex = () => {
    const map: Record<Step, number> = { email: 0, code: 1, password: 2, success: 3 };
    return map[this.step()];
  };

  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  codeForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  passwordForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', Validators.required]
  }, { validators: passwordsMatch });

  enviarCodigo(): void {
    if (this.emailForm.invalid || this.isLoading()) return;
    this.errorMsg.set('');
    this.isLoading.set(true);
    const email = this.emailForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.sentEmail.set(email);
        this.devCode.set(res.devCode ?? '');
        this.step.set('code');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err?.error?.message ?? err?.error?.mensaje ?? 'No se encontró una cuenta con ese correo.');
      }
    });
  }

  verificarCodigo(): void {
    if (this.codeForm.invalid || this.isLoading()) return;
    this.errorMsg.set('');
    this.isLoading.set(true);
    const code = this.codeForm.value.code;

    this.authService.verifyCode(this.sentEmail(), code).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('password');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err?.error?.message ?? err?.error?.mensaje ?? 'Código incorrecto o expirado.');
      }
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid || this.isLoading()) return;
    this.errorMsg.set('');
    this.isLoading.set(true);
    const { newPassword } = this.passwordForm.value;
    const code = this.codeForm.value.code;

    this.authService.resetPassword(this.sentEmail(), code, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('success');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err?.error?.message ?? err?.error?.mensaje ?? 'No se pudo actualizar la contraseña.');
      }
    });
  }

  volverAlEmail(): void {
    this.step.set('email');
    this.errorMsg.set('');
    this.codeForm.reset();
    this.devCode.set('');
  }
}
