import { Routes } from '@angular/router';

export const TIPOS_FALLA_ROUTES: Routes = [
  { path: '', data: { catalogKey: 'tipos-falla' }, loadComponent: () => import('@features/catalogs/shared/pages/catalog-route-page.component').then((module) => module.CatalogRoutePageComponent) },
];
