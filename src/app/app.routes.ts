import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home }, // Esto le dice a Angular: "En el inicio, carga Home"
];
