import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./reporte-list/reporte-list.component').then(
        (m) => m.ReporteListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./reporte-view/reporte-view.component').then(
        (m) => m.ReporteViewComponent
      ),
  },
];
