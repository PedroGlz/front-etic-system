import { Routes } from '@angular/router';
export const INSPECCIONES_ROUTES: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/inspections-page/inspections-page.component').then((m) => m.InspectionsPageComponent) },
  { path: 'actual', loadComponent: () => import('./pages/inspection-workspace-page/inspection-workspace-page.component').then((m) => m.InspectionWorkspacePageComponent) },
];
