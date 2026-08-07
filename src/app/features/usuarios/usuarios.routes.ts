import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/usuarios/pages/usuarios-list/usuarios-list.component').then((module) => module.UsuariosListComponent),
  },
];
