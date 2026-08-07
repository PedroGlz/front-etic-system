import { Routes } from '@angular/router';

export const SITIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/sitios/pages/sitios-list/sitios-list.component').then((module) => module.SitiosListComponent),
  },
];
