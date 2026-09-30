import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DevicesPageComponent } from './devices-page.component';
import { LicensingApi } from '../services/licensing.api';

describe('DevicesPageComponent',()=>{
  function setup(){const created={device:{id:'D1',status:'PENDING'},enrollmentCode:'ETIC-K7P2-M9DX',expiresAt:'2026-09-26T10:00:00'};const api={devices:vi.fn(()=>of([])),createDevice:vi.fn(()=>of(created)),updateDevice:vi.fn(),changeDeviceStatus:vi.fn(),regenerateEnrollmentCode:vi.fn()};return {component:new DevicesPageComponent(api as unknown as LicensingApi),api,created};}
  it('creates a manual device without technical identity fields',()=>{const {component,api,created}=setup();component.openCreate();component.form.patchValue({displayName:'Tablet 01',manufacturer:'Samsung',model:'A9',androidVersion:'14',initialStatus:'PENDING',notes:'Mantenimiento'});component.save();expect(api.createDevice).toHaveBeenCalledWith({displayName:'Tablet 01',manufacturer:'Samsung',model:'A9',androidVersion:'14',initialStatus:'PENDING',notes:'Mantenimiento'});expect(component.enrollment()).toEqual(created);expect(component.form.contains('publicKey')).toBe(false);expect(component.form.contains('androidId')).toBe(false);});
  it('provides explicit text labels for every device status',()=>{const {component}=setup();expect(['PENDING','ENROLLED','ACTIVE','SUSPENDED','REVOKED'].map(value=>component.statusLabel(value as any))).toEqual(['Pendiente','Enrolado','Activo','Suspendido','Revocado']);});
});
