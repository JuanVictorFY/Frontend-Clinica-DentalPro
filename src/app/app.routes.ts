import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Servicios } from './pages/servicios/servicios';

export const routes: Routes = [
  { path: '', component: Home },               // Ruta base (Inicio)
  { path: 'servicios', component: Servicios }, // Tu nueva página
  { path: '**', redirectTo: '' }               // Si la URL no existe, vuelve al inicio
];
