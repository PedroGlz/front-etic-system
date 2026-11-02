export type LegacyImportStatus = 'UPLOADED' | 'VALIDATING' | 'READY' | 'PROCESSING' | 'VALIDATING_RESULT' | 'COMPLETED' | 'FAILED';
export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface LegacyValidationIssue {
  severity: ValidationSeverity;
  code: string;
  dataset: string | null;
  recordId: string | null;
  message: string;
}

export interface LegacyImportAnalysis {
  clientes: number;
  sitios: number;
  equipos: number;
  categoriasEquipos: number;
  fabricantes: number;
  tiposInspeccion: number;
  estatusInspeccion: number;
  estatusDetalle: number;
  inspecciones: number;
  detalles: number;
  ubicaciones: number;
  lineasBase: number;
  fotosLineaBase: number;
  problemas: number;
  problemasCronicos: number;
  aparicionesProblemas: number;
  aparicionesPie: number;
  fotosProblemas: number;
  severidades: number;
  prioridades: number;
  fallas: number;
  tiposFalla: number;
  causas: number;
  fases: number;
  ambientes: number;
  relacionesEquipoFalla: number;
  alerts: LegacyValidationIssue[];
}

export interface LegacyImportJobStatus {
  id: string;
  status: LegacyImportStatus;
  phase: string;
  progress: number;
  errorMessage: string | null;
}

export interface LegacyImportUploadResponse { id: string; status: LegacyImportStatus; }
export interface LegacyHomologationOption { id: string; label: string; parentId: string | null; }
export interface LegacyInspectionOption { inspectionId: string; inspectionNumber: number | null; inspectionDate: string | null; customerName: string | null; }
export interface LegacyInactivePriority { sourceId: string; sourceLabel: string; }
export interface LegacyHomologationReview {
  inspectionId: string;
  inspectionNumber: number | null;
  automaticInspectionId: string;
  inspections: LegacyInspectionOption[];
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  inactivePriorities: LegacyInactivePriority[];
  priorityBlockers: string[];
  customers: LegacyHomologationOption[];
  priorities: LegacyHomologationOption[];
  siteGroups: LegacyHomologationOption[];
  sites: LegacyHomologationOption[];
}
export interface LegacyHomologationRequest {
  inspectionId: string;
  legalName: string;
  siteGroupId: string;
  siteId: string;
  automaticSelection: boolean;
  priorityMappings: Record<string, string>;
}
export interface TableReconciliation { table: string; source: number; inserted: number; updated: number; skipped: number; skippedDestinationNewer: number; skippedSameDate: number; skippedNoComparableDate: number; warnings: number; errors: number; orphans: number; }
export interface LegacyRecordOutcome { table: string; id: string; action: string; reason: string; sourceDate: string | null; destinationDate: string | null; }
export interface LegacyEtlReport {
  importId: string;
  tables: TableReconciliation[];
  legacyProblems: number;
  problemInspections: number;
  pieProblemInspections: number;
  targetProblems: number;
  chronicFamilies: number;
  historyRelations: number;
  additionalPhotos: number;
  unknownTemperatureUnits: number;
  outcomes: LegacyRecordOutcome[];
  warnings: string[];
}
