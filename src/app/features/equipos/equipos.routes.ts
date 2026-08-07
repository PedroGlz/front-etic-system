import { Routes } from '@angular/router';

export const EQUIPOS_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'equipos' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
