import { Routes } from '@angular/router';

export const ESTATUS_INSPECCION_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'estatus-inspeccion' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
