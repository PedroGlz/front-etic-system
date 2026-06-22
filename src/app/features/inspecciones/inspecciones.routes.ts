import { Routes } from '@angular/router';

export const INSPECCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/inspecciones/pages/inspections-page/inspections-page.component').then((module) => module.InspectionsPageComponent),
  },
  {
    path: 'actual',
    loadComponent: () => import('@features/inspecciones/pages/inspection-workspace-page/inspection-workspace-page.component').then((module) => module.InspectionWorkspacePageComponent),
  },
];
