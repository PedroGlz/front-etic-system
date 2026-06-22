import { Routes } from '@angular/router';

export const SITIOS_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'sitios' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
