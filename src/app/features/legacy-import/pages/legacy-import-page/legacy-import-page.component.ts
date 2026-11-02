import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { LegacyEtlReport, LegacyHomologationReview, LegacyImportAnalysis, LegacyImportJobStatus, LegacyValidationIssue } from '../../models/legacy-import.model';
import { LegacyImportApi } from '../../services/legacy-import.api';

@Component({ selector: 'app-legacy-import-page', standalone: true, imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, ProgressBarModule, SelectModule], providers: [LegacyImportApi], templateUrl: './legacy-import-page.component.html', styleUrl: './legacy-import-page.component.scss' })
export class LegacyImportPageComponent implements OnInit, OnDestroy {
  private readonly api = inject(LegacyImportApi);
  private readonly destroyRef = inject(DestroyRef);
  private polling?: Subscription;
  readonly file = signal<File | null>(null);
  readonly importId = signal<string | null>(null);
  readonly uploadProgress = signal(0);
  readonly job = signal<LegacyImportJobStatus | null>(null);
  readonly analysis = signal<LegacyImportAnalysis | null>(null);
  readonly report = signal<LegacyEtlReport | null>(null);
  readonly busy = signal(false);
  readonly outcomeTable = signal<string | null>(null);
  readonly homologation = signal<LegacyHomologationReview | null>(null);
  readonly homologationVisible = signal(false);
  readonly selectedInspectionId = signal<string | null>(null);
  readonly automaticSelection = signal(true);
  readonly legalName = signal('');
  readonly selectedCustomerLegalName = signal<string | null>(null);
  readonly siteGroupId = signal<string | null>(null);
  readonly siteId = signal<string | null>(null);
  readonly priorityMappings = signal<Record<string, string>>({});
  readonly errors = computed(() => this.issues('ERROR'));
  readonly warnings = computed(() => this.issues('WARNING'));
  readonly information = computed(() => this.issues('INFO'));
  readonly canExecute = computed(() => !!this.analysis() && this.errors().length === 0 && !this.busy());
  readonly groupOptions = computed(() => this.homologation()?.siteGroups.filter((item) => item.parentId?.toLowerCase() === this.homologation()?.customerId.toLowerCase()) ?? []);
  readonly siteOptions = computed(() => this.homologation()?.sites.filter((item) => item.parentId?.toLowerCase() === this.siteGroupId()?.toLowerCase()) ?? []);
  readonly inspectionOptions = computed(() => this.homologation()?.inspections.map((item) => ({...item,label: `#${item.inspectionNumber ?? 'Sin número'} · ${item.inspectionDate || 'Sin fecha'} · ${item.customerName || 'Sin cliente'} · ${item.inspectionId}`})) ?? []);
  readonly canConfirmHomologation = computed(() => {
    const review = this.homologation();
    if (!review || review.priorityBlockers.length || !this.legalName().trim() || !this.siteGroupId() || !this.siteId() || this.busy()) return false;
    return review.inactivePriorities.every((priority) => !!this.priorityMappings()[priority.sourceId]);
  });

