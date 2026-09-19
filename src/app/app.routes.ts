import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('@features/auth/pages/login/login-page.component').then((m) => m.LoginPageComponent) },
  {
    path: '',
    loadComponent: () => import('@layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'inspecciones', loadChildren: () => import('@features/inspecciones/inspecciones.routes').then((m) => m.INSPECCIONES_ROUTES) },
      { path: 'plantillas-reportes', loadChildren: () => import('@features/plantillas-reportes/plantillas-reportes.routes').then((m) => m.PLANTILLAS_REPORTES_ROUTES) },
      { path: 'legacy-import', loadChildren: () => import('@features/legacy-import/legacy-import.routes').then((m) => m.LEGACY_IMPORT_ROUTES) },
      { path: 'catalogos/clientes', loadChildren: () => import('@features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES) },
      { path: 'catalogos/grupos-sitios', loadChildren: () => import('@features/grupos-sitios/grupos-sitios.routes').then((m) => m.GRUPOS_SITIOS_ROUTES) },
      { path: 'catalogos/sitios', loadChildren: () => import('@features/sitios/sitios.routes').then((m) => m.SITIOS_ROUTES) },
      { path: 'catalogos/usuarios', loadChildren: () => import('@features/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES) },
      { path: 'catalogos/ubicaciones', loadChildren: () => import('@features/ubicaciones/ubicaciones.routes').then((m) => m.UBICACIONES_ROUTES) },
      { path: 'catalogos', loadChildren: () => import('@features/catalogs/catalogs.routes').then((m) => m.CATALOGS_ROUTES) },
      { path: '', pathMatch: 'full', redirectTo: 'catalogos/fabricantes' },
    ],
  },
  { path: '**', redirectTo: '' },
];
