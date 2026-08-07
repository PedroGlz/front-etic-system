import { Routes } from '@angular/router';

export const GRUPOS_SITIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/grupos-sitios/pages/grupos-sitios-list/grupos-sitios-list.component').then((module) => module.GruposSitiosListComponent),
  },
];
