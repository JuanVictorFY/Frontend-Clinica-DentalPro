import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);

  /** Señal que indica si la ruta actual es de la intranet o login */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** Ocultar navbar y footer en rutas de intranet y login */
  readonly showPublicLayout = computed(() => {
    const url = this.currentUrl();
    return !url.startsWith('/intranet') && !url.startsWith('/login');
  });
}
