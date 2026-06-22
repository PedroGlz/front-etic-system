import { Routes } from '@angular/router';

export const FABRICANTES_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'fabricantes' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
