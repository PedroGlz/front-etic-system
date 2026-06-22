import { Routes } from '@angular/router';

export const GRUPOS_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'grupos' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
