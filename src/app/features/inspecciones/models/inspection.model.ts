export interface InspectionSummary {
  id: string;
  inspectionNumber: number | null;
  previousInspectionNumber: number | null;
  clientId: string;
  clientName: string | null;
  siteGroupId: string;
  siteGroupName: string | null;
  siteId: string;
  siteName: string | null;
  statusId: string;
  statusName: string | null;
  startDate: string | null;
  endDate: string | null;
  daysCount: number | null;
  detailCount: number | null;
  temperatureUnit: string | null;
  photosRoute: string | null;
  latestForSite: boolean;
  editable: boolean;
  deletable: boolean;
  exportable: boolean;
  uploadable: boolean;
  openable: boolean;
}

export interface InspectionSession {
  id: string;
  inspectionNumber: number | null;
  clientId: string;
  clientName: string | null;
  siteId: string;
  siteName: string | null;
  statusId: string;
  statusName: string | null;
}

export interface InspectionUpsertRequest {
  clientId: string;
  siteGroupId: string;
  siteId: string;
  statusId: string;
  temperatureUnit: string;
  startDate: string;
  endDate: string | null;
}

export interface UpdateInspectionStatusRequest {
  statusId: string;
  endDate: string | null;
}

export interface InspectionExportResponse {
  status: number;
  fileName: string;
  downloadUrl: string;
}

export interface InspectionImportResponse {
  status: number;
  processedFiles: number;
  paths: string[];
}

export interface CatalogRecordResponse {
  values: Record<string, unknown>;
}

export interface CatalogOption {
  id: string;
  label: string;
  status: string | null;
  clientId?: string | null;
  siteGroupId?: string | null;
}

export interface ReportTemplateFile {
  name: string;
  extension: string;
  size: number;
  deletable: boolean;
  downloadUrl: string;
}
