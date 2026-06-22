import { Routes } from '@angular/router';

export const OBSERVACIONES_LINEA_BASE_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'observaciones-linea-base' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
