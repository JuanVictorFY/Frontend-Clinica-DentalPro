import { Routes } from '@angular/router';

export const ATENCION_ROUTES: Routes = [
  {
    path: ':citaId',
    loadComponent: () =>
      import('./atencion-form/atencion-form.component').then(
        (m) => m.AtencionFormComponent
      ),
  },
];
