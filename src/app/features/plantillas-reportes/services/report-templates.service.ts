import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportTemplateFile } from '@features/plantillas-reportes/models/report-template.model';
import { ReportTemplatesApi } from '@features/plantillas-reportes/services/report-templates.api';

@Injectable()
export class ReportTemplatesService {
  constructor(private readonly api: ReportTemplatesApi) {}

  list(): Observable<ReportTemplateFile[]> { return this.api.list(); }
  upload(files: File[]): Observable<void> { return this.api.upload(files); }
  delete(fileNames: string[]): Observable<void> { return this.api.delete(fileNames); }
  download(fileName: string): Observable<Blob> { return this.api.download(fileName); }
}
