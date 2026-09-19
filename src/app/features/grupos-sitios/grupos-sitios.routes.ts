import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
export const GRUPOS_SITIOS_ROUTES: Routes = [{ path: '', canActivate: [adminGuard], loadComponent: () => import('./pages/grupos-sitios-list/grupos-sitios-list.component').then((m) => m.GruposSitiosListComponent) }];
