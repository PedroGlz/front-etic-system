import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { LegacyEtlReport, LegacyImportAnalysis, LegacyImportJobStatus, LegacyValidationIssue } from '../../models/legacy-import.model';
import { LegacyImportApi } from '../../services/legacy-import.api';

@Component({ selector: 'app-legacy-import-page', standalone: true, imports: [CommonModule, ButtonModule, ProgressBarModule], providers: [LegacyImportApi], templateUrl: './legacy-import-page.component.html', styleUrl: './legacy-import-page.component.scss' })
export class LegacyImportPageComponent implements OnInit {
  private readonly api = inject(LegacyImportApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageKey = 'etic-legacy-import-id';
  private polling?: Subscription;
  private downloadedReportId?: string;
  readonly file = signal<File | null>(null);
  readonly importId = signal<string | null>(null);
  readonly uploadProgress = signal(0);
  readonly job = signal<LegacyImportJobStatus | null>(null);
  readonly analysis = signal<LegacyImportAnalysis | null>(null);
  readonly report = signal<LegacyEtlReport | null>(null);
  readonly busy = signal(false);
  readonly outcomeTable = signal<string | null>(null);
  readonly errors = computed(() => this.issues('ERROR'));
  readonly warnings = computed(() => this.issues('WARNING'));
  readonly information = computed(() => this.issues('INFO'));
  readonly canExecute = computed(() => !!this.analysis() && this.errors().length === 0 && !this.busy());

  ngOnInit(): void { const id = localStorage.getItem(this.storageKey); if (id) { this.importId.set(id); this.restore(id); } }

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
        if (event.type === HttpEventType.Response && event.body) { const id = event.body.id; this.importId.set(id); localStorage.setItem(this.storageKey, id); this.loadAnalysis(id); }
      },
      error: (error: HttpErrorResponse) => this.fail('No fue posible cargar el archivo', error),
    });
  }

  async execute(): Promise<void> {
    const id = this.importId(); if (!id || !this.canExecute()) return;
    const confirmation = await Swal.fire({ icon: 'warning', title: '¿Iniciar importación histórica?', text: 'El proceso escribirá los datos validados en la base de datos y puede tardar varios minutos.', showCancelButton: true, confirmButtonText: 'Sí, iniciar importación', cancelButtonText: 'Cancelar' });
    if (!confirmation.isConfirmed) return;
    this.busy.set(true); this.report.set(null); this.startPolling(id);
    this.api.execute(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (report) => { this.report.set(report); this.downloadMarkdown(id); this.busy.set(false); this.stopPolling(); this.refreshStatus(id); void Swal.fire('Importación completada', 'Consulta la conciliación final en esta pantalla.', 'success'); },
      error: (error: HttpErrorResponse) => { this.stopPolling(); this.fail('La importación no pudo completarse', error); this.refreshStatus(id); this.loadResult(id, true); },
    });
  }

  reset(): void { this.stopPolling(); localStorage.removeItem(this.storageKey); this.downloadedReportId=undefined; this.file.set(null); this.importId.set(null); this.job.set(null); this.analysis.set(null); this.report.set(null); this.uploadProgress.set(0); this.busy.set(false); }
  formatBytes(bytes: number): string { return bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
  phaseName(phase: string): string {
    return ({ CATALOGS: 'Catálogos', CUSTOMERS: 'Clientes', SITES: 'Sitios', LOCATIONS: 'Ubicaciones',
      INSPECTIONS: 'Inspecciones', BASELINES: 'Líneas base', PROBLEMS: 'Problemas',
      CHRONIC_HISTORY: 'Historial crónico', VALIDATION: 'Validación', ANALYSIS: 'Análisis', UPLOAD: 'Carga' } as Record<string, string>)[phase] ?? phase;
  }
  showOutcomes(table: string): void { this.outcomeTable.set(this.outcomeTable() === table ? null : table); }
  downloadReport(): void {
    const report = this.report(); if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `legacy-import-${report.importId}.json`; link.click(); URL.revokeObjectURL(url);
  }

  private restore(id: string): void {
    this.api.status(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => {
      this.job.set(job);
      if (job.status === 'PROCESSING' || job.status === 'VALIDATING_RESULT') { this.busy.set(true); this.startPolling(id); }
      else if (job.status === 'COMPLETED' || job.status === 'FAILED') this.loadResult(id, job.status === 'FAILED');
      else this.loadAnalysis(id);
    }, error: () => this.reset() });
  }

  private loadAnalysis(id: string): void { this.api.analysis(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (analysis) => { this.analysis.set(analysis); this.busy.set(false); this.uploadProgress.set(100); this.refreshStatus(id); }, error: (error: HttpErrorResponse) => this.fail('No fue posible analizar el archivo', error) }); }
  private loadResult(id: string, optional = false): void { this.api.result(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (report) => { this.report.set(report); this.downloadMarkdown(id); this.busy.set(false); }, error: (error: HttpErrorResponse) => { this.busy.set(false); if (!optional) this.fail('No fue posible recuperar el resultado', error); } }); }
	private downloadMarkdown(id: string): void { if(this.downloadedReportId===id)return;this.api.markdown(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(data)=>{this.downloadedReportId=id;const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=`legacy-import-${id}.md`;link.click();URL.revokeObjectURL(url);}}); }
  private startPolling(id: string): void {
    this.stopPolling();
    this.polling = interval(2500).pipe(startWith(0), switchMap(() => this.api.status(id)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => {
      this.job.set(job);
      if (job.status === 'COMPLETED') { this.stopPolling(); this.loadResult(id); }
      else if (job.status === 'FAILED') { this.stopPolling(); this.busy.set(false); this.loadResult(id, true); void Swal.fire('Importación fallida', job.errorMessage ?? 'Revisa el archivo y vuelve a intentarlo.', 'error'); }
    } });
  }
  private refreshStatus(id: string): void { this.api.status(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => this.job.set(job) }); }
  private stopPolling(): void { this.polling?.unsubscribe(); this.polling = undefined; }
  private issues(severity: LegacyValidationIssue['severity']): LegacyValidationIssue[] { return this.analysis()?.alerts.filter((alert) => alert.severity === severity) ?? []; }
  private fail(title: string, error: HttpErrorResponse): void { this.busy.set(false); void Swal.fire(title, error.error?.detail ?? error.error?.message ?? 'Intenta nuevamente.', 'error'); }
}
