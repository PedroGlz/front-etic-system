import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@core/auth/services/auth.service';
import { APP_MENU_GROUPS } from '@layout/config/menu.config';
import { MenuGroup, MenuItem } from '@layout/models/navigation.model';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly menuGroups: MenuGroup[] = APP_MENU_GROUPS;
  readonly sidebarCollapsed = signal(false);

  constructor(
    readonly authService: AuthService,
    readonly themeService: ThemeService,
    private readonly router: Router,
  ) {}

  visibleItems(group: MenuGroup): MenuItem[] {
    const isAdministrator = this.authService.currentUser()?.groupName === 'Administradores';
    if (group.adminOnly && !isAdministrator) {
      return [];
    }
    return group.items.filter((item) => !item.adminOnly || isAdministrator);
  }

  visibleChildren(item: MenuItem): MenuItem[] {
    const isAdministrator = this.authService.currentUser()?.groupName === 'Administradores';
    return (item.children ?? []).filter((child) => !child.adminOnly || isAdministrator);
  }

  itemRoute(item: MenuItem): string[] {
    return item.route ? [item.route] : ['/catalogos', item.key];
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }
}
