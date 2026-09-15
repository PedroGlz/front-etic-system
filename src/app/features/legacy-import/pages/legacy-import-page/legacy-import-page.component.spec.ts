import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Swal from 'sweetalert2';
import { LegacyEtlReport, LegacyImportAnalysis, LegacyImportJobStatus } from '../../models/legacy-import.model';
import { LegacyImportApi } from '../../services/legacy-import.api';
import { LegacyImportPageComponent } from './legacy-import-page.component';

describe('LegacyImportPageComponent', () => {
  const status$=new Subject<LegacyImportJobStatus>();
  const report:LegacyEtlReport={importId:'JOB',tables:[],legacyProblems:0,problemInspections:0,pieProblemInspections:0,targetProblems:0,chronicFamilies:0,historyRelations:0,additionalPhotos:0,unknownTemperatureUnits:0,outcomes:[],warnings:[]};
  const analysis={alerts:[]} as unknown as LegacyImportAnalysis;
  const api={active:vi.fn(),status:vi.fn(()=>status$),analysis:vi.fn(),upload:vi.fn(()=>of(new HttpResponse({body:{id:'JOB',status:'READY'}}))),execute:vi.fn(()=>of(void 0)),result:vi.fn(()=>of(report)),markdown:vi.fn(()=>of(new Blob(['reporte'])))};

  beforeEach(async()=>{
    vi.useFakeTimers();Object.values(api).forEach(mock=>mock.mockClear());vi.spyOn(Swal,'fire').mockResolvedValue({isConfirmed:true} as never);
    await TestBed.configureTestingModule({imports:[LegacyImportPageComponent]}).overrideComponent(LegacyImportPageComponent,{set:{providers:[{provide:LegacyImportApi,useValue:api}]}}).compileComponents();
  });
  afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();status$.observers.slice().forEach(observer=>observer.complete());});

  it('starts clean when there is no active job',()=>{
    api.active.mockReturnValue(of(null));const fixture=TestBed.createComponent(LegacyImportPageComponent);fixture.detectChanges();
    expect(fixture.componentInstance.importId()).toBeNull();expect(fixture.componentInstance.report()).toBeNull();expect(api.analysis).not.toHaveBeenCalled();
  });

  it('restores a ready job and loads its analysis',()=>{
    api.active.mockReturnValue(of(job('READY')));api.analysis.mockReturnValue(of(analysis));const fixture=TestBed.createComponent(LegacyImportPageComponent);fixture.detectChanges();
    expect(fixture.componentInstance.importId()).toBe('JOB');expect(fixture.componentInstance.analysis()).toBe(analysis);expect(api.analysis).toHaveBeenCalledWith('JOB');expect(api.execute).not.toHaveBeenCalled();
  });

  it('recovers a processing job without calling execute and stops polling on destroy',()=>{
    api.active.mockReturnValue(of(job('PROCESSING')));const fixture=TestBed.createComponent(LegacyImportPageComponent);fixture.detectChanges();
    expect(fixture.componentInstance.importId()).toBe('JOB');expect(api.execute).not.toHaveBeenCalled();const calls=api.status.mock.calls.length;
    fixture.destroy();vi.advanceTimersByTime(5000);expect(api.status.mock.calls.length).toBe(calls);
  });

  it('shows the result without downloading automatically',()=>{
    api.active.mockReturnValue(of(job('PROCESSING')));const fixture=TestBed.createComponent(LegacyImportPageComponent);fixture.detectChanges();status$.next(job('COMPLETED'));
    expect(fixture.componentInstance.report()).toEqual(report);expect(api.markdown).not.toHaveBeenCalled();
  });

  it('clears an orphan ready job without showing an error',()=>{
    api.active.mockReturnValue(of(job('READY')));api.analysis.mockReturnValue(throwError(()=>new HttpErrorResponse({status:404,error:{detail:'Staging de importación legacy no encontrado'}})));const fixture=TestBed.createComponent(LegacyImportPageComponent);fixture.detectChanges();
    expect(fixture.componentInstance.importId()).toBeNull();expect(fixture.componentInstance.analysis()).toBeNull();expect(Swal.fire).not.toHaveBeenCalled();
  });

  it.each(['COMPLETED','FAILED'] as const)('does not restore a %s job',status=>{
    api.active.mockReturnValue(of(job(status)));const fixture=TestBed.createComponent(LegacyImportPageComponent);fixture.detectChanges();
    expect(fixture.componentInstance.importId()).toBeNull();expect(api.analysis).not.toHaveBeenCalled();expect(api.status).not.toHaveBeenCalled();
  });

  it('downloads only markdown by explicit action and new import clears state',()=>{
    api.active.mockReturnValue(of(null));const fixture=TestBed.createComponent(LegacyImportPageComponent);fixture.detectChanges();fixture.componentInstance.importId.set('JOB');fixture.componentInstance.report.set(report);
    vi.stubGlobal('URL',{createObjectURL:vi.fn(()=> 'blob:test'),revokeObjectURL:vi.fn()});vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
    fixture.componentInstance.downloadReport();expect(api.markdown).toHaveBeenCalledWith('JOB');
    fixture.componentInstance.reset();expect(fixture.componentInstance.importId()).toBeNull();expect(fixture.componentInstance.report()).toBeNull();
  });

  function job(status:LegacyImportJobStatus['status']):LegacyImportJobStatus{return{id:'JOB',status,phase:'PROBLEMS',progress:82,errorMessage:null};}
});
