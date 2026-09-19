import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
export const SITIOS_ROUTES: Routes = [{ path: '', canActivate: [adminGuard], loadComponent: () => import('./pages/sitios-list/sitios-list.component').then((m) => m.SitiosListComponent) }];
