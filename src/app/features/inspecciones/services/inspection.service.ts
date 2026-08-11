import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { InspectionApi } from '@features/inspecciones/services/inspection.api';
import { Cliente } from '@features/clientes/models/cliente.model';
import { GrupoSitios } from '@features/grupos-sitios/models/grupo-sitios.model';
import {
  CatalogOption,
  CatalogRecordResponse,
  InspectionExportResponse,
  InspectionImportResponse,
  InspectionSession,
  InspectionSummary,
  InspectionUpsertRequest,
  ReportTemplateFile,
  UpdateInspectionStatusRequest,
} from '@features/inspecciones/models/inspection.model';
import { Sitio } from '@features/sitios/models/sitio.model';

@Injectable()
export class InspectionService {
  constructor(private readonly api: InspectionApi) {}

  list(): Observable<InspectionSummary[]> {
    return this.api.list();
  }

  create(payload: InspectionUpsertRequest): Observable<InspectionSummary> {
    return this.api.create(payload);
  }

  update(id: string, payload: InspectionUpsertRequest): Observable<InspectionSummary> {
    return this.api.update(id, payload);
  }

  updateStatus(id: string, payload: UpdateInspectionStatusRequest): Observable<InspectionSummary> {
    return this.api.updateStatus(id, payload);
  }

  open(id: string): Observable<InspectionSession> {
    return this.api.open(id);
  }

  currentSelection(): Observable<InspectionSession> {
    return this.api.currentSelection();
  }

  clearSelection(): Observable<void> {
    return this.api.clearSelection();
  }

  deactivate(id: string): Observable<void> {
    return this.api.deactivate(id);
  }

  exportInspection(id: string, siteId: string, fileName: string): Observable<InspectionExportResponse> {
    return this.api.exportInspection(id, siteId, fileName);
  }

  downloadExport(fileName: string): Observable<Blob> {
    return this.api.downloadExport(fileName);
  }

  importInspection(id: string, file: File): Observable<InspectionImportResponse> {
    return this.api.importInspection(id, file);
  }

  downloadProblemsReport(id: string, startDate: string, endDate: string): Observable<Blob> {
    return this.api.downloadProblemsReport(id, startDate, endDate);
  }

  loadReferenceData() {
    return forkJoin({
      clients: this.api.clients(),
      siteGroups: this.api.siteGroups(),
      sites: this.api.sites(),
      statuses: this.api.catalog('estatus-inspeccion'),
    });
  }

  listReportTemplates(): Observable<ReportTemplateFile[]> {
    return this.api.listReportTemplates();
  }

  uploadReportTemplates(files: File[]): Observable<void> {
    return this.api.uploadReportTemplates(files);
  }

  deleteReportTemplates(fileNames: string[]): Observable<void> {
    return this.api.deleteReportTemplates(fileNames);
  }

  downloadReportTemplate(fileName: string): Observable<Blob> {
    return this.api.downloadReportTemplate(fileName);
  }

  toOption(record: CatalogRecordResponse): CatalogOption {
    const values = record.values;
    return {
      id: String(values['id'] ?? ''),
      label: this.displayValue(values),
      status: this.asString(values['status']),
      clientId: this.asString(values['clientId']),
      siteGroupId: this.asString(values['siteGroupId']),
    };
  }

  clientToOption(client: Cliente): CatalogOption {
    return {
      id: client.id,
      label: client.businessName,
      status: client.status,
    };
  }

  siteGroupToOption(group: GrupoSitios): CatalogOption {
    return {
      id: group.id,
      label: group.name,
      status: group.status,
      clientId: group.clientId,
    };
  }

  siteToOption(site: Sitio): CatalogOption {
    return {
      id: site.id,
      label: site.name,
      status: site.status,
      clientId: site.clientId,
      siteGroupId: site.siteGroupId,
    };
  }

  private displayValue(values: Record<string, unknown>): string {
    for (const key of ['businessName', 'commercialName', 'name', 'username', 'email']) {
      const value = values[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
    return String(values['id'] ?? '');
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }
}
