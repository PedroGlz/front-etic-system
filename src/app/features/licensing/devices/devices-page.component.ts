import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import Swal from 'sweetalert2';
import { ModuleTableShellComponent } from '@shared/components/module-table-shell/module-table-shell.component';
import { DeviceStatus, LicensedDevice, ManualDeviceCreated } from '../models/licensing.model';
import { LicensingApi } from '../services/licensing.api';

@Component({selector:'app-licensing-devices',imports:[ReactiveFormsModule,ButtonModule,DialogModule,InputTextModule,TableModule,TagModule,TooltipModule,ModuleTableShellComponent],templateUrl:'./devices-page.component.html',styleUrl:'./devices-page.component.scss'})
export class DevicesPageComponent{
  readonly records=signal<LicensedDevice[]>([]);readonly loading=signal(true);readonly saving=signal(false);readonly dialog=signal(false);readonly editing=signal<LicensedDevice|null>(null);readonly detail=signal<LicensedDevice|null>(null);readonly enrollment=signal<ManualDeviceCreated|null>(null);form=this.buildForm();
  constructor(private readonly api:LicensingApi){this.load();}
  load(){this.loading.set(true);this.api.devices().subscribe({next:v=>{this.records.set(v);this.loading.set(false);},error:e=>{this.loading.set(false);void Swal.fire('Error',e.error?.detail??'No fue posible cargar dispositivos','error');}});}
  openCreate(){this.editing.set(null);this.form=this.buildForm();this.dialog.set(true);}
  openEdit(r:LicensedDevice){this.editing.set(r);this.form=this.buildForm(r);this.dialog.set(true);}
  close(){this.dialog.set(false);}
  save(){if(this.form.invalid){this.form.markAllAsTouched();return;}this.saving.set(true);const raw=this.form.getRawValue();const current=this.editing();const complete=(created?:ManualDeviceCreated)=>{this.saving.set(false);this.close();if(created)this.enrollment.set(created);this.load();};const fail=(e:any)=>{this.saving.set(false);void Swal.fire('Error',e.error?.detail??'No fue posible guardar','error');};if(current){this.api.updateDevice(current.id,{displayName:raw.displayName,manufacturer:raw.manufacturer,model:raw.model,androidVersion:raw.androidVersion,notes:raw.notes}).subscribe({next:()=>complete(),error:fail});}else{this.api.createDevice(raw).subscribe({next:complete,error:fail});}}
  action(r:LicensedDevice,action:'activate'|'suspend'|'revoke'){this.api.changeDeviceStatus(r.id,action).subscribe({next:()=>this.load(),error:e=>void Swal.fire('Error',e.error?.detail??'No fue posible cambiar el estado','error')});}
  regenerate(r:LicensedDevice){this.api.regenerateEnrollmentCode(r.id).subscribe({next:value=>this.enrollment.set({device:r,enrollmentCode:value.code,expiresAt:value.expiresAt}),error:e=>void Swal.fire('Error',e.error?.detail??'No fue posible generar el código','error')});}
  async copyEnrollment(){const code=this.enrollment()?.enrollmentCode;if(code){await navigator.clipboard.writeText(code);void Swal.fire({icon:'success',title:'Código copiado',timer:1200,showConfirmButton:false});}}
  statusLabel(value:DeviceStatus){return {PENDING:'Pendiente',ENROLLED:'Enrolado',ACTIVE:'Activo',SUSPENDED:'Suspendido',REVOKED:'Revocado',INACTIVE:'Inactivo'}[value];}
  statusSeverity(value:DeviceStatus):'success'|'info'|'warn'|'danger'|'secondary'{return value==='ACTIVE'?'success':value==='ENROLLED'?'info':value==='PENDING'||value==='SUSPENDED'?'warn':value==='REVOKED'?'danger':'secondary';}
  fingerprint(value:string|null){return value?`SHA256: ${value.slice(0,8)}:...:${value.slice(-4)}`:'Sin vincular';}
  private buildForm(r?:LicensedDevice){return new FormGroup({displayName:new FormControl(r?.displayName??'',{nonNullable:true,validators:[Validators.required,Validators.maxLength(150)]}),manufacturer:new FormControl(r?.manufacturer??'',{nonNullable:true,validators:Validators.maxLength(100)}),model:new FormControl(r?.model??'',{nonNullable:true,validators:Validators.maxLength(100)}),androidVersion:new FormControl(r?.androidVersion??'',{nonNullable:true,validators:Validators.maxLength(50)}),initialStatus:new FormControl<'PENDING'|'SUSPENDED'>('PENDING',{nonNullable:true}),notes:new FormControl(r?.notes??'',{nonNullable:true,validators:Validators.maxLength(2000)})});}
}
