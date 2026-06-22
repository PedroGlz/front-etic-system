import { Routes } from '@angular/router';

export const TIPOS_AMBIENTE_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'tipos-ambiente' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
