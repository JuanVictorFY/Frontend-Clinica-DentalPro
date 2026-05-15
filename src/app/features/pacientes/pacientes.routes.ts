import { Routes } from '@angular/router';

export const PACIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paciente-list/paciente-list.component').then(
        (m) => m.PacienteListComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./paciente-form/paciente-form.component').then(
        (m) => m.PacienteFormComponent
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./paciente-form/paciente-form.component').then(
        (m) => m.PacienteFormComponent
      ),
  },
];
