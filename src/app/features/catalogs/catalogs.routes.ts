import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';

export const CATALOGS_ROUTES: Routes = [
  { path: 'categorias-equipos', data: { catalogKey: 'categorias-equipos' }, loadComponent: () => import('@features/categorias-equipos/pages/categorias-equipos-list/categorias-equipos-list.component').then((m) => m.CategoriasEquiposListComponent) },
  { path: 'causas-principales', data: { catalogKey: 'causas-principales' }, loadComponent: () => import('@features/causas-principales/pages/causas-principales-list/causas-principales-list.component').then((m) => m.CausasPrincipalesListComponent) },
  { path: 'estatus-inspeccion', canActivate: [adminGuard], data: { catalogKey: 'estatus-inspeccion' }, loadComponent: () => import('@features/estatus-inspeccion/pages/estatus-inspeccion-list/estatus-inspeccion-list.component').then((m) => m.EstatusInspeccionListComponent) },
  { path: 'estatus-inspeccion-det', canActivate: [adminGuard], data: { catalogKey: 'estatus-inspeccion-det' }, loadComponent: () => import('@features/estatus-inspeccion-det/pages/estatus-inspeccion-det-list/estatus-inspeccion-det-list.component').then((m) => m.EstatusInspeccionDetListComponent) },
  { path: 'fabricantes', data: { catalogKey: 'fabricantes' }, loadComponent: () => import('@features/fabricantes/pages/fabricantes-list/fabricantes-list.component').then((m) => m.FabricantesListComponent) },
  { path: 'fases', data: { catalogKey: 'fases' }, loadComponent: () => import('@features/fases/pages/fases-list/fases-list.component').then((m) => m.FasesListComponent) },
  { path: 'equipos', data: { catalogKey: 'equipos' }, loadComponent: () => import('@features/equipos/pages/equipos-list/equipos-list.component').then((m) => m.EquiposListComponent) },
  { path: 'observaciones-linea-base', data: { catalogKey: 'observaciones-linea-base' }, loadComponent: () => import('@features/observaciones-linea-base/pages/observaciones-linea-base-list/observaciones-linea-base-list.component').then((m) => m.ObservacionesLineaBaseListComponent) },
  { path: 'fallas', data: { catalogKey: 'fallas' }, loadComponent: () => import('@features/fallas/pages/fallas-list/fallas-list.component').then((m) => m.FallasListComponent) },
  { path: 'recomendaciones', data: { catalogKey: 'recomendaciones' }, loadComponent: () => import('@features/recomendaciones/pages/recomendaciones-list/recomendaciones-list.component').then((m) => m.RecomendacionesListComponent) },
  { path: 'referencias-generales', data: { catalogKey: 'referencias-generales' }, loadComponent: () => import('@features/referencias-generales/pages/referencias-generales-list/referencias-generales-list.component').then((m) => m.ReferenciasGeneralesListComponent) },
  { path: 'recomendaciones-generales', data: { catalogKey: 'recomendaciones-generales' }, loadComponent: () => import('@features/recomendaciones-generales/pages/recomendaciones-generales-list/recomendaciones-generales-list.component').then((m) => m.RecomendacionesGeneralesListComponent) },
  { path: 'tipos-inspeccion', canActivate: [adminGuard], data: { catalogKey: 'tipos-inspeccion' }, loadComponent: () => import('@features/tipos-inspeccion/pages/tipos-inspeccion-list/tipos-inspeccion-list.component').then((m) => m.TiposInspeccionListComponent) },
  { path: 'tipos-prioridad', canActivate: [adminGuard], data: { catalogKey: 'tipos-prioridad' }, loadComponent: () => import('@features/tipos-prioridad/pages/tipos-prioridad-list/tipos-prioridad-list.component').then((m) => m.TiposPrioridadListComponent) },
  { path: 'grupos', canActivate: [adminGuard], data: { catalogKey: 'grupos' }, loadComponent: () => import('@features/grupos/pages/grupos-list/grupos-list.component').then((m) => m.GruposListComponent) },
  { path: 'tipos-ambiente', data: { catalogKey: 'tipos-ambiente' }, loadComponent: () => import('@features/tipos-ambiente/pages/tipos-ambiente-list/tipos-ambiente-list.component').then((m) => m.TiposAmbienteListComponent) },
  { path: 'tipos-falla', data: { catalogKey: 'tipos-falla' }, loadComponent: () => import('@features/tipos-falla/pages/tipos-falla-list/tipos-falla-list.component').then((m) => m.TiposFallaListComponent) },
];
