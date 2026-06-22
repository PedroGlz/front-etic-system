import { Routes } from '@angular/router';

export const PLANTILLAS_REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/plantillas-reportes/pages/report-templates-page/report-templates-page.component').then((module) => module.ReportTemplatesPageComponent),
  },
];
