import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LEGACY_IMPORTS_API_URL } from '@core/config/api-endpoints';
import { LegacyEtlReport, LegacyImportAnalysis, LegacyImportJobStatus, LegacyImportUploadResponse } from '../models/legacy-import.model';

@Injectable()
export class LegacyImportApi {
  constructor(private readonly http: HttpClient) {}

  upload(file: File): Observable<HttpEvent<LegacyImportUploadResponse>> {
    const data = new FormData();
    data.append('file', file);
    return this.http.request<LegacyImportUploadResponse>('POST', LEGACY_IMPORTS_API_URL, {
      body: data,
      reportProgress: true,
      observe: 'events',
      withCredentials: true,
    });
  }

  analysis(id: string): Observable<LegacyImportAnalysis> {
    return this.http.get<LegacyImportAnalysis>(`${LEGACY_IMPORTS_API_URL}/${id}/analysis`, { withCredentials: true });
  }

  status(id: string): Observable<LegacyImportJobStatus> {
    return this.http.get<LegacyImportJobStatus>(`${LEGACY_IMPORTS_API_URL}/${id}`, { withCredentials: true });
  }

  execute(id: string): Observable<LegacyEtlReport> {
    return this.http.post<LegacyEtlReport>(`${LEGACY_IMPORTS_API_URL}/${id}/execute`, {}, { withCredentials: true });
  }

  result(id: string): Observable<LegacyEtlReport> {
    return this.http.get<LegacyEtlReport>(`${LEGACY_IMPORTS_API_URL}/${id}/result`, { withCredentials: true });
  }

  markdown(id: string): Observable<Blob> {
    return this.http.get(`${LEGACY_IMPORTS_API_URL}/${id}/report.md`, { responseType: 'blob', withCredentials: true });
  }
}
