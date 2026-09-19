import { Routes } from '@angular/router';
export const UBICACIONES_ROUTES: Routes = [{ path: '', data: { catalogKey: 'ubicaciones' }, loadComponent: () => import('./pages/ubicaciones-list/ubicaciones-list.component').then((m) => m.UbicacionesListComponent) }];
