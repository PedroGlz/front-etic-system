import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
export const PLANTILLAS_REPORTES_ROUTES: Routes = [{ path: '', canActivate: [adminGuard], loadComponent: () => import('./pages/report-templates-page/report-templates-page.component').then((m) => m.ReportTemplatesPageComponent) }];
