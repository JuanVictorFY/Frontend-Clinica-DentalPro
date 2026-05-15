import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas protegidas de la intranet: renderizado del lado del cliente
  // (requieren autenticación, no se pueden prerrenderizar)
  {
    path: 'intranet/**',
    renderMode: RenderMode.Client,
  },
  // Login y acceso denegado: renderizado del lado del cliente
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'acceso-denegado',
    renderMode: RenderMode.Client,
  },
  // Rutas públicas: prerrenderizadas para SEO
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
