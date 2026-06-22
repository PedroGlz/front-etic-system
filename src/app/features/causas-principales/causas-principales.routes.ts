import { Routes } from '@angular/router';

export const CAUSAS_PRINCIPALES_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'causas-principales' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
