import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-endpoints';
import { AccessRequest, ApplicationRequest, ApplicationVersion, DeviceRequest, EnrollmentCodeResponse, License, LicensedApplication, LicensedDevice, LicenseRequest, LicenseStatus, ManualDeviceCreated, ManualDeviceRequest, UserApplicationAccess } from '../models/licensing.model';

@Injectable({ providedIn: 'root' })
export class LicensingApi {
  private readonly base = `${API_BASE_URL}/licensing`;
  constructor(private readonly http: HttpClient) {}
  applications():Observable<LicensedApplication[]>{return this.http.get<LicensedApplication[]>(`${this.base}/applications`,{withCredentials:true});}
  createApplication(value:ApplicationRequest):Observable<LicensedApplication>{return this.http.post<LicensedApplication>(`${this.base}/applications`,value,{withCredentials:true});}
  updateApplication(id:string,value:ApplicationRequest):Observable<LicensedApplication>{return this.http.put<LicensedApplication>(`${this.base}/applications/${id}`,value,{withCredentials:true});}
  devices():Observable<LicensedDevice[]>{return this.http.get<LicensedDevice[]>(`${this.base}/devices`,{withCredentials:true});}
  createDevice(value:ManualDeviceRequest):Observable<ManualDeviceCreated>{return this.http.post<ManualDeviceCreated>(`${this.base}/devices`,value,{withCredentials:true});}
  updateDevice(id:string,value:DeviceRequest):Observable<LicensedDevice>{return this.http.put<LicensedDevice>(`${this.base}/devices/${id}`,value,{withCredentials:true});}
  changeDeviceStatus(id:string,action:'activate'|'suspend'|'revoke'):Observable<LicensedDevice>{return this.http.post<LicensedDevice>(`${this.base}/devices/${id}/${action}`,{},{withCredentials:true});}
  regenerateEnrollmentCode(id:string):Observable<EnrollmentCodeResponse>{return this.http.post<EnrollmentCodeResponse>(`${this.base}/devices/${id}/enrollment-code`,{},{withCredentials:true});}
  licenses():Observable<License[]>{return this.http.get<License[]>(`${this.base}/licenses`,{withCredentials:true});}
  createLicense(value:LicenseRequest):Observable<License>{return this.http.post<License>(`${this.base}/licenses`,value,{withCredentials:true});}
  updateLicense(id:string,value:LicenseRequest):Observable<License>{return this.http.put<License>(`${this.base}/licenses/${id}`,value,{withCredentials:true});}
  changeLicenseStatus(id:string,status:LicenseStatus):Observable<License>{return this.http.post<License>(`${this.base}/licenses/${id}/${status.toLowerCase()}`,{},{withCredentials:true});}
  versions():Observable<ApplicationVersion[]>{return this.http.get<ApplicationVersion[]>(`${this.base}/versions`,{withCredentials:true});}
  uploadVersion(form:FormData):Observable<ApplicationVersion>{return this.http.post<ApplicationVersion>(`${this.base}/versions`,form,{withCredentials:true});}
  publishVersion(id:string,published:boolean):Observable<ApplicationVersion>{return this.http.put<ApplicationVersion>(`${this.base}/versions/${id}/publication`,{published},{withCredentials:true});}
  downloadVersion(id:string):Observable<Blob>{return this.http.get(`${this.base}/versions/${id}/download`,{withCredentials:true,responseType:'blob'});}
  access():Observable<UserApplicationAccess[]>{return this.http.get<UserApplicationAccess[]>(`${this.base}/access`,{withCredentials:true});}
  createAccess(value:AccessRequest):Observable<UserApplicationAccess>{return this.http.post<UserApplicationAccess>(`${this.base}/access`,value,{withCredentials:true});}
  updateAccess(id:string,value:AccessRequest):Observable<UserApplicationAccess>{return this.http.put<UserApplicationAccess>(`${this.base}/access/${id}`,value,{withCredentials:true});}
}
