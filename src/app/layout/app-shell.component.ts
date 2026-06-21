import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly catalogs = [
    { key: 'grupos', label: 'Grupos', icon: 'pi-users' },
    { key: 'tipos-inspeccion', label: 'Tipos de inspección', icon: 'pi-search' },
    { key: 'tipos-prioridad', label: 'Tipos de prioridad', icon: 'pi-flag' },
    { key: 'estatus-inspeccion', label: 'Estatus de inspección', icon: 'pi-check-circle' },
    { key: 'tipos-ambiente', label: 'Tipos de ambiente', icon: 'pi-cloud' },
    { key: 'fabricantes', label: 'Fabricantes', icon: 'pi-building' },
  ];

  constructor(
    readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }
}
