import { Routes } from '@angular/router';

export const GRUPOS_SITIOS_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'grupos-sitios' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
