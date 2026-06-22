import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@features/auth/auth.routes').then((module) => module.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () => import('@core/layout/app-shell/app-shell.component').then((module) => module.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'catalogos/clientes', loadChildren: () => import('@features/clientes/clientes.routes').then((module) => module.CLIENTES_ROUTES) },
      { path: 'catalogos/grupos-sitios', loadChildren: () => import('@features/grupos-sitios/grupos-sitios.routes').then((module) => module.GRUPOS_SITIOS_ROUTES) },
      { path: 'catalogos/sitios', loadChildren: () => import('@features/sitios/sitios.routes').then((module) => module.SITIOS_ROUTES) },
      { path: 'catalogos/tipos-inspeccion', loadChildren: () => import('@features/tipos-inspeccion/tipos-inspeccion.routes').then((module) => module.TIPOS_INSPECCION_ROUTES) },
      { path: 'catalogos/causas-principales', loadChildren: () => import('@features/causas-principales/causas-principales.routes').then((module) => module.CAUSAS_PRINCIPALES_ROUTES) },
      { path: 'catalogos/estatus-inspeccion', loadChildren: () => import('@features/estatus-inspeccion/estatus-inspeccion.routes').then((module) => module.ESTATUS_INSPECCION_ROUTES) },
      { path: 'catalogos/fabricantes', loadChildren: () => import('@features/fabricantes/fabricantes.routes').then((module) => module.FABRICANTES_ROUTES) },
      { path: 'catalogos/observaciones-linea-base', loadChildren: () => import('@features/observaciones-linea-base/observaciones-linea-base.routes').then((module) => module.OBSERVACIONES_LINEA_BASE_ROUTES) },
      { path: 'catalogos/fallas', loadChildren: () => import('@features/fallas/fallas.routes').then((module) => module.FALLAS_ROUTES) },
      { path: 'catalogos/recomendaciones', loadChildren: () => import('@features/recomendaciones/recomendaciones.routes').then((module) => module.RECOMENDACIONES_ROUTES) },
      { path: 'catalogos/referencias-generales', loadChildren: () => import('@features/referencias-generales/referencias-generales.routes').then((module) => module.REFERENCIAS_GENERALES_ROUTES) },
      { path: 'catalogos/recomendaciones-generales', loadChildren: () => import('@features/recomendaciones-generales/recomendaciones-generales.routes').then((module) => module.RECOMENDACIONES_GENERALES_ROUTES) },
      { path: 'catalogos/tipos-prioridad', loadChildren: () => import('@features/tipos-prioridad/tipos-prioridad.routes').then((module) => module.TIPOS_PRIORIDAD_ROUTES) },
      { path: 'catalogos/usuarios', loadChildren: () => import('@features/usuarios/usuarios.routes').then((module) => module.USUARIOS_ROUTES) },
      { path: 'catalogos/grupos', loadChildren: () => import('@features/grupos/grupos.routes').then((module) => module.GRUPOS_ROUTES) },
      { path: 'catalogos/tipos-ambiente', loadChildren: () => import('@features/tipos-ambiente/tipos-ambiente.routes').then((module) => module.TIPOS_AMBIENTE_ROUTES) },
      { path: 'catalogos/tipos-falla', loadChildren: () => import('@features/tipos-falla/tipos-falla.routes').then((module) => module.TIPOS_FALLA_ROUTES) },
      { path: '', pathMatch: 'full', redirectTo: 'catalogos/fabricantes' },
    ],
  },
  { path: '**', redirectTo: '' },
];
