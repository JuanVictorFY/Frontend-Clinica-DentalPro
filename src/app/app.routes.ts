import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Servicios } from './pages/servicios/servicios';
import { Nosotros } from './pages/nosotros/nosotros';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' }, // Ruta base (Inicio)
  { path: 'servicios', component: Servicios }, // Tu nueva página
  { path: 'nosotros', component: Nosotros },   // Página de Nosotros
  { path: 'login', component: Login },         // Página de Login
  { path: '**', redirectTo: '' }               // Si la URL no existe, vuelve al inicio
];
