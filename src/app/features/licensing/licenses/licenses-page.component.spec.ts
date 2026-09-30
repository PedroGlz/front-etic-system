import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { LicensesPageComponent } from './licenses-page.component';

describe('LicensesPageComponent',()=>{
  it('keeps pending devices available and exposes the pending operational label',()=>{const pending={id:'D1',status:'PENDING',displayName:'Tablet pendiente'};const api={licenses:vi.fn(()=>of([])),applications:vi.fn(()=>of([])),devices:vi.fn(()=>of([pending]))};const users={list:vi.fn(()=>of([]))};const component=new LicensesPageComponent(api as any,users as any);expect(component.devices()).toEqual([pending]);component.form.controls.deviceId.setValue('D1');expect(component.selectedDevice()?.status).toBe('PENDING');expect(component.operationalLabel('PENDING_ENROLLMENT')).toBe('Pendiente de enrolamiento');});
});