  ngOnInit(): void { this.restoreActive(); }
  ngOnDestroy(): void { this.stopPolling(); }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0] ?? null;
    if (selected && !selected.name.toLowerCase().endsWith('.sql')) { input.value = ''; void Swal.fire('Archivo inválido', 'Selecciona un archivo SQL.', 'warning'); return; }
    this.file.set(selected);
  }

  upload(): void {
    const selected = this.file(); if (!selected || this.busy()) return;
    this.busy.set(true); this.uploadProgress.set(0);
    this.api.upload(selected).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) this.uploadProgress.set(Math.round(event.loaded * 100 / event.total));
        if (event.type === HttpEventType.Response && event.body) { const id = event.body.id; this.importId.set(id); this.loadAnalysis(id); }
      },
      error: (error: HttpErrorResponse) => this.fail('No fue posible cargar el archivo', error),
    });
  }

  async execute(): Promise<void> {
    const id = this.importId(); if (!id || !this.canExecute()) return;
    this.loadHomologation(id, undefined, true);
  }

  confirmHomologation(): void {
    const id = this.importId(); const review = this.homologation();
    if (!id || !review || !this.canConfirmHomologation()) return;
    this.busy.set(true); this.report.set(null);
    this.api.execute(id, { inspectionId: review.inspectionId, legalName: this.legalName().trim(), siteGroupId: this.siteGroupId()!, siteId: this.siteId()!, automaticSelection: this.automaticSelection(), priorityMappings: this.priorityMappings() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.homologationVisible.set(false); this.startPolling(id); },
      error: (error: HttpErrorResponse) => { this.stopPolling(); this.fail('La importación no pudo iniciarse', error); this.refreshStatus(id); },
    });
  }

  selectExistingLegalName(value: string | null): void { this.selectedCustomerLegalName.set(value); if (value) this.legalName.set(value); }
  changeGroup(value: string | null): void { this.siteGroupId.set(value); if (!this.siteOptions().some((item) => item.id === this.siteId())) this.siteId.set(null); }
  setPriority(sourceId: string, targetId: string | null): void { const values={...this.priorityMappings()};if(targetId)values[sourceId]=targetId;else delete values[sourceId];this.priorityMappings.set(values); }
  changeInspection(inspectionId: string): void { const id=this.importId();if(!id||!inspectionId||inspectionId===this.homologation()?.inspectionId)return;this.loadHomologation(id,inspectionId,false); }

  reset(): void { this.stopPolling(); this.file.set(null); this.importId.set(null); this.job.set(null); this.analysis.set(null); this.report.set(null); this.outcomeTable.set(null); this.homologation.set(null); this.homologationVisible.set(false); this.selectedInspectionId.set(null); this.automaticSelection.set(true); this.uploadProgress.set(0); this.busy.set(false); }
  formatBytes(bytes: number): string { return bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
  phaseName(phase: string): string { return ({ CATALOGS: 'Catálogos', CUSTOMERS: 'Clientes', SITES: 'Sitios', LOCATIONS: 'Ubicaciones', INSPECTIONS: 'Inspecciones', BASELINES: 'Líneas base', PROBLEMS: 'Problemas', CHRONIC_HISTORY: 'Historial crónico', VALIDATION: 'Validación', ANALYSIS: 'Análisis', UPLOAD: 'Carga' } as Record<string, string>)[phase] ?? phase; }
  showOutcomes(table: string): void { this.outcomeTable.set(this.outcomeTable() === table ? null : table); }
  downloadReport(): void {
    const id=this.importId();if(!id)return;
    this.api.markdown(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(data)=>{const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=`reporte-importacion-${id}.md`;link.click();URL.revokeObjectURL(url);},error:(error:HttpErrorResponse)=>this.fail('No fue posible descargar el reporte',error)});
  }

  private restoreActive(): void {
    this.api.active().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(job)=>{if(!job||job.status==='COMPLETED'||job.status==='FAILED'){this.reset();return;}this.importId.set(job.id);this.job.set(job);if(job.status==='READY')this.loadAnalysis(job.id);else{this.busy.set(true);this.startPolling(job.id);}},error:()=>this.reset()});
  }
  private loadHomologation(id:string,inspectionId:string|undefined,automatic:boolean):void{this.busy.set(true);this.api.homologation(id,inspectionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(review)=>{this.homologation.set(review);this.selectedInspectionId.set(review.inspectionId);this.automaticSelection.set(automatic&&review.inspectionId===review.automaticInspectionId);this.legalName.set(review.customerName??'');this.selectedCustomerLegalName.set(null);this.siteGroupId.set(null);this.siteId.set(null);this.priorityMappings.set({});this.homologationVisible.set(true);this.busy.set(false);},error:(error:HttpErrorResponse)=>this.fail('No fue posible preparar la homologación',error)});}
  private loadAnalysis(id: string): void { this.api.analysis(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (analysis) => { this.analysis.set(analysis); this.busy.set(false); this.uploadProgress.set(100); this.refreshStatus(id); }, error: (error: HttpErrorResponse) => { if (this.isMissingStaging(error)) this.reset(); else this.fail('No fue posible analizar el archivo', error); } }); }
  private loadResult(id: string, optional = false): void { this.api.result(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (report) => { this.report.set(report); this.busy.set(false); }, error: (error: HttpErrorResponse) => { this.busy.set(false); if (!optional) this.fail('No fue posible recuperar el resultado', error); } }); }
  private startPolling(id: string): void {
    this.stopPolling();
    this.polling = interval(2500).pipe(startWith(0), switchMap(() => this.api.status(id)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => {
      this.job.set(job);
      if (job.status === 'COMPLETED') { this.stopPolling(); this.busy.set(false); this.loadResult(id); void Swal.fire('Importación completada', 'Consulta el resumen y descarga el reporte si lo necesitas.', 'success'); }
      else if (job.status === 'FAILED') { this.stopPolling(); this.busy.set(false); this.loadResult(id, true); void Swal.fire('Importación fallida', job.errorMessage ?? 'Revisa el archivo y vuelve a intentarlo.', 'error'); }
      else if (job.status === 'READY') { this.stopPolling(); this.loadAnalysis(id); }
    } });
  }
  private refreshStatus(id: string): void { this.api.status(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => this.job.set(job) }); }
  private stopPolling(): void { this.polling?.unsubscribe(); this.polling = undefined; }
  private isMissingStaging(error: HttpErrorResponse): boolean { const detail=String(error.error?.detail??error.error?.message??'').toLowerCase();return detail.includes('staging')&&(detail.includes('no encontrado')||detail.includes('perdido')||detail.includes('incompleto')); }
  private issues(severity: LegacyValidationIssue['severity']): LegacyValidationIssue[] { return this.analysis()?.alerts.filter((alert) => alert.severity === severity) ?? []; }
  private fail(title: string, error: HttpErrorResponse): void { this.busy.set(false); void Swal.fire(title, error.error?.detail ?? error.error?.message ?? 'Intenta nuevamente.', 'error'); }
}
