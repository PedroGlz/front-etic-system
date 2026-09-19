import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
export const USUARIOS_ROUTES: Routes = [{ path: '', canActivate: [adminGuard], loadComponent: () => import('./pages/usuarios-list/usuarios-list.component').then((m) => m.UsuariosListComponent) }];
