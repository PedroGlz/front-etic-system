import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';
import { UsersDirectoryApi } from '@core/users/users-directory.api';
import { UserOption } from '@core/users/user-option.model';
import { ModuleTableShellComponent } from '@shared/components/module-table-shell/module-table-shell.component';
import { LicensedApplication, UserApplicationAccess } from '../models/licensing.model';
import { LicensingApi } from '../services/licensing.api';

@Component({
  selector: 'app-licensing-access',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule, TooltipModule, ModuleTableShellComponent],
  templateUrl: './access-page.component.html',
  styleUrl: './access-page.component.scss'
})
export class AccessPageComponent {
  readonly records = signal<UserApplicationAccess[]>([]);
  readonly users = signal<UserOption[]>([]);
  readonly applications = signal<LicensedApplication[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialog = signal(false);
  readonly editing = signal<UserApplicationAccess | null>(null);
  form = this.buildForm();

  constructor(private readonly api: LicensingApi, private readonly usersApi: UsersDirectoryApi) { this.load(); }

  load(): void {
    this.loading.set(true);
    forkJoin({ access: this.api.access(), applications: this.api.applications(), users: this.usersApi.list() }).subscribe({
      next: value => {
        this.records.set(value.access);
        this.applications.set(value.applications);
        this.users.set(value.users);
        this.loading.set(false);
      },
      error: error => { this.loading.set(false); this.showError(error); }
    });
  }

  userName(id: string): string {
    const user = this.users().find(item => item.id === id);
    return user ? `${user.name} (${user.username})` : id;
  }

  open(row?: UserApplicationAccess): void {
    this.editing.set(row ?? null);
    this.form = this.buildForm(row);
    this.dialog.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.validUntil && value.validUntil < value.validFrom) {
      void Swal.fire('Validación', 'La fecha final precede a la inicial', 'warning');
      return;
    }
    const payload = { ...value, validUntil: value.validUntil || null };
    this.saving.set(true);
    const row = this.editing();
    const request = row ? this.api.updateAccess(row.id, payload) : this.api.createAccess(payload);
    request.subscribe({
      next: () => { this.saving.set(false); this.dialog.set(false); this.load(); },
      error: error => { this.saving.set(false); this.showError(error); }
    });
  }

  changeStatus(row: UserApplicationAccess, status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED'): void {
    this.api.updateAccess(row.id, {
      userId: row.userId, applicationId: row.applicationId, status,
      validFrom: row.validFrom, validUntil: row.validUntil, maxDevices: row.maxDevices
    }).subscribe({ next: () => this.load(), error: error => this.showError(error) });
  }

  private buildForm(row?: UserApplicationAccess) {
    return new FormGroup({
      userId: new FormControl(row?.userId ?? '', { nonNullable: true, validators: Validators.required }),
      applicationId: new FormControl(row?.applicationId ?? '', { nonNullable: true, validators: Validators.required }),
      status: new FormControl(row?.status ?? 'ACTIVE', { nonNullable: true, validators: Validators.required }),
      validFrom: new FormControl(row?.validFrom ?? new Date().toISOString().slice(0, 10), { nonNullable: true, validators: Validators.required }),
      validUntil: new FormControl(row?.validUntil ?? '', { nonNullable: true }),
      maxDevices: new FormControl(row?.maxDevices ?? 1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] })
    });
  }

  private showError(error: { error?: { detail?: string } }): void {
    void Swal.fire('Error', error.error?.detail ?? 'No fue posible completar la operación', 'error');
  }
}
