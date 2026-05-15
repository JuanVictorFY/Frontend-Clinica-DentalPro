import { Routes } from '@angular/router';

export const CITAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./cita-list/cita-list.component').then(
        (m) => m.CitaListComponent
      ),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./cita-form/cita-form.component').then(
        (m) => m.CitaFormComponent
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./cita-form/cita-form.component').then(
        (m) => m.CitaFormComponent
      ),
  },
];
