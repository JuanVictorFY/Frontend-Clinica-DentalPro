import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'dental_pro_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Aplicar tema al iniciar
    this.applyTheme(this.theme());

    // Reaccionar a cambios de tema
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_KEY, currentTheme);
      }
    });
  }

  /** Alterna entre modo claro y oscuro */
  toggle(): void {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }

  /** Establece un tema específico */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  /** Verifica si el tema actual es oscuro */
  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    return stored ?? 'dark';
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }
}
