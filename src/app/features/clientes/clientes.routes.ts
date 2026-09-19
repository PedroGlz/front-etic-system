import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
export const CLIENTES_ROUTES: Routes = [{ path: '', canActivate: [adminGuard], loadComponent: () => import('./pages/clientes-list/clientes-list.component').then((m) => m.ClientesListComponent) }];
