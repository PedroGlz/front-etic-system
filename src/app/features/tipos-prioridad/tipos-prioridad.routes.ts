import { Routes } from '@angular/router';

export const TIPOS_PRIORIDAD_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'tipos-prioridad' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
