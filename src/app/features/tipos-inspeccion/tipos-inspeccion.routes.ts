import { Routes } from '@angular/router';

export const TIPOS_INSPECCION_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'tipos-inspeccion' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
