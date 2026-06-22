import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'clientes' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
