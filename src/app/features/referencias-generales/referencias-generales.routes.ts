import { Routes } from '@angular/router';

export const REFERENCIAS_GENERALES_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'referencias-generales' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
