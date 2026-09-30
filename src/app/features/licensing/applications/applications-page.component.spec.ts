import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationsPageComponent } from './applications-page.component';
import { LicensingApi } from '../services/licensing.api';
import { LicensedApplication } from '../models/licensing.model';

describe('ApplicationsPageComponent', () => {
  const record: LicensedApplication = {id:'A1',code:'ETIC_INSPECCIONES',name:'ETIC Inspecciones',packageName:'com.etic.inspecciones',licensingMode:'DEVICE_ONLY',status:'ACTIVE'};
  function setup() {
    const api = {applications:vi.fn(()=>of([record])),createApplication:vi.fn(()=>of(record)),updateApplication:vi.fn(()=>of(record))};
    return {component:new ApplicationsPageComponent(api as unknown as LicensingApi),api};
  }

  it('does not include code in the create form or request', () => {
    const {component,api}=setup();
    component.open();
    expect(component.form.contains('code')).toBe(false);
    component.form.patchValue({name:'ETIC Inspecciones',packageName:'com.etic.inspecciones',licensingMode:'DEVICE_ONLY',status:'ACTIVE'});
    component.save();
    expect(api.createApplication).toHaveBeenCalledWith({name:'ETIC Inspecciones',packageName:'com.etic.inspecciones',licensingMode:'DEVICE_ONLY',status:'ACTIVE'});
  });

  it('does not send code when editing an application', () => {
    const {component,api}=setup();
    component.open(record);
    expect(component.form.contains('code')).toBe(false);
    component.form.patchValue({name:'ETIC Inspecciones Termográficas'});
    component.save();
    expect(api.updateApplication).toHaveBeenCalledWith('A1',{name:'ETIC Inspecciones Termográficas',packageName:'com.etic.inspecciones',licensingMode:'DEVICE_ONLY',status:'ACTIVE'});
  });
});
