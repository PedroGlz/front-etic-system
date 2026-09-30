import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { ModuleTableShellComponent } from '@shared/components/module-table-shell/module-table-shell.component';
import { LicensedApplication, LicensingMode } from '../models/licensing.model';
import { LicensingApi } from '../services/licensing.api';

@Component({selector:'app-licensing-applications',imports:[ReactiveFormsModule,ButtonModule,DialogModule,InputTextModule,TableModule,TagModule,TooltipModule,ModuleTableShellComponent],templateUrl:'./applications-page.component.html',styleUrl:'./applications-page.component.scss'})
export class ApplicationsPageComponent {
  readonly records=signal<LicensedApplication[]>([]); readonly loading=signal(true); readonly saving=signal(false); readonly dialog=signal(false); readonly editing=signal<LicensedApplication|null>(null);
  form=this.buildForm();
  constructor(private readonly api:LicensingApi){this.load();}
  load(){this.loading.set(true);this.api.applications().subscribe({next:v=>{this.records.set(v);this.loading.set(false);},error:e=>{this.loading.set(false);void Swal.fire('Error',e.error?.detail??'No fue posible cargar aplicaciones','error');}});}
  open(record?:LicensedApplication){this.editing.set(record??null);this.form=this.buildForm(record);this.dialog.set(true);}
  close(){this.dialog.set(false);}
  save(){if(this.form.invalid){this.form.markAllAsTouched();return;}this.saving.set(true);const value=this.form.getRawValue();const current=this.editing();const request=current?this.api.updateApplication(current.id,value):this.api.createApplication(value);request.subscribe({next:()=>{this.saving.set(false);this.close();this.load();},error:e=>{this.saving.set(false);void Swal.fire('Error',e.error?.detail??'No fue posible guardar','error');}});}
  toggle(record:LicensedApplication){this.api.updateApplication(record.id,{name:record.name,packageName:record.packageName,licensingMode:record.licensingMode,status:record.status==='ACTIVE'?'INACTIVE':'ACTIVE'}).subscribe({next:()=>this.load(),error:e=>void Swal.fire('Error',e.error?.detail??'No fue posible cambiar el estado','error')});}
  private buildForm(r?:LicensedApplication){return new FormGroup({name:new FormControl(r?.name??'',{nonNullable:true,validators:[Validators.required,Validators.maxLength(150)]}),packageName:new FormControl(r?.packageName??'',{nonNullable:true,validators:[Validators.required,Validators.maxLength(255)]}),licensingMode:new FormControl<LicensingMode>(r?.licensingMode??'USER_DEVICE',{nonNullable:true,validators:[Validators.required]}),status:new FormControl(r?.status??'ACTIVE',{nonNullable:true})});}
}
