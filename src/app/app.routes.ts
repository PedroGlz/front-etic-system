import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@features/auth/pages/login/login-page.component').then((module) => module.LoginPageComponent),
  },
  {
    path: '',
    loadComponent: () => import('@layout/main-layout/main-layout.component').then((module) => module.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'inspecciones', loadComponent: () => import('@features/inspecciones/pages/inspections-page/inspections-page.component').then((module) => module.InspectionsPageComponent) },
      { path: 'inspecciones/actual', loadComponent: () => import('@features/inspecciones/pages/inspection-workspace-page/inspection-workspace-page.component').then((module) => module.InspectionWorkspacePageComponent) },
      { path: 'plantillas-reportes', loadComponent: () => import('@features/plantillas-reportes/pages/report-templates-page/report-templates-page.component').then((module) => module.ReportTemplatesPageComponent) },
      { path: 'catalogos/categorias-equipos', data: { catalogKey: 'categorias-equipos' }, loadComponent: () => import('@features/categorias-equipos/pages/categorias-equipos-list/categorias-equipos-list.component').then((module) => module.CategoriasEquiposListComponent) },
      { path: 'catalogos/clientes', loadComponent: () => import('@features/clientes/pages/clientes-list/clientes-list.component').then((module) => module.ClientesListComponent) },
      { path: 'catalogos/grupos-sitios', loadComponent: () => import('@features/grupos-sitios/pages/grupos-sitios-list/grupos-sitios-list.component').then((module) => module.GruposSitiosListComponent) },
      { path: 'catalogos/sitios', loadComponent: () => import('@features/sitios/pages/sitios-list/sitios-list.component').then((module) => module.SitiosListComponent) },
      { path: 'catalogos/tipos-inspeccion', data: { catalogKey: 'tipos-inspeccion' }, loadComponent: () => import('@features/tipos-inspeccion/pages/tipos-inspeccion-list/tipos-inspeccion-list.component').then((module) => module.TiposInspeccionListComponent) },
      { path: 'catalogos/causas-principales', data: { catalogKey: 'causas-principales' }, loadComponent: () => import('@features/causas-principales/pages/causas-principales-list/causas-principales-list.component').then((module) => module.CausasPrincipalesListComponent) },
      { path: 'catalogos/estatus-inspeccion', data: { catalogKey: 'estatus-inspeccion' }, loadComponent: () => import('@features/estatus-inspeccion/pages/estatus-inspeccion-list/estatus-inspeccion-list.component').then((module) => module.EstatusInspeccionListComponent) },
      { path: 'catalogos/fabricantes', data: { catalogKey: 'fabricantes' }, loadComponent: () => import('@features/fabricantes/pages/fabricantes-list/fabricantes-list.component').then((module) => module.FabricantesListComponent) },
      { path: 'catalogos/fases', data: { catalogKey: 'fases' }, loadComponent: () => import('@features/fases/pages/fases-list/fases-list.component').then((module) => module.FasesListComponent) },
      { path: 'catalogos/equipos', data: { catalogKey: 'equipos' }, loadComponent: () => import('@features/equipos/pages/equipos-list/equipos-list.component').then((module) => module.EquiposListComponent) },
      { path: 'catalogos/observaciones-linea-base', data: { catalogKey: 'observaciones-linea-base' }, loadComponent: () => import('@features/observaciones-linea-base/pages/observaciones-linea-base-list/observaciones-linea-base-list.component').then((module) => module.ObservacionesLineaBaseListComponent) },
      { path: 'catalogos/fallas', data: { catalogKey: 'fallas' }, loadComponent: () => import('@features/fallas/pages/fallas-list/fallas-list.component').then((module) => module.FallasListComponent) },
      { path: 'catalogos/recomendaciones', data: { catalogKey: 'recomendaciones' }, loadComponent: () => import('@features/recomendaciones/pages/recomendaciones-list/recomendaciones-list.component').then((module) => module.RecomendacionesListComponent) },
      { path: 'catalogos/referencias-generales', data: { catalogKey: 'referencias-generales' }, loadComponent: () => import('@features/referencias-generales/pages/referencias-generales-list/referencias-generales-list.component').then((module) => module.ReferenciasGeneralesListComponent) },
      { path: 'catalogos/recomendaciones-generales', data: { catalogKey: 'recomendaciones-generales' }, loadComponent: () => import('@features/recomendaciones-generales/pages/recomendaciones-generales-list/recomendaciones-generales-list.component').then((module) => module.RecomendacionesGeneralesListComponent) },
      { path: 'catalogos/tipos-prioridad', data: { catalogKey: 'tipos-prioridad' }, loadComponent: () => import('@features/tipos-prioridad/pages/tipos-prioridad-list/tipos-prioridad-list.component').then((module) => module.TiposPrioridadListComponent) },
      { path: 'catalogos/usuarios', loadComponent: () => import('@features/usuarios/pages/usuarios-list/usuarios-list.component').then((module) => module.UsuariosListComponent) },
      { path: 'catalogos/grupos', data: { catalogKey: 'grupos' }, loadComponent: () => import('@features/grupos/pages/grupos-list/grupos-list.component').then((module) => module.GruposListComponent) },
      { path: 'catalogos/tipos-ambiente', data: { catalogKey: 'tipos-ambiente' }, loadComponent: () => import('@features/tipos-ambiente/pages/tipos-ambiente-list/tipos-ambiente-list.component').then((module) => module.TiposAmbienteListComponent) },
      { path: 'catalogos/tipos-falla', data: { catalogKey: 'tipos-falla' }, loadComponent: () => import('@features/tipos-falla/pages/tipos-falla-list/tipos-falla-list.component').then((module) => module.TiposFallaListComponent) },
      { path: 'catalogos/ubicaciones', data: { catalogKey: 'ubicaciones' }, loadComponent: () => import('@features/ubicaciones/pages/ubicaciones-list/ubicaciones-list.component').then((module) => module.UbicacionesListComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'catalogos/fabricantes' },
    ],
  },
  { path: '**', redirectTo: '' },
];
