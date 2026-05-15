import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center bg-gray-900 border border-gray-800 rounded-2xl p-12 max-w-md w-full">
        <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
        <p class="text-gray-400 mb-8">No tienes permisos para acceder a esta sección.</p>
        <a
          routerLink="/intranet"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Volver al panel
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class AccessDeniedComponent {}
