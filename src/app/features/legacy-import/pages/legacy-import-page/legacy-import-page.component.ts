import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import { LegacyEtlReport, LegacyHomologationReview, LegacyImportAnalysis, LegacyImportJobStatus, LegacyValidationIssue } from '../../models/legacy-import.model';
import { LegacyImportApi } from '../../services/legacy-import.api';

interface WarningEntry { stage: string; detail: string; }
type CatalogMode = 'existing' | 'new';

@Component({ selector: 'app-legacy-import-page', standalone: true, imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, ProgressBarModule, ProgressSpinnerModule, SelectButtonModule, SelectModule], providers: [LegacyImportApi], templateUrl: './legacy-import-page.component.html', styleUrl: './legacy-import-page.component.scss' })
export class LegacyImportPageComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
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
  readonly analysisLoading = signal(false);
  readonly analysisLoadingMessage = signal('Preparando archivo...');
  readonly operationNotice = signal<string | null>(null);
  readonly warningHistory = signal<WarningEntry[]>([]);
  readonly outcomeTable = signal<string | null>(null);
  readonly homologation = signal<LegacyHomologationReview | null>(null);
  readonly homologationVisible = signal(false);
  readonly selectedInspectionId = signal<string | null>(null);
  readonly automaticSelection = signal(true);
  readonly legalName = signal('');
  readonly selectedCustomerId = signal<string | null>(null);
  readonly siteGroupId = signal<string | null>(null);
  readonly siteGroupName = signal('');
  readonly siteGroupMode = signal<CatalogMode>('existing');
  readonly siteId = signal<string | null>(null);
  readonly siteName = signal('');
  readonly siteMode = signal<CatalogMode>('existing');
  readonly catalogModes = [{label:'Seleccionar uno existente',value:'existing' as const},{label:'Crear uno nuevo',value:'new' as const}];
  readonly priorityMappings = signal<Record<string, string>>({});
  readonly forceGlobalPriorityUpdate = signal(false);
  readonly confirmRelationshipChanges = signal(false);
  readonly errors = computed(() => this.issues('ERROR'));
  readonly warnings = computed(() => this.issues('WARNING'));
  readonly information = computed(() => this.issues('INFO'));
  readonly canExecute = computed(() => !!this.analysis() && this.errors().length === 0 && !this.busy());
  readonly groupOptions = computed(() => this.homologation()?.siteGroups ?? []);
  readonly siteOptions = computed(() => this.homologation()?.sites ?? []);
  readonly inspectionOptions = computed(() => this.homologation()?.inspections.map((item) => ({...item,label: `Inspección #${item.inspectionNumber ?? 'sin número'} · ${item.inspectionDate || 'Sin fecha'} · ${item.customerName || 'Sin cliente'}`})) ?? []);
  readonly relationshipWarnings = computed(() => {
    const review=this.homologation(),customerId=this.selectedCustomerId(),groupId=this.effectiveGroupId(),siteId=this.effectiveSiteId();
    if(!review||!customerId)return [];
    const warnings:string[]=[];
    const group=groupId?review.siteGroups.find((item)=>item.id===groupId):null;
    const site=siteId?review.sites.find((item)=>item.id===siteId):null;
    const customer=review.customers.find((item)=>item.id===customerId);
    if(this.siteGroupMode()==='new')warnings.push(`Se creará el grupo de sitios ${this.siteGroupName().trim()||'sin nombre'} para ${this.named(customer?.label,customerId)}.`);
    if(group&&group.parentId?.toLowerCase()!==customerId.toLowerCase()){const current=review.customers.find((item)=>item.id===group.parentId);warnings.push(`El grupo ${this.named(group.label,group.id)} cambiará de ${this.named(current?.label,group.parentId)} a ${this.named(customer?.label,customerId)}.`);}
    if(this.siteMode()==='new')warnings.push(`El sitio ${this.siteName().trim()||review.siteName} se guardará durante la transformación y quedará relacionado con ${this.siteGroupMode()==='new'?this.siteGroupName().trim():this.named(group?.label,groupId)}.`);
    if(site&&(site.clientId?.toLowerCase()!==customerId.toLowerCase()||site.parentId?.toLowerCase()!==(groupId??'').toLowerCase())){const currentGroup=review.siteGroups.find((item)=>item.id===site.parentId);warnings.push(`El sitio ${this.named(site.label,site.id)} cambiará del grupo ${this.named(currentGroup?.label,site.parentId)} al grupo ${this.siteGroupMode()==='new'?this.siteGroupName().trim():this.named(group?.label,groupId)}.`);}
    if(siteId&&siteId.toLowerCase()!==review.siteId.toLowerCase())warnings.push(`La inspección #${review.inspectionNumber??'sin número'} se asignará al sitio ${this.named(site?.label,siteId)}. Las ubicaciones compartidas conservarán relaciones consistentes.`);
    return warnings;
  });
  readonly canConfirmHomologation = computed(() => {
    const review = this.homologation();
    if (!review || !this.selectedCustomerId() || !this.legalName().trim() || (this.siteGroupMode()==='existing'?!this.siteGroupId():!this.siteGroupName().trim()) || (this.siteMode()==='existing'?!this.siteId():!this.siteName().trim()) || this.busy()) return false;
    if (review.priorityBlockers.length && !this.forceGlobalPriorityUpdate()) return false;
    if (this.relationshipWarnings().length && !this.confirmRelationshipChanges()) return false;
    return review.inactivePriorities.every((priority) => !!this.priorityMappings()[priority.sourceId]);
  });
  readonly homologationIncompleteMessage=computed(()=>{if(!this.selectedCustomerId())return 'Selecciona el cliente que se utilizará.';if(this.siteGroupMode()==='existing'&&!this.siteGroupId())return 'Selecciona un grupo de sitios existente.';if(this.siteGroupMode()==='new'&&!this.siteGroupName().trim())return 'Escribe el nombre del nuevo grupo de sitios.';if(this.siteMode()==='existing'&&!this.siteId())return 'Selecciona un sitio existente.';if(this.siteMode()==='new'&&!this.siteName().trim())return 'Escribe el nombre del nuevo sitio.';return null;});

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
    this.busy.set(true); this.analysisLoading.set(true); this.analysisLoadingMessage.set('Subiendo archivo SQL...'); this.uploadProgress.set(0);
    this.api.upload(selected).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) this.uploadProgress.set(Math.round(event.loaded * 100 / event.total));
        if (event.type === HttpEventType.Response && event.body) { const id = event.body.id; this.importId.set(id); this.analysisLoadingMessage.set('Analizando respaldo histórico...'); this.loadAnalysis(id); }
      },
      error: (error: HttpErrorResponse) => this.fail('No fue posible cargar el archivo', error),
    });
  }

  async execute(): Promise<void> {
    const id = this.importId(); if (!id || !this.canExecute()) return;
    this.analysisLoading.set(true);this.analysisLoadingMessage.set('Iniciando importación. Por favor, espera...');
    this.loadHomologation(id, undefined, true);
  }

  async confirmHomologation(): Promise<void> {
    const id = this.importId(); const review = this.homologation();
    if (!id || !review || !this.canConfirmHomologation()) return;
    const group = this.siteGroupMode()==='existing' ? review.siteGroups.find((item) => item.id === this.siteGroupId())?.label : this.siteGroupName().trim();
    const site = this.siteMode()==='existing' ? review.sites.find((item) => item.id === this.siteId())?.label : this.siteName().trim();
    const customer=review.customers.find((item)=>item.id===this.selectedCustomerId())?.label??this.legalName();
    const priorities = review.inactivePriorities.map((priority) => {
      const targetId = this.priorityMappings()[priority.sourceId];
      const target = review.priorities.find((item) => item.id === targetId)?.label ?? targetId;
      return `${priority.sourceLabel} → ${target}`;
    });
    const affected = review.priorityImpacts.flatMap((impact) => [...impact.jobInspectionNames, ...impact.externalInspectionNames]);
    const confirmationWarnings=[...this.relationshipWarnings(),...review.priorityImpacts.map((impact)=>this.priorityImpactText(impact,review))];
    this.addWarnings('Confirmación de transformación',confirmationWarnings);
    const confirmation = await Swal.fire({
      icon: this.forceGlobalPriorityUpdate() ? 'warning' : 'question',
      title: '¿Confirmar y transformar?',
      html: `<div class="legacy-confirmation"><p><strong>Inspección:</strong> #${this.escapeHtml(String(review.inspectionNumber ?? 'Sin número'))}</p><p><strong>Cliente:</strong> ${this.escapeHtml(customer)} · Existente</p><p><strong>Grupo de sitios:</strong> ${this.escapeHtml(group ?? '')} · ${this.siteGroupMode()==='existing'?'Existente':'Nuevo'}</p><p><strong>Sitio:</strong> ${this.escapeHtml(site ?? '')} · ${this.siteMode()==='existing'?'Existente':'Nuevo'}</p><p><strong>Prioridades:</strong> ${this.escapeHtml(priorities.join(', ') || 'Sin sustituciones')}</p><p><strong>Impacto:</strong> ${affected.length?`${new Set(affected).size} inspección(es) relacionada(s)`:'solo la inspección seleccionada'}.</p>${confirmationWarnings.length?'<p><strong>Hay consecuencias que requieren revisión. Descarga el reporte para consultar el detalle completo.</strong></p>':''}<button type="button" id="download-warning-report" class="swal2-styled">Descargar reporte</button></div>`,
      showCancelButton: true,
      confirmButtonText: 'Confirmar y transformar',
      cancelButtonText: 'Cancelar',
      didOpen: () => document.getElementById('download-warning-report')?.addEventListener('click', () => this.downloadWarnings('Confirmación de transformación')),
    });
    if (!confirmation.isConfirmed) return;
    this.busy.set(true); this.report.set(null);this.analysisLoading.set(true);this.analysisLoadingMessage.set('Preparando la transformación de la inspección...');
    this.api.execute(id, { inspectionId: review.inspectionId, customerId: this.selectedCustomerId()!, legalName: this.legalName().trim(), siteGroupId: this.effectiveGroupId(), siteGroupName: this.siteGroupMode()==='new' ? this.siteGroupName().trim() : null, siteId: this.effectiveSiteId(), siteName: this.siteMode()==='new' ? this.siteName().trim() : null, automaticSelection: this.automaticSelection(), priorityMappings: this.priorityMappings(), forceGlobalPriorityUpdate: this.forceGlobalPriorityUpdate(), confirmRelationshipChanges: this.confirmRelationshipChanges() }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.homologationVisible.set(false);this.operationNotice.set('Transformación iniciada. Estamos procesando la información de la inspección.');this.analysisLoading.set(false);this.startPolling(id); },
      error: (error: HttpErrorResponse) => { this.stopPolling(); this.fail('La importación no pudo iniciarse', error); this.refreshStatus(id); },
    });
  }

  selectCustomer(value: string | null): void { this.selectedCustomerId.set(value);const customer=this.homologation()?.customers.find((item)=>item.id===value);if(customer)this.legalName.set(customer.label);this.confirmRelationshipChanges.set(false); }
  changeGroup(value: string | null): void { this.siteGroupId.set(value);this.confirmRelationshipChanges.set(false); }
  changeGroupName(value: string): void { this.siteGroupName.set(value);this.confirmRelationshipChanges.set(false); }
  changeSite(value: string | null): void { this.siteId.set(value);this.confirmRelationshipChanges.set(false); }
  changeSiteName(value: string): void { this.siteName.set(value);this.confirmRelationshipChanges.set(false); }
  changeGroupMode(mode:CatalogMode):void{this.siteGroupMode.set(mode);this.confirmRelationshipChanges.set(false);}
  changeSiteMode(mode:CatalogMode):void{this.siteMode.set(mode);this.confirmRelationshipChanges.set(false);}
  setPriority(sourceId: string, targetId: string | null): void { const values={...this.priorityMappings()};if(targetId)values[sourceId]=targetId;else delete values[sourceId];this.priorityMappings.set(values); }
  changeInspection(inspectionId: string): void { const id=this.importId();if(!id||!inspectionId||inspectionId===this.homologation()?.inspectionId)return;this.loadHomologation(id,inspectionId,false); }

  reset(): void { this.stopPolling(); this.file.set(null); if (this.fileInput) this.fileInput.nativeElement.value = ''; this.importId.set(null); this.job.set(null); this.analysis.set(null); this.report.set(null); this.outcomeTable.set(null); this.homologation.set(null); this.homologationVisible.set(false); this.selectedInspectionId.set(null); this.automaticSelection.set(true); this.uploadProgress.set(0); this.analysisLoading.set(false);this.operationNotice.set(null);this.warningHistory.set([]); this.busy.set(false); }
  formatBytes(bytes: number): string { return bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
  phaseName(phase: string): string { return ({ CATALOGS: 'Catálogos', CUSTOMERS: 'Clientes', SITES: 'Sitios', LOCATIONS: 'Ubicaciones', INSPECTIONS: 'Inspecciones', BASELINES: 'Líneas base', PROBLEMS: 'Problemas', CHRONIC_HISTORY: 'Historial crónico', VALIDATION: 'Validación', ANALYSIS: 'Análisis', UPLOAD: 'Carga' } as Record<string, string>)[phase] ?? phase; }
  statusName(status:LegacyImportJobStatus['status']):string{return ({UPLOADED:'Archivo recibido',VALIDATING:'Analizando archivo',READY:'Listo para importar',PROCESSING:'Importación en proceso',VALIDATING_RESULT:'Comprobando resultados',COMPLETED:'Importación finalizada',FAILED:'Error en la importación'} as Record<LegacyImportJobStatus['status'],string>)[status];}
  sectionName(table:string):string{return ({clientes:'Clientes',sitios:'Sitios',sitio_contactos:'Contactos de sitios',equipos:'Equipos',ubicaciones:'Ubicaciones',inspecciones:'Inspecciones',inspecciones_det:'Detalles de inspecciones',linea_base:'Líneas base',problemas:'Problemas',historial_problemas:'Historial de problemas'} as Record<string,string>)[table]??'Información histórica';}
  visibleIssue(issue:LegacyValidationIssue):string{if(issue.code==='DUPLICATE_ID')return 'Se encontró un registro duplicado en el respaldo.';if(issue.code==='MISSING_REFERENCE')return 'Un registro hace referencia a información que no existe en el respaldo.';return issue.message.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi,'un registro relacionado');}
  showOutcomes(table: string): void { this.outcomeTable.set(this.outcomeTable() === table ? null : table); }
  downloadReport(): void {
    const id=this.importId();if(!id)return;
    this.api.markdown(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(data)=>{const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=`reporte-importacion-${id}.md`;link.click();URL.revokeObjectURL(url);},error:(error:HttpErrorResponse)=>this.fail('No fue posible descargar el reporte',error)});
  }
  downloadWarnings(stage='Reporte acumulado'):void{
    const review=this.homologation();const site=this.effectiveSiteId()?review?.sites.find((item)=>item.id===this.effectiveSiteId()):null;
    const live=review?[...this.relationshipWarnings(),...review.priorityImpacts.map((impact)=>this.priorityImpactText(impact,review))].map((detail)=>({stage:'Homologación',detail})):[];
    const entries=[...this.warningHistory()];const keys=new Set(entries.map((entry)=>`${entry.stage}\u0000${entry.detail}`));live.forEach((entry)=>{if(!keys.has(`${entry.stage}\u0000${entry.detail}`))entries.push(entry);});if(!entries.length)return;
    const lines=['REPORTE DE ADVERTENCIAS - IMPORTACIÓN HISTÓRICA',`Fecha: ${new Date().toLocaleString('es-MX')}`,`Etapa: ${stage}`,`Proceso: ${this.importId()??'Aún no asignado'}`,`Inspección: ${review?`#${review.inspectionNumber??'sin número'} (${review.inspectionId})`:'No seleccionada'}`,`Sitio: ${review?this.named(site?.label??(this.siteMode()==='new'?this.siteName():review.siteName),this.effectiveSiteId()??review.siteId):'No seleccionado'}`,`Resumen: ${entries.length} advertencia(s) registrada(s)`,''];
    entries.forEach((entry,index)=>lines.push(`${index+1}. [${entry.stage}] ${entry.detail}`));
    const data=new Blob([lines.join('\r\n')],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=`advertencias-importacion-${this.importId()??'sin-id'}.txt`;link.click();URL.revokeObjectURL(url);
  }

  private restoreActive(): void {
    this.api.active().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(job)=>{if(!job||job.status==='COMPLETED'||job.status==='FAILED'){this.reset();return;}this.importId.set(job.id);this.job.set(job);if(job.status==='READY')this.loadAnalysis(job.id);else{this.busy.set(true);this.startPolling(job.id);}},error:()=>this.reset()});
  }
  private loadHomologation(id:string,inspectionId:string|undefined,automatic:boolean):void{this.busy.set(true);this.api.homologation(id,inspectionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(review)=>{this.homologation.set(review);this.selectedInspectionId.set(review.inspectionId);this.automaticSelection.set(automatic&&review.inspectionId===review.automaticInspectionId);const customer=review.customers.find((item)=>item.id.toLowerCase()===review.customerId.toLowerCase());this.selectedCustomerId.set(customer?.id??null);this.legalName.set(customer?.label??review.customerName??'');const currentSite=review.sites.find((item)=>item.id.toLowerCase()===review.siteId.toLowerCase());this.siteId.set(currentSite?.id??null);this.siteMode.set(currentSite?'existing':'new');this.siteName.set(currentSite?'':review.siteName??'');const currentGroup=currentSite?review.siteGroups.find((item)=>item.id===currentSite.parentId):null;this.siteGroupId.set(currentGroup?.id??null);this.siteGroupMode.set('existing');this.siteGroupName.set('');const defaults=review.priorities.filter((item)=>item.defaultValue);const mappings:Record<string,string>={};if(defaults.length===1)review.inactivePriorities.forEach((priority)=>mappings[priority.sourceId]=defaults[0].id);this.priorityMappings.set(mappings);this.forceGlobalPriorityUpdate.set(false);this.confirmRelationshipChanges.set(false);this.addWarnings('Homologación',review.priorityImpacts.map((impact)=>this.priorityImpactText(impact,review)));this.homologationVisible.set(true);this.analysisLoading.set(false);this.busy.set(false);},error:(error:HttpErrorResponse)=>this.fail('No fue posible preparar la homologación',error)});}
  private loadAnalysis(id: string): void { this.api.analysis(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (analysis) => { this.analysis.set(analysis);this.addWarnings('Análisis y validación',analysis.alerts.filter((alert)=>alert.severity==='WARNING').map((alert)=>`${alert.dataset||'Archivo'}${alert.recordId?` · ${alert.recordId}`:''}: ${alert.message}`)); this.busy.set(false); this.analysisLoading.set(false); this.uploadProgress.set(100); this.refreshStatus(id); }, error: (error: HttpErrorResponse) => { this.analysisLoading.set(false); if (this.isMissingStaging(error)) this.reset(); else this.fail('No fue posible analizar el archivo', error); } }); }
  private loadResult(id: string, optional = false): void { this.api.result(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (report) => { this.report.set(report);this.addWarnings('Resultado de la importación',report.warnings??[]); this.busy.set(false); }, error: (error: HttpErrorResponse) => { this.busy.set(false); if (!optional) this.fail('No fue posible recuperar el resultado', error); } }); }
  private startPolling(id: string): void {
    this.stopPolling();
    this.polling = interval(2500).pipe(startWith(0), switchMap(() => this.api.status(id)), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => {
      this.job.set(job);
      if (job.status === 'COMPLETED') { this.stopPolling(); this.busy.set(false);this.operationNotice.set(null); this.loadResult(id); void Swal.fire('Importación completada', 'Consulta el resumen y descarga el reporte si lo necesitas.', 'success'); }
      else if (job.status === 'FAILED') { this.stopPolling(); this.busy.set(false);this.operationNotice.set(null); this.loadResult(id, true); void Swal.fire('Importación fallida', this.visibleError(job.errorMessage), 'error'); }
      else if (job.status === 'READY') { this.stopPolling(); this.loadAnalysis(id); }
    } });
  }
  private refreshStatus(id: string): void { this.api.status(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => this.job.set(job) }); }
  private stopPolling(): void { this.polling?.unsubscribe(); this.polling = undefined; }
  private isMissingStaging(error: HttpErrorResponse): boolean { const detail=String(error.error?.detail??error.error?.message??'').toLowerCase();return detail.includes('staging')&&(detail.includes('no encontrado')||detail.includes('perdido')||detail.includes('incompleto')); }
  private issues(severity: LegacyValidationIssue['severity']): LegacyValidationIssue[] { return this.analysis()?.alerts.filter((alert) => alert.severity === severity) ?? []; }
  private addWarnings(stage:string,details:string[]):void{if(!details.length)return;const current=this.warningHistory(),keys=new Set(current.map((entry)=>`${entry.stage}\u0000${entry.detail}`));const additions=details.filter(Boolean).filter((detail)=>!keys.has(`${stage}\u0000${detail}`)).map((detail)=>({stage,detail}));if(additions.length)this.warningHistory.set([...current,...additions]);}
  private priorityImpactText(impact:LegacyHomologationReview['priorityImpacts'][number],review:LegacyHomologationReview):string{const targetId=this.priorityMappings()[impact.sourcePriorityId],target=review.priorities.find((item)=>item.id===targetId);const related=[...impact.jobInspectionNames,...impact.externalInspectionNames];return `Ubicación ${this.traceName(impact.locationName,impact.locationId)}: prioridad ${this.traceName(impact.sourcePriorityName,impact.sourcePriorityId)}${targetId?` → ${this.traceName(target?.label,targetId)}`:''}. Inspecciones relacionadas: ${related.join('; ')||'ninguna'}.`;}
  private effectiveGroupId():string|null{return this.siteGroupMode()==='existing'?this.siteGroupId():null;}
  private effectiveSiteId():string|null{return this.siteMode()==='existing'?this.siteId():null;}
  private named(name:string|null|undefined,id:string|null|undefined):string{return name??(id?'Registro sin nombre':'Sin identificar');}
  private traceName(name:string|null|undefined,id:string|null|undefined):string{return name?`${name}${id?` (${id})`:''}`:(id??'sin identificar');}
  visibleError(message:string|null|undefined):string{const value=message??'';if(/mysql|actualización derivada|tabla|id_/i.test(value))return 'No fue posible guardar correctamente los cambios de la inspección. Consulta el reporte para conocer el detalle.';return value||'No fue posible completar la operación.';}
  private fail(title: string, error: HttpErrorResponse): void { this.busy.set(false); this.analysisLoading.set(false); const technical=error.error?.detail ?? error.error?.message;void Swal.fire(title, this.visibleError(technical), 'error'); }
  private escapeHtml(value: string): string { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character); }
}
