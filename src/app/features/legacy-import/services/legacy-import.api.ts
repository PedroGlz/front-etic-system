import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LEGACY_IMPORTS_API_URL } from '@core/config/api-endpoints';
import { LegacyEtlReport, LegacyHomologationRequest, LegacyHomologationReview, LegacyImportAnalysis, LegacyImportError, LegacyImportJobStatus, LegacyImportUploadResponse } from '../models/legacy-import.model';

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

  active(): Observable<LegacyImportJobStatus | null> {
    return this.http.get<LegacyImportJobStatus | null>(`${LEGACY_IMPORTS_API_URL}/active`, { withCredentials: true });
  }

  homologation(id: string, inspectionId?: string): Observable<LegacyHomologationReview> {
    const params = inspectionId ? { inspectionId } : undefined;
    return this.http.get<LegacyHomologationReview>(`${LEGACY_IMPORTS_API_URL}/${id}/homologation`, { params, withCredentials: true });
  }

  execute(id: string, request: LegacyHomologationRequest): Observable<void> {
    return this.http.post<void>(`${LEGACY_IMPORTS_API_URL}/${id}/execute`, request, { withCredentials: true });
  }

  result(id: string): Observable<LegacyEtlReport> {
    return this.http.get<LegacyEtlReport>(`${LEGACY_IMPORTS_API_URL}/${id}/result`, { withCredentials: true });
  }

  markdown(id: string): Observable<Blob> {
    return this.http.get(`${LEGACY_IMPORTS_API_URL}/${id}/report.md`, { responseType: 'blob', withCredentials: true });
  }

  error(id: string): Observable<LegacyImportError> {
    return this.http.get<LegacyImportError>(`${LEGACY_IMPORTS_API_URL}/${id}/error`, { withCredentials: true });
  }

  errorReport(id: string): Observable<Blob> {
    return this.http.get(`${LEGACY_IMPORTS_API_URL}/${id}/error.txt`, { responseType: 'blob', withCredentials: true });
  }
}
