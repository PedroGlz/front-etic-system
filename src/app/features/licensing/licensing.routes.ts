import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';

export const LICENSING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'applications' },
  { path: 'applications', canActivate: [adminGuard], loadComponent: () => import('./applications/applications-page.component').then(m => m.ApplicationsPageComponent) },
  { path: 'versions', canActivate: [adminGuard], loadComponent: () => import('./versions/versions-page.component').then(m => m.VersionsPageComponent) },
  { path: 'access', canActivate: [adminGuard], loadComponent: () => import('./access/access-page.component').then(m => m.AccessPageComponent) },
  { path: 'devices', canActivate: [adminGuard], loadComponent: () => import('./devices/devices-page.component').then(m => m.DevicesPageComponent) },
  { path: 'licenses', canActivate: [adminGuard], loadComponent: () => import('./licenses/licenses-page.component').then(m => m.LicensesPageComponent) },
];
