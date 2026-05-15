import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Servicios } from './pages/servicios/servicios';
import { Nosotros } from './pages/nosotros/nosotros';
import { Contacto } from './pages/contacto/contacto';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'servicios', component: Servicios },
  { path: 'nosotros', component: Nosotros },
  { path: 'contacto', component: Contacto },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  // Rutas de la intranet (protegidas)
  {
    path: 'intranet',
    loadComponent: () =>
      import('./layouts/intranet-layout/intranet-layout.component').then(m => m.IntranetLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'pacientes', pathMatch: 'full' },
      {
        path: 'pacientes',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.RECEPCIONISTA] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/pacientes/components/paciente-form.component').then(m => m.PacienteFormComponent),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./features/pacientes/components/paciente-form.component').then(m => m.PacienteFormComponent),
          }
        ]
      },
      {
        path: 'citas',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.ODONTOLOGO] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/citas/citas.component').then(m => m.CitasComponent),
          },
          {
            path: 'nueva',
            loadComponent: () =>
              import('./features/citas/components/cita-form.component').then(m => m.CitaFormComponent),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./features/citas/components/cita-form.component').then(m => m.CitaFormComponent),
          }
        ]
      },
      {
        path: 'atencion',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.ODONTOLOGO] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/atencion/atencion.component').then(m => m.AtencionComponent),
          },
          {
            path: ':citaId',
            loadComponent: () =>
              import('./features/atencion/components/atencion-form.component').then(m => m.AtencionFormComponent),
          }
        ]
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/usuarios/components/usuario-form.component').then(m => m.UsuarioFormComponent),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./features/usuarios/components/usuario-form.component').then(m => m.UsuarioFormComponent),
          }
        ]
      },
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.ODONTOLOGO] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/reportes/components/reporte-detalle.component').then(m => m.ReporteDetalleComponent),
          }
        ]
      },
      {
        path: 'acceso-denegado',
        loadComponent: () =>
          import('./features/auth/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
      }
    ]
  },

  // Wildcard: redirigir rutas no encontradas al inicio
  { path: '**', redirectTo: '' },
];
