import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
export const INSPECCIONES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', canActivate: [adminGuard], loadComponent: () => import('./pages/inspections-page/inspections-page.component').then((m) => m.InspectionsPageComponent) },
  { path: 'actual', canActivate: [adminGuard], loadComponent: () => import('./pages/inspection-workspace-page/inspection-workspace-page.component').then((m) => m.InspectionWorkspacePageComponent) },
];
