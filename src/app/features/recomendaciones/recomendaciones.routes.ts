import { Routes } from '@angular/router';

export const RECOMENDACIONES_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'recomendaciones' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
