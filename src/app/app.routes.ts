import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then((module) => module.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/app-shell.component').then((module) => module.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'catalogos/:catalogKey',
        loadComponent: () => import('./features/catalogs/catalog-page.component').then((module) => module.CatalogPageComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'catalogos/grupos' },
    ],
  },
  { path: '**', redirectTo: '' },
];
