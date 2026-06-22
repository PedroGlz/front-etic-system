import { Routes } from '@angular/router';

export const RECOMENDACIONES_GENERALES_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'recomendaciones-generales' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
