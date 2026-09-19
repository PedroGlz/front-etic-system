import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
export const LEGACY_IMPORT_ROUTES: Routes = [{ path: '', canActivate: [adminGuard], loadComponent: () => import('./pages/legacy-import-page/legacy-import-page.component').then((m) => m.LegacyImportPageComponent) }];
