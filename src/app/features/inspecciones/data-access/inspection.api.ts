import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, CATALOGS_API_URL, INSPECTIONS_API_URL } from '@core/http/api-endpoints';
import {
  CatalogRecordResponse,
  InspectionExportResponse,
  InspectionImportResponse,
  InspectionSession,
  InspectionSummary,
  InspectionUpsertRequest,
  ReportTemplateFile,
  UpdateInspectionStatusRequest,
} from '@features/inspecciones/models/inspection.model';

@Injectable()
export class InspectionApi {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<InspectionSummary[]> {
    return this.http.get<InspectionSummary[]>(INSPECTIONS_API_URL, { withCredentials: true });
  }

  create(payload: InspectionUpsertRequest): Observable<InspectionSummary> {
    return this.http.post<InspectionSummary>(INSPECTIONS_API_URL, payload, { withCredentials: true });
  }

  update(id: string, payload: InspectionUpsertRequest): Observable<InspectionSummary> {
    return this.http.put<InspectionSummary>(`${INSPECTIONS_API_URL}/${id}`, payload, { withCredentials: true });
  }

  updateStatus(id: string, payload: UpdateInspectionStatusRequest): Observable<InspectionSummary> {
    return this.http.put<InspectionSummary>(`${INSPECTIONS_API_URL}/${id}/estatus`, payload, { withCredentials: true });
  }

  open(id: string): Observable<InspectionSession> {
    return this.http.post<InspectionSession>(`${INSPECTIONS_API_URL}/${id}/abrir`, {}, { withCredentials: true });
  }

  currentSelection(): Observable<InspectionSession> {
    return this.http.get<InspectionSession>(`${INSPECTIONS_API_URL}/seleccion`, { withCredentials: true });
  }

  clearSelection(): Observable<void> {
    return this.http.delete<void>(`${INSPECTIONS_API_URL}/seleccion`, { withCredentials: true });
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${INSPECTIONS_API_URL}/${id}`, { withCredentials: true });
  }

  exportInspection(id: string, siteId: string, fileName: string): Observable<InspectionExportResponse> {
    const params = new HttpParams().set('fileName', fileName).set('siteId', siteId);
    return this.http.post<InspectionExportResponse>(`${INSPECTIONS_API_URL}/${id}/exportar`, null, { params, withCredentials: true });
  }

  downloadExport(fileName: string): Observable<Blob> {
    return this.http.get(`${INSPECTIONS_API_URL}/exportaciones/${fileName}`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  importInspection(file: File): Observable<InspectionImportResponse> {
    const formData = new FormData();
    formData.append('bd_inspeccion', file);
    return this.http.post<InspectionImportResponse>(`${INSPECTIONS_API_URL}/importar`, formData, { withCredentials: true });
  }

  downloadProblemsReport(id: string, startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get(`${INSPECTIONS_API_URL}/${id}/reporte-problemas`, {
      params,
      responseType: 'blob',
      withCredentials: true,
    });
  }

  catalog(key: string): Observable<CatalogRecordResponse[]> {
    return this.http.get<CatalogRecordResponse[]>(`${CATALOGS_API_URL}/${key}`, { withCredentials: true });
  }

  listReportTemplates(): Observable<ReportTemplateFile[]> {
    return this.http.get<ReportTemplateFile[]>(`${API_BASE_URL}/plantillas-reportes`, { withCredentials: true });
  }

  uploadReportTemplates(files: File[]): Observable<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<void>(`${API_BASE_URL}/plantillas-reportes`, formData, { withCredentials: true });
  }

  deleteReportTemplates(fileNames: string[]): Observable<void> {
    let params = new HttpParams();
    fileNames.forEach((fileName) => {
      params = params.append('files', fileName);
    });
    return this.http.delete<void>(`${API_BASE_URL}/plantillas-reportes`, { params, withCredentials: true });
  }

  downloadReportTemplate(fileName: string): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/plantillas-reportes/descargar/${encodeURIComponent(fileName)}`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }
}
