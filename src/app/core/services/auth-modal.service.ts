import { Injectable, signal } from '@angular/core';

export type ModalView = 'none' | 'login' | 'registro' | 'recuperar';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  readonly view = signal<ModalView>('none');
  open(v: ModalView) { this.view.set(v); }
  close() { this.view.set('none'); }
}

