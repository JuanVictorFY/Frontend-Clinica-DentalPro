import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Login: renderizado del lado del cliente
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  // Intranet: renderizado del lado del cliente (requiere autenticación)
  {
    path: 'intranet/**',
    renderMode: RenderMode.Client,
  },
  // Rutas públicas: prerrenderizadas para SEO
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
