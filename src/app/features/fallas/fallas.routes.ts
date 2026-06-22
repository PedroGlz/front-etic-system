import { Routes } from '@angular/router';

export const FALLAS_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'fallas' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
