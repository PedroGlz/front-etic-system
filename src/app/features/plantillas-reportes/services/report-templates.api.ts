import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-endpoints';
import { ReportTemplateFile } from '@features/plantillas-reportes/models/report-template.model';

@Injectable()
export class ReportTemplatesApi {
  private readonly url = `${API_BASE_URL}/plantillas-reportes`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ReportTemplateFile[]> {
    return this.http.get<ReportTemplateFile[]>(this.url, { withCredentials: true });
  }

  upload(files: File[]): Observable<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<void>(this.url, formData, { withCredentials: true });
  }

  delete(fileNames: string[]): Observable<void> {
    let params = new HttpParams();
    fileNames.forEach((fileName) => params = params.append('files', fileName));
    return this.http.delete<void>(this.url, { params, withCredentials: true });
  }

  download(fileName: string): Observable<Blob> {
    return this.http.get(`${this.url}/descargar/${encodeURIComponent(fileName)}`, { responseType: 'blob', withCredentials: true });
  }
}
