import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Servicios } from './pages/servicios/servicios';
import { Nosotros } from './pages/nosotros/nosotros';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'servicios', component: Servicios },
  { path: 'nosotros', component: Nosotros },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'acceso-denegado',
    loadComponent: () =>
      import('./features/auth/access-denied/access-denied.component').then(
        m => m.AccessDeniedComponent
      ),
  },

  // Rutas protegidas de la intranet
  {
    path: 'intranet',
    loadComponent: () =>
      import('./layouts/intranet-layout/intranet-layout.component').then(
        m => m.IntranetLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      {
        path: 'pacientes',
        loadChildren: () =>
          import('./features/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA] },
      },
      {
        path: 'citas',
        loadChildren: () =>
          import('./features/citas/citas.routes').then(m => m.CITAS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMINISTRADOR, UserRole.RECEPCIONISTA, UserRole.ODONTOLOGO] },
      },
      {
        path: 'atencion',
        loadChildren: () =>
          import('./features/atencion/atencion.routes').then(m => m.ATENCION_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMINISTRADOR, UserRole.ODONTOLOGO] },
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMINISTRADOR] },
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMINISTRADOR, UserRole.ODONTOLOGO] },
      },
    ],
  },

  // Wildcard: redirigir rutas no encontradas al inicio
  { path: '**', redirectTo: '' },
];
