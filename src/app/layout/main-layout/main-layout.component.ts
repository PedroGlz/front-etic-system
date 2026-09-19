import { Component, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@core/auth/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { APP_MENU_GROUPS } from '@layout/config/menu.config';
import { MenuGroup, MenuItem } from '@layout/models/navigation.model';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss', './main-layout-responsive.component.scss'],
})
export class MainLayoutComponent {
  readonly menuGroups: MenuGroup[] = APP_MENU_GROUPS;
  readonly sidebarCollapsed = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly openSubmenuKey = signal<string | null>(null);

  constructor(
    readonly authService: AuthService,
    readonly themeService: ThemeService,
    private readonly router: Router,
  ) {}

  visibleItems(group: MenuGroup): MenuItem[] {
    const isAdministrator = this.authService.currentUser()?.groupName === 'Administradores';
    if (group.adminOnly && !isAdministrator) return [];
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
    if (window.matchMedia('(max-width: 900px)').matches) {
      this.mobileMenuOpen.update((value) => !value);
      return;
    }
    this.openSubmenuKey.set(null);
    this.sidebarCollapsed.update((value) => !value);
  }

  toggleSubmenu(item: MenuItem): void {
    this.openSubmenuKey.update((key) => key === item.key ? null : item.key);
  }

  isSubmenuOpen(item: MenuItem): boolean {
    return this.openSubmenuKey() === item.key;
  }

  closeNavigation(): void {
    this.mobileMenuOpen.set(false);
    this.openSubmenuKey.set(null);
  }

  closeSubmenuOnScroll(): void {
    this.openSubmenuKey.set(null);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeNavigation();
  }

  logout(): void {
    this.closeNavigation();
    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }
}
