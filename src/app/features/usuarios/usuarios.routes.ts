import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'usuarios' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
