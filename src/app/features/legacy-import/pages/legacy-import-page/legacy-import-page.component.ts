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
import { Subject, Subscription, interval, startWith, switchMap, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { LegacyEtlReport, LegacyHomologationReview, LegacyImportAnalysis, LegacyImportError, LegacyImportJobStatus, LegacyValidationIssue } from '../../models/legacy-import.model';
import { LegacyImportApi } from '../../services/legacy-import.api';

interface WarningEntry { stage: string; detail: string; }
type CatalogMode = 'existing' | 'new';

@Component({ selector: 'app-legacy-import-page', standalone: true, imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, ProgressBarModule, ProgressSpinnerModule, SelectButtonModule, SelectModule], providers: [LegacyImportApi], templateUrl: './legacy-import-page.component.html', styleUrl: './legacy-import-page.component.scss' })
export class LegacyImportPageComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
  private readonly api = inject(LegacyImportApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resetRequests$ = new Subject<void>();
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
  readonly existingInspectionsConfirmed = signal(false);
  readonly executionStarting = signal(false);
  readonly transformationAccepted = signal(false);
  readonly errorDiagnostic = signal<LegacyImportError | null>(null);
  readonly warningHistory = signal<WarningEntry[]>([]);
  readonly outcomeTable = signal<string | null>(null);
  readonly reconciliationDetailVisible = signal(false);
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
  readonly progressStages=[{phase:'VALIDATION',label:'Preparación y validación'},{phase:'CATALOGS',label:'Catálogos'},{phase:'CUSTOMERS',label:'Clientes'},{phase:'SITES',label:'Grupos y sitios'},{phase:'LOCATIONS',label:'Ubicaciones'},{phase:'INSPECTIONS',label:'Inspecciones y detalles'},{phase:'BASELINES',label:'Línea base'},{phase:'PROBLEMS',label:'Problemas'},{phase:'CHRONIC_HISTORY',label:'Historial de problemas'},{phase:'VALIDATING_RESULT',label:'Finalización y conciliación'}];
  readonly priorityMappings = signal<Record<string, string>>({});
  readonly forceGlobalPriorityUpdate = signal(false);
  readonly confirmRelationshipChanges = signal(false);
  readonly errors = computed(() => this.issues('ERROR'));
  readonly warnings = computed(() => this.issues('WARNING'));
  readonly information = computed(() => this.issues('INFO'));
  readonly visibleAnalysis = computed(() => this.transformationAccepted() ? null : this.analysis());
  readonly visibleJob = computed(() => this.executionStarting() && this.homologationVisible() ? null : this.job());
  readonly hasExistingInspections = computed(() => this.analysis()?.inspectionPresence?.some((item)=>item.existing) ?? false);
  readonly canExecute = computed(() => !!this.analysis() && this.errors().length === 0 && !this.busy() && (!this.hasExistingInspections() || this.existingInspectionsConfirmed()));
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
    this.api.upload(selected).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({
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
    const request={ inspectionId: review.inspectionId, customerId: this.selectedCustomerId()!, legalName: this.legalName().trim(), siteGroupId: this.effectiveGroupId(), siteGroupName: this.siteGroupMode()==='new' ? this.siteGroupName().trim() : null, siteId: this.effectiveSiteId(), siteName: this.siteMode()==='new' ? this.siteName().trim() : null, automaticSelection: this.automaticSelection(), confirmExistingInspections: this.existingInspectionsConfirmed(), priorityMappings: this.priorityMappings(), forceGlobalPriorityUpdate: this.forceGlobalPriorityUpdate(), confirmRelationshipChanges: this.confirmRelationshipChanges() };
    this.busy.set(true);this.report.set(null);this.homologationVisible.set(false);this.executionStarting.set(true);this.operationNotice.set('Iniciando transformación...');
    requestAnimationFrame(()=>{if(this.importId()!==id)return;this.api.execute(id,request).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.transformationAccepted.set(true);this.operationNotice.set('Transformación iniciada. Estamos procesando la información de la inspección.');this.startPolling(id); },
      error: (error: HttpErrorResponse) => { this.stopPolling();this.homologationVisible.set(true);this.fail('La importación no pudo iniciarse', error);this.refreshStatus(id); },
    });});
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

  reset(): void { this.stopPolling();this.resetRequests$.next();Swal.close(); this.file.set(null); if (this.fileInput) this.fileInput.nativeElement.value = ''; this.importId.set(null); this.job.set(null); this.analysis.set(null); this.report.set(null); this.outcomeTable.set(null);this.reconciliationDetailVisible.set(false); this.homologation.set(null); this.homologationVisible.set(false); this.selectedInspectionId.set(null);this.selectedCustomerId.set(null);this.legalName.set('');this.siteGroupId.set(null);this.siteGroupName.set('');this.siteGroupMode.set('existing');this.siteId.set(null);this.siteName.set('');this.siteMode.set('existing');this.priorityMappings.set({});this.forceGlobalPriorityUpdate.set(false);this.confirmRelationshipChanges.set(false); this.automaticSelection.set(true); this.existingInspectionsConfirmed.set(false);this.executionStarting.set(false);this.transformationAccepted.set(false);this.errorDiagnostic.set(null);this.uploadProgress.set(0); this.analysisLoading.set(false);this.operationNotice.set(null);this.warningHistory.set([]); this.busy.set(false); }
  formatBytes(bytes: number): string { return bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
  phaseName(phase: string): string { return ({ CATALOGS: 'Catálogos', CUSTOMERS: 'Clientes', SITES: 'Grupos y sitios', LOCATIONS: 'Ubicaciones', INSPECTIONS: 'Inspecciones y detalles', BASELINES: 'Línea base', PROBLEMS: 'Problemas', CHRONIC_HISTORY: 'Historial de problemas', VALIDATING_RESULT: 'Finalización y conciliación', VALIDATION: 'Preparación y validación', ANALYSIS: 'Análisis', UPLOAD: 'Carga', STRUCTURE: 'Análisis estructural', HOMOLOGATION: 'Preparación de la homologación', INICIO: 'Inicio de la transformación', RECOVERY: 'Recuperación', CONCILIATION: 'Conciliación', REPORT: 'Generación del reporte' } as Record<string, string>)[phase] ?? phase; }
  statusName(status:LegacyImportJobStatus['status']):string{return ({UPLOADED:'Archivo recibido',VALIDATING:'Analizando archivo',READY:'Listo para importar',PROCESSING:'Importación en proceso',VALIDATING_RESULT:'Comprobando resultados',COMPLETED:'Importación finalizada',FAILED:'Error en la importación'} as Record<LegacyImportJobStatus['status'],string>)[status];}
  sectionName(table:string):string{return ({clientes:'Clientes',sitios:'Sitios',sitio_contactos:'Contactos de sitios',equipos:'Equipos',ubicaciones:'Ubicaciones',inspecciones:'Inspecciones',inspecciones_det:'Detalles de inspecciones',linea_base:'Líneas base',problemas:'Problemas',historial_problemas:'Historial de problemas'} as Record<string,string>)[table]??'Información histórica';}
  visibleIssue(issue:LegacyValidationIssue):string{if(issue.code==='DUPLICATE_ID')return 'Se encontró un registro duplicado en el respaldo.';if(issue.code==='MISSING_REFERENCE')return 'Un registro hace referencia a información que no existe en el respaldo.';return issue.message.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi,'un registro relacionado');}
  showOutcomes(table: string): void { this.outcomeTable.set(table);this.reconciliationDetailVisible.set(true); }
  downloadReport(): void {
    const id=this.importId();if(!id)return;
    this.api.markdown(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(data)=>{const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=`reporte-importacion-${id}.md`;link.click();URL.revokeObjectURL(url);},error:(error:HttpErrorResponse)=>this.fail('No fue posible descargar el reporte',error)});
  }
  downloadWarnings(stage='Reporte acumulado'):void{
    const review=this.homologation();const site=this.effectiveSiteId()?review?.sites.find((item)=>item.id===this.effectiveSiteId()):null;
    const live=review?[...this.relationshipWarnings(),...review.priorityImpacts.map((impact)=>this.priorityImpactText(impact,review))].map((detail)=>({stage:'Homologación',detail})):[];
    const entries=[...this.warningHistory()];const keys=new Set(entries.map((entry)=>`${entry.stage}\u0000${entry.detail}`));live.forEach((entry)=>{if(!keys.has(`${entry.stage}\u0000${entry.detail}`))entries.push(entry);});if(!entries.length)return;
    const lines=['REPORTE DE ADVERTENCIAS - IMPORTACIÓN HISTÓRICA',`Fecha: ${new Date().toLocaleString('es-MX')}`,`Etapa: ${stage}`,`Proceso: ${this.importId()??'Aún no asignado'}`,`Inspección: ${review?`#${review.inspectionNumber??'sin número'} (${review.inspectionId})`:'No seleccionada'}`,`Sitio: ${review?this.named(site?.label??(this.siteMode()==='new'?this.siteName():review.siteName),this.effectiveSiteId()??review.siteId):'No seleccionado'}`,`Resumen: ${entries.length} advertencia(s) registrada(s)`,''];
    entries.forEach((entry,index)=>lines.push(`${index+1}. [${entry.stage}] ${entry.detail}`));
    const data=new Blob([lines.join('\r\n')],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=`advertencias-importacion-${this.importId()??'sin-id'}.txt`;link.click();URL.revokeObjectURL(url);
  }

  async showExistingInspectionWarning():Promise<void>{const analysis=this.analysis();if(!analysis)return;const existing=analysis.inspectionPresence.filter((item)=>item.existing),newCount=analysis.inspectionPresence.length-existing.length;if(!existing.length){this.existingInspectionsConfirmed.set(true);return;}const summary=existing.slice(0,5).map((item)=>`<li>Inspección #${this.escapeHtml(String(item.inspectionNumber??'sin número'))} · ${this.escapeHtml(item.customerName??'Sin cliente')} · ${this.escapeHtml(item.siteName??'Sin sitio')}</li>`).join('');const result=await Swal.fire({icon:'warning',title:existing.length===1?'Esta inspección ya está registrada en ETIC Online.':`${existing.length} inspecciones ya están registradas en ETIC Online.`,html:`<div class="legacy-confirmation"><p>Si continúas, el sistema revisará la información histórica y aplicará las reglas actuales para determinar qué registros necesitan actualizarse y cuáles se conservarán.</p><p><strong>Existentes:</strong> ${existing.length} · <strong>Nuevas:</strong> ${newCount}</p><ul>${summary}</ul>${existing.length>5?'<p>Descarga el detalle para consultar todas las inspecciones.</p>':''}<button type="button" id="download-existing-report" class="swal2-styled">Descargar detalle TXT</button></div>`,showCancelButton:true,confirmButtonText:'Continuar con la importación',cancelButtonText:'Cancelar',didOpen:()=>document.getElementById('download-existing-report')?.addEventListener('click',()=>this.downloadExistingInspections())});this.existingInspectionsConfirmed.set(result.isConfirmed);if(result.isConfirmed)this.addWarnings('Inspecciones ya registradas',existing.map((item)=>`Inspección #${item.inspectionNumber??'sin número'} · ${item.customerName??'Sin cliente'} · ${item.siteName??'Sin sitio'}`));}
  private downloadExistingInspections():void{const analysis=this.analysis();if(!analysis)return;const existing=analysis.inspectionPresence.filter((item)=>item.existing),newCount=analysis.inspectionPresence.length-existing.length;const lines=['REPORTE DE INSPECCIONES YA REGISTRADAS',`Fecha: ${new Date().toLocaleString('es-MX')}`,`Archivo: ${this.file()?.name??'No disponible'}`,`Existentes: ${existing.length}`,`Nuevas: ${newCount}`,'',...existing.map((item,index)=>`${index+1}. Inspección #${item.inspectionNumber??'sin número'} · ${item.customerName??'Sin cliente'} · ${item.siteName??'Sin sitio'}`)];this.saveBlob(new Blob([lines.join('\r\n')],{type:'text/plain;charset=utf-8'}),`inspecciones-existentes-${this.importId()??'sin-id'}.txt`);}

  stageState(phase:string):'Pendiente'|'En proceso'|'Completado'|'Error'{const job=this.job();if(!job)return 'Pendiente';if(job.status==='COMPLETED')return 'Completado';const current=this.progressStageIndex(job),target=this.progressStages.findIndex((item)=>item.phase===phase);if(job.status==='FAILED'&&target===current)return 'Error';if(target<current)return 'Completado';if(target===current)return 'En proceso';return 'Pendiente';}
  private progressStageIndex(job:LegacyImportJobStatus):number{if(job.status==='VALIDATING_RESULT')return this.progressStages.length-1;const index=this.progressStages.findIndex((item)=>item.phase===job.phase);return index<0?0:index;}

  downloadError():void{
    const id=this.errorDiagnostic()?.processId;
    if(id&&id!=='No asignado')this.api.errorReport(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(data)=>this.saveBlob(data,`error-importacion-${id}.txt`),error:(error:HttpErrorResponse)=>this.showLocalError('Descarga del reporte',error)});
    else {const error=this.errorDiagnostic();if(!error)return;const lines=[`REPORTE DE ERROR - IMPORTACIÓN HISTÓRICA ETIC`,`Fecha y hora: ${error.occurredAt??new Date().toLocaleString('es-MX')}`,`Archivo de origen: ${error.filename??this.file()?.name??'No disponible'}`,`Número de inspección: ${error.inspectionNumber??'No disponible'}`,`Etapa: ${error.stage}`,`Proceso: ${error.processId}`,`Estado: ${error.status}`,`Mensaje: ${error.message}`,`Causa principal: ${error.rootCause??'No disponible'}`,`Tipo de excepción: ${error.exceptionType??'No disponible'}`,'','Causas encadenadas:',...(error.causes??[]),'','Detalle técnico:',error.technicalDetail??'No disponible'];this.saveBlob(new Blob([lines.join('\r\n')],{type:'text/plain;charset=utf-8'}),'error-importacion-sin-id.txt');}
  }

  private restoreActive(): void {
    this.api.active().pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(job)=>{if(!job||(job.status!=='PROCESSING'&&job.status!=='VALIDATING_RESULT')){this.reset();return;}this.importId.set(job.id);this.job.set(job);this.transformationAccepted.set(true);this.busy.set(true);this.startPolling(job.id);},error:()=>this.reset()});
  }
  private loadHomologation(id:string,inspectionId:string|undefined,automatic:boolean):void{this.busy.set(true);this.api.homologation(id,inspectionId).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(review)=>{this.homologation.set(review);this.selectedInspectionId.set(review.inspectionId);this.automaticSelection.set(automatic&&review.inspectionId===review.automaticInspectionId);const customer=review.customers.find((item)=>item.id.toLowerCase()===review.customerId.toLowerCase());this.selectedCustomerId.set(customer?.id??null);this.legalName.set(customer?.label??review.customerName??'');const currentSite=review.sites.find((item)=>item.id.toLowerCase()===review.siteId.toLowerCase());this.siteId.set(currentSite?.id??null);this.siteMode.set(currentSite?'existing':'new');this.siteName.set(currentSite?'':review.siteName??'');const currentGroup=currentSite?review.siteGroups.find((item)=>item.id===currentSite.parentId):null;this.siteGroupId.set(currentGroup?.id??null);this.siteGroupMode.set('existing');this.siteGroupName.set('');const defaults=review.priorities.filter((item)=>item.defaultValue);const mappings:Record<string,string>={};if(defaults.length===1)review.inactivePriorities.forEach((priority)=>mappings[priority.sourceId]=defaults[0].id);this.priorityMappings.set(mappings);this.forceGlobalPriorityUpdate.set(false);this.confirmRelationshipChanges.set(false);this.addWarnings('Homologación',review.priorityImpacts.map((impact)=>this.priorityImpactText(impact,review)));this.homologationVisible.set(true);this.analysisLoading.set(false);this.busy.set(false);},error:(error:HttpErrorResponse)=>this.fail('No fue posible preparar la homologación',error)});}
  private loadAnalysis(id: string): void { this.api.analysis(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({ next: (analysis) => { this.analysis.set(analysis);this.existingInspectionsConfirmed.set(!analysis.inspectionPresence?.some((item)=>item.existing));this.addWarnings('Análisis y validación',analysis.alerts.filter((alert)=>alert.severity==='WARNING').map((alert)=>`${alert.dataset||'Archivo'}${alert.recordId?` · ${alert.recordId}`:''}: ${alert.message}`)); this.busy.set(false); this.analysisLoading.set(false); this.uploadProgress.set(100); this.refreshStatus(id);if(!this.existingInspectionsConfirmed())void this.showExistingInspectionWarning(); }, error: (error: HttpErrorResponse) => { this.analysisLoading.set(false); if (this.isMissingStaging(error)) this.reset(); else this.fail('No fue posible analizar el archivo', error); } }); }
  private loadResult(id: string, optional = false): void { this.api.result(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({ next: (report) => { this.report.set(report);this.addWarnings('Resultado de la importación',report.warnings??[]); this.busy.set(false); }, error: (error: HttpErrorResponse) => { this.busy.set(false); if (!optional) this.fail('No fue posible recuperar el resultado', error); } }); }
  private startPolling(id: string): void {
    this.stopPolling();
    this.polling = interval(2500).pipe(startWith(0), switchMap(() => this.api.status(id)),takeUntil(this.resetRequests$), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => {
      this.executionStarting.set(false);
      this.job.set(job);
      if (job.status === 'COMPLETED') { this.stopPolling(); this.busy.set(false);this.operationNotice.set(null); this.loadResult(id); void Swal.fire('Importación completada', 'Consulta el resumen y descarga el reporte si lo necesitas.', 'success'); }
      else if (job.status === 'FAILED') { this.stopPolling(); this.busy.set(false);this.operationNotice.set(null); this.loadResult(id, true); this.loadError(id,job); }
      else if (job.status === 'READY') { this.stopPolling(); this.loadAnalysis(id); }
    },error:(error:HttpErrorResponse)=>{this.stopPolling();this.fail('No fue posible consultar el avance de la importación',error);} });
  }
  private refreshStatus(id: string): void { this.api.status(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({ next: (job) => this.job.set(job) }); }
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
  private fail(title: string, error: HttpErrorResponse): void { this.busy.set(false); this.analysisLoading.set(false);this.executionStarting.set(false);const structured=this.structuredError(error),id=this.importId();if(structured){if(id&&structured.processId!=='No asignado')this.api.error(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(detail)=>this.openError(detail),error:()=>this.openError(structured)});else this.openError(structured);return;}if(id)this.api.error(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(detail)=>this.openError(detail),error:()=>this.showLocalError(title,error)});else this.api.active().pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(job)=>{if(job?.status==='FAILED'){this.importId.set(job.id);this.job.set(job);this.loadError(job.id,job);}else this.showLocalError(title,error);},error:()=>this.showLocalError(title,error)}); }
  private structuredError(error:HttpErrorResponse):LegacyImportError|null{const value=error.error;if(!value||typeof value!=='object'||!value.stage||!value.message)return null;return {processId:value.processId??'No asignado',filename:value.filename??this.file()?.name??null,inspectionId:value.inspectionId??null,inspectionNumber:value.inspectionNumber??null,stage:value.stage,status:value.status??`HTTP ${error.status}`,message:value.message,rootCause:value.rootCause??null,causes:Array.isArray(value.causes)?value.causes:[],exceptionType:value.exceptionType??null,technicalDetail:value.technicalDetail??null,occurredAt:value.occurredAt??new Date().toISOString()};}
  loadError(id:string,job:LegacyImportJobStatus):void{this.api.error(id).pipe(takeUntil(this.resetRequests$),takeUntilDestroyed(this.destroyRef)).subscribe({next:(detail)=>this.openError(detail),error:()=>this.openError({processId:id,filename:this.file()?.name??null,inspectionId:this.homologation()?.inspectionId??null,inspectionNumber:this.homologation()?.inspectionNumber??null,stage:this.phaseName(job.phase),status:this.statusName(job.status),message:this.visibleError(job.errorMessage),rootCause:null,causes:[],exceptionType:null,technicalDetail:null,occurredAt:new Date().toISOString()})});}
  private showLocalError(title:string,error:HttpErrorResponse):void{const received=String(error.error?.detail??error.error?.message??error.message??'No fue posible completar la operación.');this.openError({processId:this.importId()??'No asignado',filename:this.file()?.name??null,inspectionId:this.homologation()?.inspectionId??null,inspectionNumber:this.homologation()?.inspectionNumber??null,stage:title,status:`HTTP ${error.status||'sin respuesta'}`,message:this.visibleError(received),rootCause:null,causes:[],exceptionType:null,technicalDetail:null,occurredAt:new Date().toISOString()});}
  private openError(error:LegacyImportError):void{this.errorDiagnostic.set(error);const causes=(error.causes??[]).map((cause)=>`<li>${this.escapeHtml(cause)}</li>`).join('');const technical=this.escapeHtml(error.technicalDetail||error.rootCause||'');const reference=error.processId&&error.processId!=='No asignado'?`<p><strong>Referencia del proceso:</strong> ${this.escapeHtml(error.processId)}</p>`:'<p>No hay más detalle disponible. Utiliza la fecha y hora del reporte para localizar el error en el servidor.</p>';const detail=`<details><summary>Ver detalle técnico</summary>${reference}${causes?`<p><strong>Causas internas:</strong></p><ul>${causes}</ul>`:''}${technical?`<pre id="legacy-error-detail">${technical}</pre>`:''}<button type="button" id="copy-error-detail" class="swal2-styled">Copiar detalle</button></details>`;void Swal.fire({icon:'error',title:'Error en la importación histórica',html:`<div class="legacy-error"><p><strong>Etapa:</strong> ${this.escapeHtml(this.phaseName(error.stage))}</p><p><strong>Causa:</strong> ${this.escapeHtml(error.message)}</p>${detail}<button type="button" id="download-error-report" class="swal2-styled">Descargar reporte de error</button></div>`,confirmButtonText:'Cerrar',didOpen:()=>{document.getElementById('copy-error-detail')?.addEventListener('click',()=>void navigator.clipboard.writeText([error.processId,...(error.causes??[]),error.technicalDetail||error.rootCause||''].filter(Boolean).join('\n')));document.getElementById('download-error-report')?.addEventListener('click',()=>this.downloadError());}});}
  private saveBlob(data:Blob,filename:string):void{const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);}
  private escapeHtml(value: string): string { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character); }
}
