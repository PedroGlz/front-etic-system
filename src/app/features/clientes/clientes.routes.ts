import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/clientes/pages/clientes-list/clientes-list.component').then((module) => module.ClientesListComponent),
  },
];
