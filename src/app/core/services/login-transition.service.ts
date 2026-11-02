import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginTransitionService {
  readonly active = signal(false);
  readonly message = signal('Iniciando sesión, preparando ETIC Online...');

  start(): void {
    this.active.set(true);
  }

  finish(): void {
    this.active.set(false);
  }
}
